import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Product } from '../../src/types';
import { BRAND_VOICE, VOICE_RULES } from './lib/voice';
import { supabaseAdmin } from './lib/supabaseAdmin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface CaptionResult {
  body: string;       // the caption text without hashtags
  hashtags: string[];
  full: string;       // body + "\n" + hashtags joined with spaces
  modelUsed: string;
}

const MODEL = 'gemini-2.5-flash';
const TEMPLATE_DIR = resolve(__dirname, 'templates', 'captions');

export async function generateCaption(args: {
  product: Product;
  occasion: string;
  ctaUrl: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
}): Promise<CaptionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing. Get a free key at https://aistudio.google.com/apikey');
  }

  const occasionGuide = safeReadTemplate(args.occasion);
  const recent = await recentCaptions(8);
  const hashtags = pickHashtags(args.product);

  const prompt = buildPrompt({
    product: args.product,
    occasion: args.occasion,
    occasionGuide,
    ctaUrl: args.ctaUrl,
    platform: args.platform,
    recent,
    hashtags,
  });

  const ai = new GoogleGenAI({ apiKey });
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { temperature: 0.85, maxOutputTokens: 400 },
  });

  const text = resp.text?.trim() ?? '';
  if (!text) throw new Error('Gemini returned empty caption');

  const { body, hashtagsParsed } = parseResponse(text);
  const finalTags = hashtagsParsed.length > 0 ? hashtagsParsed : hashtags;

  return {
    body,
    hashtags: finalTags,
    full: `${body}\n${finalTags.join(' ')}`,
    modelUsed: MODEL,
  };
}

function buildPrompt(opts: {
  product: Product;
  occasion: string;
  occasionGuide: string;
  ctaUrl: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  recent: string[];
  hashtags: string[];
}): string {
  return [
    VOICE_RULES,
    '',
    `# Product`,
    `Name: ${opts.product.name}`,
    `Price: Rs. ${Math.round(opts.product.price).toLocaleString('en-PK')}`,
    `Category: ${opts.product.category}, Format: ${opts.product.format}`,
    `Chocolate type: ${opts.product.chocolateType.join(', ') || 'mixed'}`,
    `Fillings: ${opts.product.fillings.join(', ') || 'none'}`,
    `Flavours: ${opts.product.flavour.join(', ') || 'classic'}`,
    `Certifications: ${opts.product.certifications.join(', ') || 'n/a'}`,
    `Piece count: ${opts.product.pieceCount ?? 'n/a'}`,
    `Description: ${opts.product.description}`,
    '',
    `# Occasion`,
    `Active occasion: ${opts.occasion}`,
    opts.occasionGuide,
    '',
    `# Platform`,
    platformNote(opts.platform),
    '',
    `# Recent captions to AVOID echoing in style`,
    opts.recent.length > 0
      ? opts.recent.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : '(no recent captions on file)',
    '',
    `# Hashtags to use on the second line`,
    `Use exactly these, in this order, space-separated, lowercase if not branded:`,
    opts.hashtags.join(' '),
    '',
    `# Call-to-action URL (paste verbatim at the END of the caption body)`,
    opts.ctaUrl,
    '',
    `Now output the caption.`,
  ].join('\n');
}

function platformNote(p: 'facebook' | 'instagram' | 'tiktok'): string {
  switch (p) {
    case 'facebook':
      return 'Facebook: ~120 chars feels right. Friendly but not chatty. No #hashtag flooding.';
    case 'instagram':
      return 'Instagram: visual-first. Caption hooks in the first 80 chars before the "...more" cut.';
    case 'tiktok':
      return 'TikTok: punchy, short, more energy. Implies a viewer who is scrolling fast.';
  }
}

function safeReadTemplate(occasion: string): string {
  try {
    return readFileSync(resolve(TEMPLATE_DIR, `${occasion}.md`), 'utf8');
  } catch {
    return readFileSync(resolve(TEMPLATE_DIR, 'everyday.md'), 'utf8');
  }
}

function parseResponse(text: string): { body: string; hashtagsParsed: string[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { body: '', hashtagsParsed: [] };
  const lastLine = lines[lines.length - 1];
  const isHashtagLine = lastLine.split(/\s+/).every(tok => tok.startsWith('#'));
  if (isHashtagLine && lines.length > 1) {
    return {
      body: lines.slice(0, -1).join('\n'),
      hashtagsParsed: lastLine.split(/\s+/).filter(t => t.startsWith('#')),
    };
  }
  return { body: lines.join('\n'), hashtagsParsed: [] };
}

function pickHashtags(product: Product): string[] {
  const always = BRAND_VOICE.hashtagsAlways;
  const pool = [...BRAND_VOICE.hashtagsRotate];
  // Bias rotating tags by product attributes
  if (product.tags.includes('Corporate Gifts')) pool.unshift('#CorporateGiftsPK');
  if (product.events.includes('Wedding & Engagement')) pool.unshift('#WeddingFavors');
  if (product.events.includes('Ramadan')) pool.unshift('#RamadanGifts');
  if (product.events.includes('Eid')) pool.unshift('#EidGifts');

  // Shuffle pool, take 2 (so total = 3 always + 2 rotating = 5 max)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const rotating = Array.from(new Set(shuffled)).slice(0, 2);
  return [...always, ...rotating];
}

async function recentCaptions(limit: number): Promise<string[]> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const { data, error } = await supabaseAdmin()
    .from('posts')
    .select('caption')
    .eq('status', 'published')
    .order('posted_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(r => r.caption).filter(Boolean) as string[];
}
