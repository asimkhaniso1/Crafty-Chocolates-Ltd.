#!/usr/bin/env tsx
// Entry point invoked by the GitHub Actions cron (or manually).
//
// For each platform scheduled today (lib/schedule.ts):
//   1. pick a product appropriate to the active occasion
//   2. compose an image (and video for TikTok)
//   3. generate a caption via Gemini with a tracked wa.me CTA
//   4. publish to the platform's API
//   5. log to Supabase `posts`
//
// Env knobs:
//   PLATFORMS=facebook,instagram   override schedule (empty string = dry-run)
//   NO_JITTER=1                    skip the 0-30 min randomized delay
//   DRY_RUN=1                      compose + log to stdout, never call publish APIs

import 'dotenv/config';
import { pickProduct } from './pickProduct';
import { generateCaption } from './generateCaption';
import { composeImage } from './composeImage';
import { composeVideo } from './composeVideo';
import { platformsForToday, jitter, type Platform } from './lib/schedule';
import { publishToFacebook } from './publishers/facebook';
import { publishToInstagram } from './publishers/instagram';
import { publishToTikTok } from './publishers/tiktok';
import { supabaseAdmin } from './lib/supabaseAdmin';

const SITE_URL = process.env.SITE_URL ?? 'https://craftychocolates.pk';

async function main(): Promise<void> {
  const now = new Date();
  const platforms = platformsForToday(now);
  const dryRun = process.env.DRY_RUN === '1' || platforms.length === 0;

  console.log(`[publish] ${now.toISOString()}  platforms=${platforms.join(',') || '(none — dry run)'}`);

  const { product, occasion, reason } = await pickProduct(now);
  console.log(`[publish] picked: ${product.sku} — ${product.name}`);
  console.log(`[publish] reason: ${reason}`);
  console.log(`[publish] occasion: ${occasion}`);

  if (!dryRun) await jitter(30);

  for (const platform of platforms.length > 0 ? platforms : (['facebook'] as Platform[])) {
    const ctaSrc = makeCtaSrc(platform, now);
    const ctaUrl = `${SITE_URL}/r/wa?src=${ctaSrc}`;
    let status: 'published' | 'failed' | 'dry_run' = dryRun ? 'dry_run' : 'published';
    let platformPostId: string | null = null;
    let mediaUrl: string | null = null;
    let errorMsg: string | null = null;
    let caption: string | null = null;

    try {
      const captionRes = dryRun && !process.env.GEMINI_API_KEY
        ? stubCaption(product, ctaUrl)
        : await generateCaption({ product, occasion, ctaUrl, platform });
      caption = `${captionRes.body}\n${captionRes.hashtags.join(' ')}`;
      console.log(`\n[${platform}] caption →\n${caption}\n`);

      if (platform === 'tiktok') {
        const video = await composeVideo({ product, occasion, ctaSrc });
        mediaUrl = video.publicUrl;
        console.log(`[${platform}] video composed: ${video.localPath} (${(video.bytes / 1024).toFixed(0)} KB)`);
        if (!dryRun) {
          if (!mediaUrl) throw new Error('TikTok requires a public URL — Supabase upload failed');
          const res = await publishToTikTok({ videoUrl: mediaUrl, caption });
          platformPostId = res.platformPostId;
        }
      } else {
        const image = await composeImage({ product, occasion, ctaSrc });
        mediaUrl = image.publicUrl;
        console.log(`[${platform}] image composed: ${image.localPath} (${(image.bytes / 1024).toFixed(0)} KB)`);
        if (!dryRun) {
          if (!mediaUrl) throw new Error(`${platform} requires a public image URL — Supabase upload failed`);
          const res = platform === 'facebook'
            ? await publishToFacebook({ imageUrl: mediaUrl, caption })
            : await publishToInstagram({ imageUrl: mediaUrl, caption });
          platformPostId = res.platformPostId;
        }
      }
    } catch (e) {
      status = 'failed';
      errorMsg = (e as Error).message;
      console.error(`[${platform}] FAILED:`, errorMsg);
    }

    await logPost({
      platform,
      platformPostId,
      productSku: product.sku,
      occasion,
      caption,
      mediaUrl,
      ctaSrc,
      status,
      error: errorMsg,
    });
  }
}

function stubCaption(product: { name: string }, ctaUrl: string) {
  return {
    body: `${product.name} — handcrafted in Karachi. Order on WhatsApp: ${ctaUrl}`,
    hashtags: ['#CraftyChocolates', '#KarachiChocolates', '#HandcraftedInPakistan'],
    full: '',
    modelUsed: 'stub',
  };
}

function makeCtaSrc(platform: Platform, now: Date): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6);
  const code = platform[0]; // f | i | t
  return `${code}-${yyyy}-${mm}-${dd}-${rand}`;
}

interface LogPostArgs {
  platform: Platform;
  platformPostId: string | null;
  productSku: string;
  occasion: string;
  caption: string | null;
  mediaUrl: string | null;
  ctaSrc: string;
  status: 'published' | 'failed' | 'dry_run';
  error: string | null;
}

async function logPost(p: LogPostArgs): Promise<void> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`[log] (no Supabase configured) ${p.platform} ${p.status} ${p.ctaSrc}`);
    return;
  }
  const { error } = await supabaseAdmin().from('posts').insert({
    platform: p.platform,
    platform_post_id: p.platformPostId,
    product_sku: p.productSku,
    occasion: p.occasion,
    caption: p.caption,
    media_url: p.mediaUrl,
    cta_src: p.ctaSrc,
    status: p.status,
    error: p.error,
  });
  if (error) {
    console.warn(`[log] insert failed: ${error.message}`);
  } else {
    console.log(`[log] ${p.platform} ${p.status} ${p.ctaSrc}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
