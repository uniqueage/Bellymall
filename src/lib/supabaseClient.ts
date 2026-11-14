import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Bellymall backend client.
 *
 * The site stays fully functional without Supabase (static catalog + local
 * orders). When NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are
 * present, the storefront loads live content and orders/activity are stored in
 * Postgres.
 *
 * The anon key is a *publishable* key by design: Row Level Security policies
 * (see supabase/schema.sql) decide what it may read or write, and admin
 * capabilities require an authenticated admin account.
 */

const FALLBACK_URL = "https://puubbejmbtfsormaipxk.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dWJiZWptYnRmc29ybWFpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODczOTEsImV4cCI6MjEwNTc2MzM5MX0.JDiu3kJv3Om7ZtySce3d1bFUaYrD_H1yLGHfphH8XG8";

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const url = envUrl || FALLBACK_URL;
const anonKey = envKey || FALLBACK_ANON_KEY;

export const backendReady = Boolean(url && anonKey);

/** Public project URL (safe to display — it is not a secret). */
export const SUPABASE_URL = url;

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
