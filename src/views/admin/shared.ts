import { getSupabase } from "../../lib/supabaseClient";

/* ============================================================
   ADMIN SHARED — row types, lookups and helpers used by every
   dashboard section.
   ============================================================ */

export type OrderRow = {
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
  created_at: string;
};

export type ActivityRow = {
  id: number;
  session_id: string;
  email: string | null;
  kind: string;
  label: string | null;
  meta: Record<string, unknown> | null;
  path: string | null;
  created_at: string;
};

export type SellerRow = {
  id: string;
  name: string;
  stall: string | null;
  role: string;
  phone: string;
  email: string;
  rating: number;
  status: string;
  image: string;
  sort_order: number;
  created_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  alt: string;
  tag: string | null;
  rating: string;
  icon: string;
  available: boolean;
  sort_order: number;
};

export type CategoryRow = {
  id: string;
  name: string;
  short_name: string;
  slogan: string;
  blurb: string;
  image: string;
  image_alt: string;
  icon: string;
  featured: boolean;
  sort_order: number;
};

export type Tab =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "sellers"
  | "customers"
  | "contents"
  | "settings"
  | "activity";

export const TABS: [Tab, string, string][] = [
  ["overview", "Overview", "fa-gauge-high"],
  ["products", "Products", "fa-bowl-food"],
  ["categories", "Categories", "fa-layer-group"],
  ["orders", "Orders", "fa-receipt"],
  ["sellers", "Sellers", "fa-store"],
  ["customers", "Customers", "fa-users"],
  ["contents", "Contents", "fa-image"],
  ["settings", "Settings", "fa-gear"],
  ["activity", "Activity", "fa-wave-square"],
];

/** Sections whose lists respond to the dashboard search box. */
export const SEARCHABLE: Tab[] = ["products", "categories", "orders", "sellers", "customers", "activity"];

export const KIND_META: Record<string, { icon: string; label: string }> = {
  page_view: { icon: "fa-eye", label: "Viewed page" },
  category_view: { icon: "fa-store", label: "Opened stall" },
  add_to_cart: { icon: "fa-cart-plus", label: "Added to basket" },
  remove_from_cart: { icon: "fa-cart-minus", label: "Removed from basket" },
  checkout_open: { icon: "fa-cash-register", label: "Checkout" },
  order_placed: { icon: "fa-receipt", label: "Order placed" },
  search: { icon: "fa-magnifying-glass", label: "Searched" },
  sign_in: { icon: "fa-arrow-right-to-bracket", label: "Signed in" },
  sign_up: { icon: "fa-user-plus", label: "Created account" },
  sign_out: { icon: "fa-arrow-right-from-bracket", label: "Signed out" },
};

export const STATUS_META: Record<string, { icon: string; label: string }> = {
  placed: { icon: "fa-hourglass-half", label: "Placed" },
  preparing: { icon: "fa-fire-burner", label: "Preparing" },
  on_the_way: { icon: "fa-motorcycle", label: "On the way" },
  delivered: { icon: "fa-circle-check", label: "Delivered" },
  cancelled: { icon: "fa-circle-xmark", label: "Cancelled" },
};

export const STATUSES = ["placed", "preparing", "on_the_way", "delivered", "cancelled"] as const;

export const ICON_CHOICES = [
  "fa-store",
  "fa-bowl-food",
  "fa-bowl-rice",
  "fa-utensil-spoon",
  "fa-drumstick-bite",
  "fa-cookie-bite",
  "fa-carrot",
  "fa-seedling",
  "fa-box-open",
  "fa-mug-hot",
  "fa-fish",
  "fa-pepper-hot",
  "fa-cheese",
  "fa-ice-cream",
  "fa-apple-whole",
  "fa-pizza-slice",
];

/** Placeholder art for a brand-new stall until a photo is uploaded. */
export const PLACEHOLDER_IMAGE = "/images/rice-feast-pans.jpg";

export type Sb = ReturnType<typeof getSupabase>;

export function timeAgo(iso: string): string {
  const secs = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Case-insensitive "does this row match the search box" test. */
export function hit(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f ?? "").toLowerCase().includes(q));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Unique text id for a newly created dish (slug + short random suffix). */
export function newItemId(name: string): string {
  const base = slugify(name) || "item";
  return `${base.slice(0, 28)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Upload a photo to the public site-images bucket and return its URL. */
export async function uploadSiteImage(sb: Sb, prefix: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 5 MB");
  const path = `${prefix}/${Date.now()}-${file.name.replace(/\s+/g, "-").slice(-60)}`;
  const { error } = await sb.storage.from("site-images").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("site-images").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Upload failed");
  return data.publicUrl;
}

/** True when an error means "the table has not been created yet". */
export function missingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /could not find the table|does not exist/i.test(error.message ?? "")
  );
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
