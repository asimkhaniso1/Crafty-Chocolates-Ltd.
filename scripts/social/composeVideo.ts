import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Product } from '../../src/types';
import { composeImage } from './composeImage';
import { supabaseAdmin, STORAGE_BUCKET } from './lib/supabaseAdmin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ComposedVideo {
  localPath: string;
  publicUrl: string | null;
  bytes: number;
}

const REPO_ROOT = resolve(__dirname, '..', '..');
const PUBLIC_DIR = resolve(REPO_ROOT, 'public');
const TMP_DIR = resolve(REPO_ROOT, '.tmp', 'social');

const W = 1080;
const H = 1920;
const SECONDS_PER_IMAGE = 2.5;

/**
 * Build a vertical 9:16 product-slideshow video for TikTok.
 * Uses up to 4 product images (main + first 3 gallery) plus the
 * composed branded square for the closing frame. ffmpeg must be on PATH —
 * pre-installed on Ubuntu GitHub runners.
 */
export async function composeVideo(args: {
  product: Product;
  occasion: string;
  ctaSrc: string;
}): Promise<ComposedVideo> {
  mkdirSync(TMP_DIR, { recursive: true });

  const branded = await composeImage({
    product: args.product,
    occasion: args.occasion,
    ctaSrc: `${args.ctaSrc}-end`,
  });

  const sourceImages = [args.product.image, ...args.product.gallery]
    .filter(Boolean)
    .slice(0, 4)
    .map(rel => resolve(PUBLIC_DIR, rel.replace(/^\//, '')))
    .filter(existsSync);

  if (sourceImages.length === 0) {
    throw new Error(`composeVideo: no source images for sku ${args.product.sku}`);
  }

  // Closing branded frame
  sourceImages.push(branded.localPath);

  // Build a concat list file that ffmpeg's concat demuxer understands.
  const concatList = sourceImages
    .map(p => `file '${p.replace(/'/g, "'\\''")}'\nduration ${SECONDS_PER_IMAGE}`)
    .join('\n') + `\nfile '${sourceImages[sourceImages.length - 1].replace(/'/g, "'\\''")}'\n`;
  const concatPath = resolve(TMP_DIR, `${args.ctaSrc}.txt`);
  writeFileSync(concatPath, concatList);

  const outPath = resolve(TMP_DIR, `${args.ctaSrc}.mp4`);

  const vf = [
    `scale=w=${W}:h=${H}:force_original_aspect_ratio=decrease`,
    `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=#FDF8EF`,
    `setsar=1`,
  ].join(',');

  execFileSync('ffmpeg', [
    '-y',
    '-f', 'concat', '-safe', '0', '-i', concatPath,
    '-vf', vf,
    '-r', '30',
    '-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outPath,
  ], { stdio: 'inherit' });

  const bytes = readFileSync(outPath).length;
  const publicUrl = await uploadIfConfigured(args.ctaSrc, outPath);
  return { localPath: outPath, publicUrl, bytes };
}

async function uploadIfConfigured(ctaSrc: string, file: string): Promise<string | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const buf = readFileSync(file);
  const filename = `videos/${ctaSrc}.mp4`;
  const { error } = await supabaseAdmin()
    .storage
    .from(STORAGE_BUCKET)
    .upload(filename, buf, {
      contentType: 'video/mp4',
      upsert: true,
      cacheControl: '604800',
    });
  if (error) {
    console.warn('composeVideo: Supabase upload failed —', error.message);
    return null;
  }
  const { data } = supabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
