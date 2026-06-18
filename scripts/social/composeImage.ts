import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Product } from '../../src/types';
import { supabaseAdmin, STORAGE_BUCKET } from './lib/supabaseAdmin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ComposedImage {
  localPath: string;
  publicUrl: string | null; // null in dry-run when no Supabase configured
  bytes: number;
}

const CANVAS = 1080;
const REPO_ROOT = resolve(__dirname, '..', '..');
const PUBLIC_DIR = resolve(REPO_ROOT, 'public');
const TMP_DIR = resolve(REPO_ROOT, '.tmp', 'social');

/**
 * Compose a square 1080x1080 social image: product photo centered on a
 * branded canvas with a logo header, occasion banner, and price chip.
 * Saves locally to .tmp/ and (if Supabase configured) uploads to the
 * public `social-assets/` bucket and returns the public URL.
 */
export async function composeImage(args: {
  product: Product;
  occasion: string;
  ctaSrc: string;
}): Promise<ComposedImage> {
  mkdirSync(TMP_DIR, { recursive: true });

  const productImgPath = resolveProductImage(args.product);
  if (!productImgPath) {
    throw new Error(`composeImage: product image not found for sku ${args.product.sku}`);
  }

  // 1. Background — soft warm gradient on cream
  const background = await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 250, g: 244, b: 233, alpha: 1 },
    },
  }).png().toBuffer();

  // 2. Product photo, fit-contained into 760x760 centered
  const productBuf = await sharp(productImgPath)
    .resize({ width: 760, height: 760, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 3. SVG overlay — logo bar, occasion ribbon, price chip
  const overlay = svgOverlay({
    product: args.product,
    occasion: args.occasion,
  });

  const composed = await sharp(background)
    .composite([
      { input: productBuf, top: 160, left: (CANVAS - 760) / 2 },
      { input: Buffer.from(overlay), top: 0, left: 0 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const localPath = resolve(TMP_DIR, `${args.ctaSrc}.jpg`);
  writeFileSync(localPath, composed);

  const publicUrl = await uploadIfConfigured(args.ctaSrc, composed);
  return { localPath, publicUrl, bytes: composed.length };
}

function resolveProductImage(p: Product): string | null {
  // Try main image then gallery, all rooted at /public.
  const candidates = [p.image, ...p.gallery].filter(Boolean);
  for (const rel of candidates) {
    const clean = rel.startsWith('/') ? rel.slice(1) : rel;
    const abs = resolve(PUBLIC_DIR, clean);
    if (existsSync(abs)) return abs;
  }
  return null;
}

function svgOverlay(opts: { product: Product; occasion: string }): string {
  const occasionLabel = occasionRibbonLabel(opts.occasion);
  const priceLabel = `Rs. ${Math.round(opts.product.price).toLocaleString('en-PK')}`;

  // SVG uses Tailwind-ish brand cream + a chocolate brown accent.
  return `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .brand   { font: 700 44px 'Georgia', serif; fill: #3b2415; letter-spacing: 2px; }
    .occasion{ font: 600 28px 'Helvetica', sans-serif; fill: #fff; letter-spacing: 3px; text-transform: uppercase; }
    .price   { font: 700 32px 'Helvetica', sans-serif; fill: #fff; }
    .tagline { font: 400 22px 'Helvetica', sans-serif; fill: #6b4a35; }
  </style>

  <!-- top bar -->
  <rect x="0" y="0" width="${CANVAS}" height="120" fill="#fdf8ef"/>
  <text x="${CANVAS / 2}" y="76" text-anchor="middle" class="brand">CRAFTY CHOCOLATES</text>

  <!-- occasion ribbon (only if not 'everyday') -->
  ${opts.occasion !== 'everyday' ? `
    <rect x="60" y="140" width="320" height="50" rx="6" fill="#3b2415"/>
    <text x="220" y="174" text-anchor="middle" class="occasion">${occasionLabel}</text>
  ` : ''}

  <!-- price chip bottom-right -->
  <rect x="${CANVAS - 320}" y="${CANVAS - 120}" width="260" height="64" rx="32" fill="#3b2415"/>
  <text x="${CANVAS - 190}" y="${CANVAS - 78}" text-anchor="middle" class="price">${priceLabel}</text>

  <!-- tagline bottom-left -->
  <text x="60" y="${CANVAS - 78}" class="tagline">Handcrafted in Karachi</text>
</svg>`.trim();
}

function occasionRibbonLabel(occasion: string): string {
  switch (occasion) {
    case 'ramadan':   return 'Ramadan';
    case 'eid':       return 'Eid Special';
    case 'wedding':   return 'Wedding Favors';
    case 'christmas': return 'Christmas';
    case 'corporate': return 'Corporate Gifts';
    default:          return '';
  }
}

async function uploadIfConfigured(ctaSrc: string, buf: Buffer): Promise<string | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const filename = `posts/${ctaSrc}.jpg`;
  const { error } = await supabaseAdmin()
    .storage
    .from(STORAGE_BUCKET)
    .upload(filename, buf, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '604800',
    });
  if (error) {
    console.warn('composeImage: Supabase upload failed —', error.message);
    return null;
  }
  const { data } = supabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
