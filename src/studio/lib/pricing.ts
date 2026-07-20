/**
 * Pure pricing engine for the Chocolate Design Studio.
 * No I/O — takes a Design and a rule set, returns a Quote.
 */
import type { Design, PricingRule, Quote, QuoteLine } from '../types';
import { MOQ_DEFAULTS } from '../constraints';
import { getPackagingOption } from '../data/packagingOptions';
import { QUOTE_LINE_LABELS } from '../copy';

function findRule(rules: PricingRule[], key: string): PricingRule | undefined {
  return rules.find(r => r.rule_key === key);
}

function round(n: number): number {
  return Math.round(n);
}

/**
 * Compute a full price quote for the given design using the supplied rule set.
 * Rules are expected to follow the shape/keys documented in pricingFallback.ts.
 */
export function computeQuote(design: Design, rules: PricingRule[]): Quote {
  const lines: QuoteLine[] = [];
  const fees: QuoteLine[] = [];

  const product = design.product ?? 'signature';

  // --- MOQ ---
  const moqRule = findRule(rules, `moq.${product}`);
  const moq = (moqRule?.value as number | undefined) ?? MOQ_DEFAULTS[product] ?? 1;

  const rawQuantity = Math.max(1, Math.floor(design.quantity || 0));
  const quantity = Math.max(rawQuantity, moq);
  const clampedToMoq = rawQuantity < moq;

  // --- Base unit price ---
  const baseRule = findRule(rules, `base.${product}`);
  const baseUnit = (baseRule?.value as number | undefined) ?? 0;

  // --- Add-on unit price: chocolate type ---
  let addonUnit = 0;
  const chocolateRule = findRule(rules, `chocolate.${design.chocolate}`);
  if (chocolateRule) addonUnit += chocolateRule.value;

  const rawUnit = baseUnit + addonUnit;

  // --- Best applicable quantity tier discount ---
  const tierRules = rules.filter(r => r.kind === 'qty_tier');
  let multiplier = 1;
  let appliedTierPct = 0;
  for (const tier of tierRules) {
    const minQty = (tier.meta?.min_qty as number | undefined) ?? Infinity;
    const tierMultiplier = (tier.meta?.multiplier as number | undefined) ?? tier.value;
    if (quantity >= minQty && tierMultiplier < multiplier) {
      multiplier = tierMultiplier;
      appliedTierPct = round((1 - tierMultiplier) * 100);
    }
  }

  const unit = rawUnit * multiplier;
  const chocolateSubtotal = unit * quantity;

  lines.push({ label: QUOTE_LINE_LABELS.unitPrice, amount: round(unit) });
  lines.push({ label: QUOTE_LINE_LABELS.chocolateSubtotal, amount: round(chocolateSubtotal) });
  if (appliedTierPct > 0) {
    lines.push({
      label: `Volume discount (${appliedTierPct}% off unit price)`,
      amount: round(-(rawUnit - unit) * quantity),
    });
  }

  // --- Packaging ---
  let packagingCost = 0;
  let boxCount = 0;
  if (design.packaging) {
    const option = getPackagingOption(design.packaging.type);
    const perBoxCount = option?.count ?? design.packaging.count ?? 1;
    boxCount = Math.max(1, Math.ceil(quantity / Math.max(1, perBoxCount)));

    // Flat packaging rule: Rs `value` per started block of `meta.per_pcs` pieces,
    // regardless of packaging type.
    const pkgRule = findRule(rules, 'pkg.flat');
    const perPcs = (pkgRule?.meta?.per_pcs as number | undefined) ?? 50;
    const pkgBlockPrice = pkgRule?.value ?? 0;
    const pkgBlocks = Math.max(1, Math.ceil(quantity / Math.max(1, perPcs)));
    packagingCost = pkgBlockPrice * pkgBlocks;

    if (packagingCost > 0) {
      lines.push({ label: QUOTE_LINE_LABELS.packaging(pkgBlocks, perPcs), amount: round(packagingCost) });
    }

    // X+1 boxes: one large embossed message bar per box, its own quote line.
    if (option?.centerBar) {
      const barRule = findRule(rules, 'bar.center');
      const barCost = (barRule?.value ?? 0) * boxCount;
      if (barCost > 0) {
        packagingCost += barCost;
        lines.push({ label: QUOTE_LINE_LABELS.messageBar, amount: round(barCost) });
      }
    }
  }

  // --- Per-box extras ---
  let extrasCost = 0;
  const extraSpecs: { key: keyof Design['extras']; ruleKey: string; label: string }[] = [
    { key: 'ribbon', ruleKey: 'extra.ribbon', label: QUOTE_LINE_LABELS.extraRibbon },
    { key: 'sleevePrint', ruleKey: 'extra.sleevePrint', label: QUOTE_LINE_LABELS.extraSleevePrint },
    { key: 'greetingCard', ruleKey: 'extra.greetingCard', label: QUOTE_LINE_LABELS.extraGreetingCard },
    { key: 'waxSeal', ruleKey: 'extra.waxSeal', label: QUOTE_LINE_LABELS.extraWaxSeal },
    { key: 'qrUrl', ruleKey: 'extra.qr', label: QUOTE_LINE_LABELS.extraQr },
    { key: 'insideMessage', ruleKey: 'extra.insideMessage', label: QUOTE_LINE_LABELS.extraInsideMessage },
  ];
  const boxesForExtras = Math.max(1, boxCount || 1);
  for (const spec of extraSpecs) {
    const value = design.extras[spec.key];
    const isActive = typeof value === 'boolean' ? value : Boolean(value);
    if (!isActive) continue;
    const rule = findRule(rules, spec.ruleKey);
    const price = rule?.value ?? 0;
    if (price <= 0) continue;
    const cost = price * boxesForExtras;
    extrasCost += cost;
    lines.push({ label: spec.label, amount: round(cost) });
  }

  // --- Printed wrapper (per wrapped piece) ---
  if (design.extras.printedWrapper?.enabled) {
    const wrapperRule = findRule(rules, 'extra.printedWrapper');
    const wrapperCost = (wrapperRule?.value ?? 0) * quantity;
    if (wrapperCost > 0) {
      extrasCost += wrapperCost;
      lines.push({ label: QUOTE_LINE_LABELS.printedWrapper, amount: round(wrapperCost) });
    }
  }

  const subtotal = chocolateSubtotal + packagingCost + extrasCost;

  // --- One-time fees ---
  const hasLogo = Boolean(design.logo);

  // Single combined Design & mold fee, charged once per design at any
  // quantity — no waivers.
  const designMoldRule = findRule(rules, 'fee.designMold');
  if (designMoldRule) {
    fees.push({ label: QUOTE_LINE_LABELS.designMoldFee, amount: round(designMoldRule.value) });
  }

  const feesTotal = fees.reduce((sum, f) => sum + f.amount, 0);
  const total = round(subtotal + feesTotal);

  // --- Lead time & delivery ---
  const leadBaseRule = findRule(rules, 'lead.base');
  const leadCustomMoldRule = findRule(rules, 'lead.custom_mold');
  let leadDays = leadBaseRule?.value ?? 7;
  if (hasLogo && leadCustomMoldRule) leadDays += leadCustomMoldRule.value;
  if (quantity >= 500) leadDays += 2;

  const deliveryRule = findRule(rules, 'delivery.karachi');
  const deliveryDays = leadDays + (deliveryRule?.value ?? 2);

  if (clampedToMoq) {
    lines.push({ label: `Quoted at minimum order quantity (${moq})`, amount: 0 });
  }

  return {
    unit: round(unit),
    subtotal: round(subtotal),
    fees,
    total,
    moq,
    leadDays,
    deliveryDays,
    lines,
  };
}
