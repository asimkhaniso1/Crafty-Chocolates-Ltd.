import { PRODUCTS } from '../../src/data/products';
import type { Product } from '../../src/types';
import { activeOccasion, EVENT_TO_OCCASION } from './lib/voice';
import { supabaseAdmin } from './lib/supabaseAdmin';

export interface Pick {
  product: Product;
  occasion: string;
  reason: string;
}

const RECENT_WINDOW_DAYS = 30;

/**
 * Choose the next product to feature. Scoring:
 *  +10  product is tagged with an event mapping to the active occasion
 *  +3   product is tagged "Best Sellers"
 *  +2   product is tagged "Corporate Gifts" when active occasion is corporate
 *  -50  product was posted on ANY platform within the last 30 days
 *  +random(0..1) tiebreak so we don't always pick the same SKU at zero
 */
export async function pickProduct(now: Date = new Date()): Promise<Pick> {
  const occasion = activeOccasion(now);
  const recentSkus = await recentlyPostedSkus();

  const scored = PRODUCTS
    .filter(p => p.image)
    .map(p => {
      let score = 0;
      const productOccasions = new Set(
        p.events.map(e => EVENT_TO_OCCASION[e]).filter(Boolean),
      );
      if (productOccasions.has(occasion)) score += 10;
      if (p.tags.includes('Best Sellers')) score += 3;
      if (occasion === 'corporate' && p.tags.includes('Corporate Gifts')) score += 2;
      if (recentSkus.has(p.sku)) score -= 50;
      score += Math.random();
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);

  const chosen = scored[0].p;
  const reason = scored[0].score < 0
    ? `everything was recently posted — falling back to highest-scored SKU ${chosen.sku}`
    : `top score ${scored[0].score.toFixed(2)} for occasion=${occasion}, sku=${chosen.sku}`;

  return { product: chosen, occasion, reason };
}

async function recentlyPostedSkus(): Promise<Set<string>> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Set(); // local dev without Supabase configured
  }
  const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 86400 * 1000).toISOString();
  const { data, error } = await supabaseAdmin()
    .from('posts')
    .select('product_sku')
    .gte('posted_at', since)
    .eq('status', 'published');
  if (error) {
    console.warn('pickProduct: failed to read recent posts —', error.message);
    return new Set();
  }
  return new Set((data ?? []).map(r => r.product_sku).filter((s: string | null): s is string => !!s));
}
