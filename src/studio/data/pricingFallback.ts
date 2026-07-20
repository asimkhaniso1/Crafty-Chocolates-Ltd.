/**
 * Fallback pricing rules for the Chocolate Design Studio.
 * Used when Supabase is unconfigured or the `pricing_rules` fetch fails.
 * Keys are aligned with:
 *  - product keys in types.ts (ProductKey) for base_unit
 *  - packagingOptions.ts `type` strings for packaging
 *  - DesignExtras keys in types.ts for per-box extras
 *
 * All values in PKR.
 */
import type { PricingRule } from '../types';

export const PRICING_FALLBACK: PricingRule[] = [
  // --- Base unit price per piece, by product ---
  { rule_key: 'base.bite', kind: 'base_unit', value: 120, meta: { product: 'bite' } },
  { rule_key: 'base.signature', kind: 'base_unit', value: 260, meta: { product: 'signature' } },
  { rule_key: 'base.bar', kind: 'base_unit', value: 420, meta: { product: 'bar' } },

  // --- Add-on unit price per piece (chocolate type / emboss finish) ---
  { rule_key: 'chocolate.mixed', kind: 'addon_unit', value: 15, meta: { group: 'chocolate' } },
  { rule_key: 'emboss.emboss', kind: 'addon_unit', value: 0, meta: { group: 'emboss' } },
  { rule_key: 'emboss.deboss', kind: 'addon_unit', value: 0, meta: { group: 'emboss' } },
  { rule_key: 'emboss.gold', kind: 'addon_unit', value: 40, meta: { group: 'emboss' } },
  { rule_key: 'emboss.silver', kind: 'addon_unit', value: 35, meta: { group: 'emboss' } },

  // --- Packaging: price per box/wrapper, keyed to packagingOptions `type` ---
  { rule_key: 'pkg.individual', kind: 'packaging', value: 25, meta: { type: 'individual' } },
  { rule_key: 'pkg.box-2', kind: 'packaging', value: 180, meta: { type: 'box-2' } },
  { rule_key: 'pkg.box-4', kind: 'packaging', value: 260, meta: { type: 'box-4' } },
  { rule_key: 'pkg.box-6', kind: 'packaging', value: 340, meta: { type: 'box-6' } },
  { rule_key: 'pkg.box-9', kind: 'packaging', value: 450, meta: { type: 'box-9' } },
  { rule_key: 'pkg.box-12', kind: 'packaging', value: 560, meta: { type: 'box-12' } },
  { rule_key: 'pkg.box-16', kind: 'packaging', value: 700, meta: { type: 'box-16' } },
  { rule_key: 'pkg.box-24', kind: 'packaging', value: 950, meta: { type: 'box-24' } },
  { rule_key: 'pkg.box-36', kind: 'packaging', value: 1300, meta: { type: 'box-36' } },
  // Premium boxes: base box price +40%
  { rule_key: 'pkg.luxury-magnetic', kind: 'packaging', value: 630, meta: { type: 'luxury-magnetic' } },
  { rule_key: 'pkg.drawer', kind: 'packaging', value: 784, meta: { type: 'drawer' } },
  { rule_key: 'pkg.window', kind: 'packaging', value: 476, meta: { type: 'window' } },
  { rule_key: 'pkg.corporate', kind: 'packaging', value: 980, meta: { type: 'corporate' } },
  { rule_key: 'pkg.wedding', kind: 'packaging', value: 364, meta: { type: 'wedding' } },

  // --- Per-box extras (from DesignExtras) ---
  { rule_key: 'extra.ribbon', kind: 'addon_unit', value: 60, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.sleevePrint', kind: 'addon_unit', value: 120, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.greetingCard', kind: 'addon_unit', value: 90, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.waxSeal', kind: 'addon_unit', value: 70, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.qr', kind: 'addon_unit', value: 0, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.insideMessage', kind: 'addon_unit', value: 0, meta: { group: 'extra', per: 'box' } },

  // --- Minimum order quantity, by product ---
  { rule_key: 'moq.bite', kind: 'moq', value: 50, meta: { product: 'bite' } },
  { rule_key: 'moq.signature', kind: 'moq', value: 25, meta: { product: 'signature' } },
  { rule_key: 'moq.bar', kind: 'moq', value: 25, meta: { product: 'bar' } },

  // --- Quantity discount tiers (best applicable multiplier applies) ---
  { rule_key: 'tier.50', kind: 'qty_tier', value: 0.95, meta: { min_qty: 50, multiplier: 0.95 } },
  { rule_key: 'tier.100', kind: 'qty_tier', value: 0.9, meta: { min_qty: 100, multiplier: 0.9 } },
  { rule_key: 'tier.250', kind: 'qty_tier', value: 0.85, meta: { min_qty: 250, multiplier: 0.85 } },
  { rule_key: 'tier.500', kind: 'qty_tier', value: 0.8, meta: { min_qty: 500, multiplier: 0.8 } },

  // --- One-time fees ---
  { rule_key: 'mold.custom_logo', kind: 'mold_fee', value: 15000, meta: { waive_above: 500 } },
  { rule_key: 'artwork.setup', kind: 'artwork_fee', value: 3000, meta: { waive_above: 250 } },

  // --- Lead time (days) ---
  { rule_key: 'lead.base', kind: 'lead_time', value: 7, meta: {} },
  { rule_key: 'lead.custom_mold', kind: 'lead_time', value: 5, meta: { extraWhenLogo: true } },

  // --- Delivery (extra days added on top of lead time) ---
  { rule_key: 'delivery.karachi', kind: 'delivery', value: 2, meta: { region: 'karachi' } },
];
