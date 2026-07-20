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
--   ('base.slim', 'base_unit', 200, '{"product":"slim"}'),
--
--   -- Add-on unit price per piece (chocolate type)
--   ('chocolate.semidark', 'addon_unit', 15, '{"group":"chocolate"}'),
--
--   -- Packaging: one flat rule for every packaging type — Rs 1000 per
--   -- started block of 50 pieces, regardless of box type
--   ('pkg.flat', 'packaging', 1000, '{"per_pcs":50}'),
--
--   -- Center message bar (one per X+1 box)
--   ('bar.center', 'addon_unit', 450, '{"group":"bar","per":"box"}'),
--
--   -- Wedding favour box bar (one 60x60mm bar per box)
--   ('bar.wedding', 'addon_unit', 350, '{"group":"bar","per":"box"}'),
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
--   -- Minimum order quantity, by product — the studio is positioned for
--   -- bulk custom orders, so every line clamps at the same 50-piece floor
--   ('moq.bite', 'moq', 50, '{"product":"bite"}'),
--   ('moq.signature', 'moq', 50, '{"product":"signature"}'),
--   ('moq.bar', 'moq', 50, '{"product":"bar"}'),
--   ('moq.slim', 'moq', 50, '{"product":"slim"}'),
--
--   -- Quantity discount tiers (best applicable multiplier applies)
--   ('tier.50', 'qty_tier', 0.95, '{"min_qty":50,"multiplier":0.95}'),
--   ('tier.100', 'qty_tier', 0.9, '{"min_qty":100,"multiplier":0.9}'),
--   ('tier.250', 'qty_tier', 0.85, '{"min_qty":250,"multiplier":0.85}'),
--   ('tier.500', 'qty_tier', 0.8, '{"min_qty":500,"multiplier":0.8}'),
--
--   -- One-time fees: single combined Design & mold fee, charged once per
--   -- design at any quantity, no waivers
--   ('fee.designMold', 'mold_fee', 18000, '{}'),
--
--   -- Lead time (days)
--   ('lead.base', 'lead_time', 7, '{}'),
--   ('lead.custom_mold', 'lead_time', 5, '{"extraWhenLogo":true}'),
--
--   -- Delivery (extra days added on top of lead time)
--   ('delivery.karachi', 'delivery', 2, '{"region":"karachi"}')
-- on conflict (rule_key) do nothing;
