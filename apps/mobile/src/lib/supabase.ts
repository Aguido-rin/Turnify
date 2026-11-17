import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { secureStorage, type SecureStorageAdapter } from '@/lib/secure-storage';
import { createLocalSupabaseClient } from '@/lib/local-supabase-client';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const forceRemote = process.env.EXPO_PUBLIC_FORCE_REMOTE_SUPABASE === '1';

// Always true so the UI never blocks: if remote keys are not provided, it falls back to the in-device Local Engine.
export const isSupabaseConfigured = true;

let client: SupabaseClient | undefined;

function buildRemoteClient(storage?: SecureStorageAdapter): SupabaseClient {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Returns the active client:
 * If remote Supabase credentials are not provided (or forceRemote is not set),
 * it returns a fast in-device persistent TypeScript engine that saves state in
 * the device's native storage (localStorage / SecureStore) with zero network latency.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  if (forceRemote && supabaseUrl && supabaseAnonKey) {
    client = buildRemoteClient(secureStorage);
  } else {
    client = createLocalSupabaseClient();
  }

  return client;
}
