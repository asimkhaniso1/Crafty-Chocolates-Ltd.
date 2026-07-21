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
  { rule_key: 'base.slim', kind: 'base_unit', value: 200, meta: { product: 'slim' } },

  // --- Add-on unit price per piece (chocolate type) ---
  { rule_key: 'chocolate.semidark', kind: 'addon_unit', value: 15, meta: { group: 'chocolate' } },

  // --- Packaging: one flat rule for every packaging type ---
  // Rs 1000 per started block of `per_pcs` pieces, regardless of box type.
  { rule_key: 'pkg.flat', kind: 'packaging', value: 1000, meta: { per_pcs: 50 } },

  // --- Center message bar (one per X+1 box) ---
  { rule_key: 'bar.center', kind: 'addon_unit', value: 450, meta: { group: 'bar', per: 'box' } },

  // --- Wedding favour box bar (one 60×60mm bar per box) ---
  { rule_key: 'bar.wedding', kind: 'addon_unit', value: 350, meta: { group: 'bar', per: 'box' } },

  // --- Printed wrapper (per wrapped piece) ---
  { rule_key: 'extra.printedWrapper', kind: 'addon_unit', value: 20, meta: { group: 'extra', per: 'unit' } },

  // --- Per-box extras (from DesignExtras) ---
  { rule_key: 'extra.ribbon', kind: 'addon_unit', value: 60, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.sleevePrint', kind: 'addon_unit', value: 120, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.greetingCard', kind: 'addon_unit', value: 90, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.waxSeal', kind: 'addon_unit', value: 70, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.qr', kind: 'addon_unit', value: 0, meta: { group: 'extra', per: 'box' } },
  { rule_key: 'extra.insideMessage', kind: 'addon_unit', value: 0, meta: { group: 'extra', per: 'box' } },

  // --- Minimum order quantity, by product ---
  // The studio is positioned for bulk custom orders: every line clamps at
  // the same 50-piece floor.
  { rule_key: 'moq.bite', kind: 'moq', value: 50, meta: { product: 'bite' } },
  { rule_key: 'moq.signature', kind: 'moq', value: 50, meta: { product: 'signature' } },
  { rule_key: 'moq.bar', kind: 'moq', value: 50, meta: { product: 'bar' } },
  { rule_key: 'moq.slim', kind: 'moq', value: 50, meta: { product: 'slim' } },

  // --- Quantity discount tiers (best applicable multiplier applies) ---
  { rule_key: 'tier.50', kind: 'qty_tier', value: 0.95, meta: { min_qty: 50, multiplier: 0.95 } },
  { rule_key: 'tier.100', kind: 'qty_tier', value: 0.9, meta: { min_qty: 100, multiplier: 0.9 } },
  { rule_key: 'tier.250', kind: 'qty_tier', value: 0.85, meta: { min_qty: 250, multiplier: 0.85 } },
  { rule_key: 'tier.500', kind: 'qty_tier', value: 0.8, meta: { min_qty: 500, multiplier: 0.8 } },

  // --- One-time fees ---
  // One combined fixed Design & mold fee, charged once per custom order at any quantity.
  { rule_key: 'fee.designMold', kind: 'mold_fee', value: 5000, meta: {} },

  // --- Lead time (days) ---
  { rule_key: 'lead.base', kind: 'lead_time', value: 7, meta: {} },
  { rule_key: 'lead.custom_mold', kind: 'lead_time', value: 5, meta: { extraWhenLogo: true } },

  // --- Delivery (extra days added on top of lead time) ---
  { rule_key: 'delivery.karachi', kind: 'delivery', value: 2, meta: { region: 'karachi' } },
];
