import { getSupabase, backendReady } from "./supabaseClient";
import { CATEGORIES as STATIC_CATEGORIES, HERO_SLIDES as STATIC_HERO, GALLERY_SLIDES as STATIC_GALLERY } from "../data";
import type { Category, HeroSlide, MenuItem, GallerySlide } from "../data";

/* ============================================================
   CONTENT PROVIDER — live Supabase content with static fallback.
   The storefront renders identically with or without the backend:
   when Supabase is configured, DB rows override the static catalog.
   ============================================================ */

let cache: {
  categories: Category[] | null;
  hero: HeroSlide[] | null;
  gallery: GallerySlide[] | null;
} = { categories: null, hero: null, gallery: null };

/** True once any live content has loaded successfully. */
let liveContentLoaded = false;
export function isLiveContentLoaded() {
  return liveContentLoaded;
}

/* ---------------- hero ---------------- */

/** Hero slide as stored in site_content: flat CTA fields (the DB format). */
export type HeroRow = Omit<HeroSlide, "ctas"> & {
  ctaPrimary: string;
  ctaPrimaryHref: string;
  ctaGhost: string;
  ctaGhostHref: string;
};

export async function loadHeroSlides(): Promise<HeroSlide[]> {
  if (!backendReady) return STATIC_HERO;
  if (cache.hero) return cache.hero;
  try {
    const { data, error } = await getSupabase()
      .from("site_content")
      .select("value")
      .eq("key", "hero_slides")
      .maybeSingle();
    if (error || !data?.value) return STATIC_HERO;
    const rows = data.value as HeroRow[];
    cache.hero = rows.map((s) => ({
      ...s,
      ctas: [
        { label: s.ctaPrimary, icon: "fa-bag-shopping", href: s.ctaPrimaryHref, variant: "primary" as const },
        { label: s.ctaGhost, icon: "fa-arrow-right", href: s.ctaGhostHref, variant: "ghost" as const },
      ],
    }));
    liveContentLoaded = true;
    return cache.hero;
  } catch {
    return STATIC_HERO;
  }
}

/* ---------------- gallery ---------------- */

export async function loadGallerySlides(): Promise<GallerySlide[]> {
  if (!backendReady) return STATIC_GALLERY;
  if (cache.gallery) return cache.gallery;
  try {
    const { data, error } = await getSupabase()
      .from("site_content")
      .select("value")
      .eq("key", "gallery_slides")
      .maybeSingle();
    if (error || !data?.value) return STATIC_GALLERY;
    cache.gallery = data.value as GallerySlide[];
    liveContentLoaded = true;
    return cache.gallery;
  } catch {
    return STATIC_GALLERY;
  }
}

/* ---------------- categories + menu items ---------------- */

type CategoryRow = {
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

type MenuItemRow = {
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

export async function loadCategories(): Promise<Category[]> {
  if (!backendReady) return STATIC_CATEGORIES;
  if (cache.categories) return cache.categories;
  try {
    const sb = getSupabase();
    const [catsRes, itemsRes] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("menu_items").select("*").order("sort_order"),
    ]);
    if (catsRes.error || itemsRes.error || !catsRes.data?.length) return STATIC_CATEGORIES;

    const itemsByCat = new Map<string, MenuItem[]>();
    for (const row of (itemsRes.data ?? []) as MenuItemRow[]) {
      if (!row.available) continue;
      const item: MenuItem = {
        id: row.id,
        name: row.name,
        desc: row.desc,
        price: row.price,
        image: row.image,
        alt: row.alt,
        ...(row.tag ? { tag: row.tag } : {}),
        rating: row.rating,
        icon: row.icon,
      };
      const list = itemsByCat.get(row.category_id) ?? [];
      list.push(item);
      itemsByCat.set(row.category_id, list);
    }

    const categories: Category[] = (catsRes.data as CategoryRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      shortName: c.short_name,
      slogan: c.slogan,
      blurb: c.blurb,
      image: c.image,
      imageAlt: c.image_alt,
      icon: c.icon,
      ...(c.featured ? { featured: true } : {}),
      menu: itemsByCat.get(c.id) ?? [],
    }));

    cache.categories = categories;
    liveContentLoaded = true;
    return categories;
  } catch {
    return STATIC_CATEGORIES;
  }
}

/** One-shot loader used by App on mount. */
export async function loadAllContent(): Promise<void> {
  await Promise.all([loadHeroSlides(), loadGallerySlides(), loadCategories()]);
}
