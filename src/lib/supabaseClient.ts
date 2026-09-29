import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Bellymall backend client.
 *
 * The site stays fully functional without Supabase (static catalog + local
 * orders). When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are present, the
 * storefront loads live content and orders/activity are stored in Postgres.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backendReady = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = backendReady
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/** Guard for call sites: throws if the backend is not configured. */
export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}
