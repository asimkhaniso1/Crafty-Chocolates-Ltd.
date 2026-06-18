// Vercel serverless function: /api/r/wa?src=<cta-code>
//
// 1. Look up the source post (if any) to product-aware-prefill the message.
// 2. Insert a click row into Supabase `post_clicks`.
// 3. 302 redirect to wa.me with the prefilled text.
//
// Caught by /r/wa rewrite in vercel.json. Service-role Supabase env vars must
// be set in the Vercel dashboard.

import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

interface VercelReq {
  query: { [k: string]: string | string[] | undefined };
  headers: { [k: string]: string | string[] | undefined };
  socket?: { remoteAddress?: string };
}
interface VercelRes {
  setHeader(name: string, value: string): void;
  statusCode: number;
  end(body?: string): void;
}

const WA_NUMBER = process.env.WA_NUMBER ?? '923332527370';
const FALLBACK_MSG = "Hello Crafty Chocolates, I'd like to enquire about your products.";

let cachedClient: ReturnType<typeof createClient> | null = null;
function client() {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cachedClient = createClient(url, key, { auth: { persistSession: false } });
  return cachedClient;
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  const src = typeof req.query.src === 'string' ? req.query.src : '';

  // Default message; product-aware overrides below.
  let message = FALLBACK_MSG;

  const sb = client();
  if (sb && src) {
    // Try to make the prefill product-aware.
    try {
      const { data: postRaw } = await sb
        .from('posts')
        .select('product_sku, platform')
        .eq('cta_src', src)
        .maybeSingle();
      const post = postRaw as { product_sku: string | null; platform: string } | null;

      if (post?.product_sku) {
        const { data: productRaw } = await sb
          .from('products')
          .select('name')
          .eq('sku', post.product_sku)
          .maybeSingle();
        const product = productRaw as { name: string } | null;
        if (product?.name) {
          const platformLabel = post.platform === 'instagram' ? 'Instagram'
            : post.platform === 'tiktok' ? 'TikTok'
            : 'Facebook';
          message = `Hi Crafty Chocolates! I saw your "${product.name}" on ${platformLabel} — is it available?`;
        }
      }

      // Fire-and-forget click log. Don't block the redirect on a slow insert.
      void sb.from('post_clicks').insert({
        cta_src: src,
        ua: headerStr(req.headers['user-agent']),
        referer: headerStr(req.headers['referer'] ?? req.headers['referrer']),
        ip_hash: hashIp(req),
        country: headerStr(req.headers['x-vercel-ip-country']),
      } as never);
    } catch (e) {
      // Never let logging failure break the redirect.
      console.warn('wa redirect: lookup/log failed', (e as Error).message);
    }
  }

  const target = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  res.setHeader('Location', target);
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 302;
  res.end();
}

function headerStr(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
}

function hashIp(req: VercelReq): string | null {
  const fwd = headerStr(req.headers['x-forwarded-for']);
  const ip = fwd?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? null;
  if (!ip) return null;
  // Daily-rotating salt so the same visitor groups within-day but is
  // unlinkable across days. Salt = sha256 of date (UTC).
  const dailySalt = new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256').update(ip + ':' + dailySalt).digest('hex').slice(0, 32);
}
