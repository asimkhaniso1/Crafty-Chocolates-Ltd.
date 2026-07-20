/**
 * Pure pricing engine for the Chocolate Design Studio.
 * No I/O — takes a Design and a rule set, returns a Quote.
 */
import type { Design, PackagingOption, PricingRule, Quote, QuoteLine } from '../types';
import { MOQ_DEFAULTS } from '../constraints';
import { getPackagingOption } from '../data/packagingOptions';
import { getStudioProduct } from '../data/studioProducts';
import { QUOTE_LINE_LABELS, centerBarWeightG } from '../copy';

function findRule(rules: PricingRule[], key: string): PricingRule | undefined {
  return rules.find(r => r.rule_key === key);
}

function round(n: number): number {
  return Math.round(n);
}

/**
 * Approximate total filled weight for the quote: piece weight (the
 * customer's chosen product for standard boxes, or the assorted bite weight
 * for X+1/wedding-favour ring pieces, since those are assorted rather than
 * the customer's chosen canvas) + center bar weight (X+1/wedding formats
 * only) + empty box/tin weight — each × however many boxes the quantity
 * fills. Deliberately approximate; every box weight not confirmed by a real
 * spec sheet is a placeholder estimate.
 */
export function computeEstimatedWeight(
  design: Design,
  option: PackagingOption | undefined,
  quantity: number
): number | undefined {
  const product = design.product ? getStudioProduct(design.product) : undefined;

  if (!option) {
    return product?.weightG ? round(quantity * product.weightG) : undefined;
  }

  const perBoxCount = Math.max(1, option.count || 1);
  const boxCount = Math.max(1, Math.ceil(quantity / perBoxCount));

  const pieceUnitWeight = option.centerBar
    ? getStudioProduct('bite')?.weightG ?? 10
    : product?.weightG ?? 0;
  const pieceWeight = quantity * pieceUnitWeight;

  const barWeight = option.centerBar ? boxCount * centerBarWeightG(option.type) : 0;
  const boxWeight = boxCount * (option.boxEmptyWeightG ?? 0);

  const total = pieceWeight + barWeight + boxWeight;
  return total > 0 ? round(total) : undefined;
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
  const chocolatePackagingOption = design.packaging ? getPackagingOption(design.packaging.type) : undefined;
  const isMultiPieceBoxForChocolate = Boolean(
    chocolatePackagingOption?.grid && chocolatePackagingOption.count > 1
  );
  if (isMultiPieceBoxForChocolate && design.boxMix === 'mixed') {
    // Mixed box: cells alternate milk/semi-dark, so only the semidark half
    // of the pieces carry the semidark addon. Simplest correct approach —
    // apply the addon to the unit price scaled by the actual fraction of
    // semidark cells (falls back to the alternating 50/50 split when cells
    // haven't been (re)built yet).
    const semidarkRule = findRule(rules, 'chocolate.semidark');
    if (semidarkRule) {
      const cellCount = chocolatePackagingOption!.count;
      const cells =
        design.cells.length > 0
          ? design.cells
          : Array.from({ length: cellCount }, (_, i) => ({
              chocolate: i % 2 === 0 ? 'milk' : 'semidark',
            }));
      const semidarkFraction = cells.filter(c => c.chocolate === 'semidark').length / cells.length;
      addonUnit += semidarkRule.value * semidarkFraction;
    }
  } else {
    const chocolateRule = findRule(rules, `chocolate.${design.chocolate}`);
    if (chocolateRule) addonUnit += chocolateRule.value;
  }

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
  let packagingOption: PackagingOption | undefined;
  if (design.packaging) {
    const option = getPackagingOption(design.packaging.type);
    packagingOption = option;
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

    // X+1 / wedding-favour boxes: one large embossed bar per box, its own
    // quote line. The wedding favour bar is priced and labelled separately
    // from the X+1 "message bar" (different size, different addon rule).
    if (option?.centerBar) {
      const isWeddingBar = design.packaging.type === 'wedding-favor';
      const barRule = findRule(rules, isWeddingBar ? 'bar.wedding' : 'bar.center');
      const barCost = (barRule?.value ?? 0) * boxCount;
      if (barCost > 0) {
        packagingCost += barCost;
        lines.push({
          label: isWeddingBar ? QUOTE_LINE_LABELS.weddingBar : QUOTE_LINE_LABELS.messageBar,
          amount: round(barCost),
        });
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

  const estimatedWeightG = computeEstimatedWeight(design, packagingOption, quantity);

  return {
    unit: round(unit),
    subtotal: round(subtotal),
    fees,
    total,
    moq,
    leadDays,
    deliveryDays,
    lines,
    estimatedWeightG,
  };
}
