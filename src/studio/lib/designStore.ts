/**
 * Persistence for saved/shared Design Studio designs.
 *
 * Mirrors the guard pattern in src/lib/supabase.ts: when Supabase isn't
 * configured (or an insert fails), we fall back to a per-device localStorage
 * record so the Save/Share flow still works, just without cross-device
 * sharing.
 */
import { supabase } from '../../lib/supabase';
import { MAX_DESIGN_JSON_BYTES } from '../constraints';
import { SAVE_SHARE_COPY } from '../copy';
import type { Design, Quote } from '../types';

const LOCAL_SAVE_PREFIX = 'crafty-studio-saved:';

export type SaveDesignResult =
  | { shareToken: string; shareUrl: string; source: 'supabase' | 'local' }
  | { error: string };

export type LoadDesignResult = { design: Design; quote: Quote | null } | { error: string };

interface SavedRecord {
  design: Design;
  quote: Quote | null;
}

function buildShareUrl(token: string): string {
  return `${window.location.origin}/studio/d/${token}`;
}

function saveLocal(token: string, design: Design, quote: Quote | null): SaveDesignResult {
  try {
    const record: SavedRecord = { design, quote };
    window.localStorage.setItem(`${LOCAL_SAVE_PREFIX}${token}`, JSON.stringify(record));
    return { shareToken: token, shareUrl: buildShareUrl(token), source: 'local' };
  } catch {
    return { error: SAVE_SHARE_COPY.saveError };
  }
}

export async function saveDesign(design: Design, quote: Quote | null): Promise<SaveDesignResult> {
  const json = JSON.stringify(design);
  if (json.length > MAX_DESIGN_JSON_BYTES) {
    return { error: SAVE_SHARE_COPY.designTooLarge };
  }

  if (!supabase) {
    const token = crypto.randomUUID().replace(/-/g, '');
    return saveLocal(token, design, quote);
  }

  try {
    const { data, error } = await supabase
      .from('designs')
      .insert({ design, quote })
      .select('share_token')
      .single();

    if (error || !data) {
      const token = crypto.randomUUID().replace(/-/g, '');
      return saveLocal(token, design, quote);
    }

    const shareToken = data.share_token as string;
    return { shareToken, shareUrl: buildShareUrl(shareToken), source: 'supabase' };
  } catch {
    const token = crypto.randomUUID().replace(/-/g, '');
    return saveLocal(token, design, quote);
  }
}

function loadLocal(token: string): LoadDesignResult {
  try {
    const raw = window.localStorage.getItem(`${LOCAL_SAVE_PREFIX}${token}`);
    if (!raw) return { error: SAVE_SHARE_COPY.loadError };
    const parsed = JSON.parse(raw) as Partial<SavedRecord>;
    if (parsed && parsed.design && (parsed.design as Design).v === 1) {
      return { design: parsed.design as Design, quote: parsed.quote ?? null };
    }
    return { error: SAVE_SHARE_COPY.loadError };
  } catch {
    return { error: SAVE_SHARE_COPY.loadError };
  }
}

export async function loadDesign(token: string): Promise<LoadDesignResult> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_design', { p_token: token });
      if (!error && data && Array.isArray(data) && data.length > 0) {
        const row = data[0] as { design: unknown; quote: unknown };
        const design = row.design as Partial<Design>;
        if (design && design.v === 1) {
          return { design: design as Design, quote: (row.quote as Quote | null) ?? null };
        }
      }
    } catch {
      // fall through to local lookup
    }
  }
  return loadLocal(token);
}
