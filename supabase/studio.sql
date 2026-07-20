-- Crafty Chocolates — Design Studio schema
-- Run manually in the Supabase SQL editor. Not applied automatically.
--
-- Tables:
--   public.designs        saved studio designs, addressable by a public share_token
--   public.pricing_rules  live pricing rules consumed by usePricingRules(); falls back
--                          to src/studio/data/pricingFallback.ts when unavailable

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique default replace(gen_random_uuid()::text,'-',''),
  design jsonb not null,
  quote jsonb,
  contact_name text, contact_phone text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
alter table public.designs enable row level security;
create policy "anon insert designs" on public.designs for insert to anon with check (true);
create policy "auth read designs" on public.designs for select to authenticated using (true);
create or replace function public.get_design(p_token text)
returns setof public.designs language sql security definer stable
as $$ select * from public.designs where share_token = p_token $$;
grant execute on function public.get_design(text) to anon;

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  kind text not null,
  value numeric not null,
  meta jsonb default '{}',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.pricing_rules enable row level security;
create policy "public read pricing" on public.pricing_rules for select to anon, authenticated using (is_active);
create policy "auth write pricing" on public.pricing_rules for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed data, mirroring src/studio/data/pricingFallback.ts.
-- Uncomment and run once to seed public.pricing_rules with the same values
-- used as the client-side fallback. All values in PKR.
-- ---------------------------------------------------------------------------

-- insert into public.pricing_rules (rule_key, kind, value, meta) values
--   -- Base unit price per piece, by product
--   ('base.bite', 'base_unit', 120, '{"product":"bite"}'),
--   ('base.signature', 'base_unit', 260, '{"product":"signature"}'),
--   ('base.bar', 'base_unit', 420, '{"product":"bar"}'),
--
--   -- Add-on unit price per piece (chocolate type)
--   ('chocolate.semidark', 'addon_unit', 15, '{"group":"chocolate"}'),
--
--   -- Packaging: price per box/wrapper, keyed to packagingOptions `type`
--   -- X+1 signature boxes (assorted ring + center message bar), premium tins
--   ('pkg.4+1', 'packaging', 750, '{"type":"4+1"}'),
--   ('pkg.9+1', 'packaging', 900, '{"type":"9+1"}'),
--   ('pkg.16+1', 'packaging', 1100, '{"type":"16+1"}'),
--   ('pkg.individual', 'packaging', 25, '{"type":"individual"}'),
--   ('pkg.box-2', 'packaging', 180, '{"type":"box-2"}'),
--   ('pkg.box-4', 'packaging', 260, '{"type":"box-4"}'),
--   ('pkg.box-6', 'packaging', 340, '{"type":"box-6"}'),
--   ('pkg.box-9', 'packaging', 450, '{"type":"box-9"}'),
--   ('pkg.box-12', 'packaging', 560, '{"type":"box-12"}'),
--   ('pkg.box-16', 'packaging', 700, '{"type":"box-16"}'),
--   ('pkg.box-24', 'packaging', 950, '{"type":"box-24"}'),
--   ('pkg.box-36', 'packaging', 1300, '{"type":"box-36"}'),
--
--   -- Center message bar (one per X+1 box)
--   ('bar.center', 'addon_unit', 450, '{"group":"bar","per":"box"}'),
--
--   -- Printed wrapper (per wrapped piece)
--   ('extra.printedWrapper', 'addon_unit', 20, '{"group":"extra","per":"unit"}'),
--
--   -- Per-box extras (from DesignExtras)
--   ('extra.ribbon', 'addon_unit', 60, '{"group":"extra","per":"box"}'),
--   ('extra.sleevePrint', 'addon_unit', 120, '{"group":"extra","per":"box"}'),
--   ('extra.greetingCard', 'addon_unit', 90, '{"group":"extra","per":"box"}'),
--   ('extra.waxSeal', 'addon_unit', 70, '{"group":"extra","per":"box"}'),
--   ('extra.qr', 'addon_unit', 0, '{"group":"extra","per":"box"}'),
--   ('extra.insideMessage', 'addon_unit', 0, '{"group":"extra","per":"box"}'),
--
--   -- Minimum order quantity, by product
--   ('moq.bite', 'moq', 50, '{"product":"bite"}'),
--   ('moq.signature', 'moq', 25, '{"product":"signature"}'),
--   ('moq.bar', 'moq', 25, '{"product":"bar"}'),
--
--   -- Quantity discount tiers (best applicable multiplier applies)
--   ('tier.50', 'qty_tier', 0.95, '{"min_qty":50,"multiplier":0.95}'),
--   ('tier.100', 'qty_tier', 0.9, '{"min_qty":100,"multiplier":0.9}'),
--   ('tier.250', 'qty_tier', 0.85, '{"min_qty":250,"multiplier":0.85}'),
--   ('tier.500', 'qty_tier', 0.8, '{"min_qty":500,"multiplier":0.8}'),
--
--   -- One-time fees
--   ('mold.custom_logo', 'mold_fee', 15000, '{"waive_above":500}'),
--   ('artwork.setup', 'artwork_fee', 3000, '{"waive_above":250}'),
--
--   -- Lead time (days)
--   ('lead.base', 'lead_time', 7, '{}'),
--   ('lead.custom_mold', 'lead_time', 5, '{"extraWhenLogo":true}'),
--
--   -- Delivery (extra days added on top of lead time)
--   ('delivery.karachi', 'delivery', 2, '{"region":"karachi"}')
-- on conflict (rule_key) do nothing;
