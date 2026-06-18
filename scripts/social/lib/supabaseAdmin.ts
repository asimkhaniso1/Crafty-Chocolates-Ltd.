import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      'supabaseAdmin: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set ' +
      '(GitHub Actions secrets for the publisher, Vercel env vars for the redirect)',
    );
  }
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const STORAGE_BUCKET = 'social-assets';
