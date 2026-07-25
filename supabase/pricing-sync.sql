-- Crafty Chocolates — Studio pricing sync
-- Run this in the Supabase SQL editor to make the live pricing_rules table
-- match the studio's calibrated values (2026-07-21). Safe to re-run: every
-- row is an idempotent upsert (insert-or-update by rule_key).
--
-- Reminder: rows in pricing_rules OVERRIDE the code fallback. If a rule_key
-- is absent here or in the table, the studio uses its built-in fallback.

insert into public.pricing_rules (rule_key, kind, value, meta, is_active) values
  -- Base unit price per piece
  ('base.bite',           'base_unit',  190, '{"product":"bite"}',      true),
  ('base.signature',      'base_unit',  260, '{"product":"signature"}', true),
  ('base.bar',            'base_unit',  800, '{"product":"bar"}',       true),
  ('base.slim',           'base_unit',  400, '{"product":"slim"}',      true),

  -- Chocolate add-on
  ('chocolate.semidark',  'addon_unit', 15,  '{"group":"chocolate"}',   true),

  -- Packaging
  ('pkg.box',             'packaging',  500,  '{"per":"box"}',          true),
  ('pkg.flat',            'packaging',  1000, '{"per_pcs":50}',         true),

  -- Message / favour bars (per box)
  ('bar.center',          'addon_unit', 190, '{"group":"bar","per":"box"}',  true),
  ('bar.wedding',         'addon_unit', 350, '{"group":"bar","per":"box"}',  true),

  -- Printed wrapper (per wrapped piece)
  ('extra.printedWrapper','addon_unit', 20,  '{"group":"extra","per":"unit"}', true),

  -- Per-box extras
  ('extra.ribbon',        'addon_unit', 60,  '{"group":"extra","per":"box"}', true),
  ('extra.sleevePrint',   'addon_unit', 120, '{"group":"extra","per":"box"}', true),
  ('extra.greetingCard',  'addon_unit', 90,  '{"group":"extra","per":"box"}', true),
  ('extra.waxSeal',       'addon_unit', 70,  '{"group":"extra","per":"box"}', true),
  ('extra.qr',            'addon_unit', 0,   '{"group":"extra","per":"box"}', true),
  ('extra.insideMessage', 'addon_unit', 0,   '{"group":"extra","per":"box"}', true),

  -- Minimum order quantity (all lines: 50)
  ('moq.bite',            'moq', 50, '{"product":"bite"}',      true),
  ('moq.signature',       'moq', 50, '{"product":"signature"}', true),
  ('moq.bar',             'moq', 50, '{"product":"bar"}',       true),
  ('moq.slim',            'moq', 50, '{"product":"slim"}',      true),

  -- Volume discount tiers (best applicable multiplier applies)
  ('tier.50',             'qty_tier', 0.95, '{"min_qty":50,"multiplier":0.95}',  true),
  ('tier.100',            'qty_tier', 0.90, '{"min_qty":100,"multiplier":0.90}', true),
  ('tier.250',            'qty_tier', 0.85, '{"min_qty":250,"multiplier":0.85}', true),
  ('tier.500',            'qty_tier', 0.80, '{"min_qty":500,"multiplier":0.80}', true),

  -- One-time fee: combined Design & mold, per custom order
  ('fee.designMold',      'mold_fee', 5000, '{}', true),

  -- Lead time (days) & delivery (extra days)
  ('lead.base',           'lead_time', 7, '{}',                       true),
  ('lead.custom_mold',    'lead_time', 5, '{"extraWhenLogo":true}',   true),
  ('delivery.karachi',    'delivery',  2, '{"region":"karachi"}',     true)
on conflict (rule_key) do update
  set value     = excluded.value,
      kind      = excluded.kind,
      meta      = excluded.meta,
      is_active = true,
      updated_at = now();
