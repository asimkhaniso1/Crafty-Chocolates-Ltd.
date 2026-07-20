import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PRICING_FALLBACK } from '../data/pricingFallback';
import type { PricingRule } from '../types';

interface PricingRuleRow {
  rule_key: string;
  kind: PricingRule['kind'];
  value: number | string;
  meta: Record<string, unknown> | null;
  is_active: boolean;
}

function rowToRule(r: PricingRuleRow): PricingRule {
  return {
    rule_key: r.rule_key,
    kind: r.kind,
    value: Number(r.value),
    meta: r.meta ?? {},
  };
}

export type PricingSource = 'live' | 'fallback';

/**
 * Fetches active pricing rules from Supabase, mirroring useProducts().
 * Falls back to the static PRICING_FALLBACK set when Supabase is
 * unconfigured or the fetch fails.
 */
export function usePricingRules() {
  const [rules, setRules] = useState<PricingRule[]>(PRICING_FALLBACK);
  const [source, setSource] = useState<PricingSource>(supabase ? 'live' : 'fallback');
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setSource('fallback');
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true);
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setError(error?.message ?? null);
        setRules(PRICING_FALLBACK);
        setSource('fallback');
      } else {
        setRules(data.map(rowToRule));
        setSource('live');
      }
      setLoading(false);
    })().catch(() => {
      if (cancelled) return;
      setRules(PRICING_FALLBACK);
      setSource('fallback');
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rules, source, loading, error };
}
