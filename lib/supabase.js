import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
    _client = createClient(url, key);
  }
  return _client;
}

export const supabase = new Proxy({}, {
  get(_, prop) { return getSupabase()[prop]; },
});
