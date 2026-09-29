import { getSupabase, backendReady } from "./supabaseClient";

/* ============================================================
   CUSTOMER ACTIVITY TRACKING + DURABLE ORDERS
   Every storefront action lands in Supabase (when configured) so
   the admin dashboard shows live customer behaviour. Falls back
   silently to no-ops without a backend.
   ============================================================ */

export type ActivityKind =
  | "page_view"
  | "category_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_open"
  | "order_placed"
  | "sign_in"
  | "sign_up"
  | "sign_out"
  | "search";

const SESSION_KEY = "bellymall-sid";

function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "s_anon";
  }
}

let currentEmail: string | null = null;

/** Called by the session store when auth state changes. */
export function setActivityIdentity(email: string | null) {
  currentEmail = email;
}

type TrackPayload = {
  kind: ActivityKind;
  label?: string;
  meta?: Record<string, unknown>;
  path?: string;
};

export function track({ kind, label, meta, path }: TrackPayload) {
  if (!backendReady) return;
  const payload = {
    session_id: getSessionId(),
    email: currentEmail,
    kind,
    label: label ?? null,
    meta: meta ?? null,
    path: path ?? (typeof window !== "undefined" ? window.location.hash : null),
  };
  // Fire-and-forget; never block or break the storefront.
  getSupabase()
    .from("activity")
    .insert(payload)
    .then(undefined, () => undefined);
}

/* ---------------- orders ---------------- */

export type DbOrder = {
  id: string;
  email: string | null;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  address: string;
  phone: string;
  payment: string;
  status: string;
  eta: string | null;
};

export async function saveOrderToDb(order: Omit<DbOrder, "eta"> & { eta: number }): Promise<void> {
  if (!backendReady) return;
  try {
    await getSupabase()
      .from("orders")
      .insert({
        id: order.id,
        email: order.email,
        items: order.items,
        subtotal: order.subtotal,
        delivery: order.delivery,
        total: order.total,
        address: order.address,
        phone: order.phone,
        payment: order.payment,
        status: "placed",
        eta: new Date(order.eta).toISOString(),
      });
  } catch {
    /* demo mode still works from localStorage */
  }
}

export async function fetchOrdersByEmail(email: string): Promise<DbOrder[]> {
  if (!backendReady) return [];
  try {
    const { data } = await getSupabase()
      .from("orders")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []) as DbOrder[];
  } catch {
    return [];
  }
}
