import { useSyncExternalStore } from "react";
import {
  CATEGORIES as STATIC_CATEGORIES,
  HERO_SLIDES as STATIC_HERO,
  GALLERY_SLIDES as STATIC_GALLERY,
  type Category,
  type HeroSlide,
  type GallerySlide,
} from "../data";
import { loadHeroSlides, loadGallerySlides, loadCategories } from "./content";

/* ============================================================
   CATALOG STORE — the single source the UI reads from.
   Starts as the static catalog, then swaps in live Supabase
   content when the backend responds. Components stay identical.
   ============================================================ */

type CatalogState = {
  categories: Category[];
  hero: HeroSlide[];
  gallery: GallerySlide[];
  source: "static" | "live";
};

let state: CatalogState = {
  categories: STATIC_CATEGORIES,
  hero: STATIC_HERO,
  gallery: STATIC_GALLERY,
  source: "static",
};

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useCatalog() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Kick off the live-content fetch once at app boot. */
export function initCatalog() {
  if (state.source === "live") return;
  Promise.all([loadHeroSlides(), loadGallerySlides(), loadCategories()])
    .then(([hero, gallery, categories]) => {
      const hasLive =
        hero !== STATIC_HERO || gallery !== STATIC_GALLERY || categories !== STATIC_CATEGORIES;
      if (hasLive) {
        state = { hero, gallery, categories, source: "live" };
        emit();
      }
    })
    .catch(() => undefined);
}

/* ---------------- activity identity glue ---------------- */

import { sessionStore } from "../session";
import { setActivityIdentity } from "./activity";

sessionStore.subscribe(() => {
  setActivityIdentity(sessionStore.getSnapshot()?.email ?? null);
});

setActivityIdentity(sessionStore.getSnapshot()?.email ?? null);

/** Helper for components to find a category by id from the live catalog. */
export function findCategoryIn(catalog: CatalogState["categories"], id: string): Category | undefined {
  return catalog.find((c) => c.id === id);
}
