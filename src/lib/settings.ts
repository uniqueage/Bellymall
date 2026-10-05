import { useSyncExternalStore } from "react";
import { getSupabase, backendReady } from "./supabaseClient";

/* ============================================================
   STORE SETTINGS — ticker, delivery pricing and contact details
   edited from the admin dashboard (Settings tab) and read live by
   the storefront. Defaults mirror the seed row in supabase/schema.sql,
   so the site works before the backend row exists.
   ============================================================ */

export type StoreSettings = {
  storeName: string;
  tagline: string;
  ticker: string;
  deliveryFee: number;
  freeDeliveryOver: number;
  address: string;
  supportPhone: string;
  supportEmail: string;
  hours: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  facebook: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Bellymall",
  tagline: "Everything you love, all in one mall",
  ticker:
    "Free delivery on orders over ₦10,000  •  New: Suya Fridays at the Protein Factory  •  Use code BELLY10 for 10% off your first feast  •  120+ stalls under one roof",
  deliveryFee: 900,
  freeDeliveryOver: 10000,
  address: "12 Food Hall Way, Lagos",
  supportPhone: "+234 800 BELLY-01",
  supportEmail: "hello@bellymall.ng",
  hours: "Open daily · 9am – 11pm",
  instagram: "https://instagram.com/bellymall",
  twitter: "https://x.com/bellymall",
  tiktok: "https://tiktok.com/@bellymall",
  facebook: "https://facebook.com/bellymall",
};

let settings: StoreSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeSettings(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSettings(): StoreSettings {
  return settings;
}

export function useSettings(): StoreSettings {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings);
}

/** Replace local state after a save so every open tab updates instantly. */
export function applySettings(next: Partial<StoreSettings>) {
  settings = { ...settings, ...next };
  emit();
}

/** One-shot loader used by App on mount. Silently keeps defaults on failure. */
export async function loadSettings(): Promise<void> {
  if (!backendReady) return;
  try {
    const { data, error } = await getSupabase()
      .from("site_content")
      .select("value")
      .eq("key", "store_settings")
      .maybeSingle();
    if (error || !data?.value || typeof data.value !== "object") return;
    settings = { ...DEFAULT_SETTINGS, ...(data.value as Partial<StoreSettings>) };
    emit();
  } catch {
    /* offline / no backend — defaults stand */
  }
}
