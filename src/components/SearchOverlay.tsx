import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useCatalog } from "../lib/catalog";
import { navigate } from "../router";
import { track } from "../lib/activity";
import { naira } from "../App";
import { useScrollLock } from "../hooks/useScrollLock";

/* ============================================================
   STOREFRONT SEARCH — finds stalls and dishes across the live
   catalog. Opened from the header button or with ⌘K / Ctrl+K /
   the "/" key; every query is logged as a `search` activity event
   so the admin dashboard shows what customers look for.
   ============================================================ */

let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function openSearch() {
  open = true;
  emit();
}

export function closeSearch() {
  open = false;
  emit();
}

function isOpen() {
  return open;
}

function useSearchOpen(): boolean {
  return useSyncExternalStore(subscribe, isOpen, isOpen);
}

type DishHit = { id: string; name: string; price: number; categoryId: string; categoryName: string };

export function SearchOverlay() {
  const isOpen = useSearchOpen();
  const { categories } = useCatalog();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useScrollLock(isOpen);

  /* focus the field whenever the overlay opens */
  useEffect(() => {
    if (!isOpen) return;
    setQ("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  /* Escape closes while open */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  /* global shortcuts: ⌘K / Ctrl+K anywhere, "/" when not typing */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        Boolean(target) &&
        (target!.tagName === "INPUT" || target!.tagName === "TEXTAREA" || target!.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      e.preventDefault();
      if (open) closeSearch();
      else openSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const term = q.trim().toLowerCase();

  const stallHits = useMemo(() => {
    if (!term) return [];
    return categories
      .filter((c) =>
        [c.name, c.shortName, c.slogan, c.blurb].some((f) => f.toLowerCase().includes(term))
      )
      .slice(0, 4);
  }, [categories, term]);

  const dishHits = useMemo<DishHit[]>(() => {
    if (!term) return [];
    const out: DishHit[] = [];
    for (const c of categories) {
      for (const m of c.menu) {
        if ([m.name, m.desc, m.tag ?? ""].some((f) => f.toLowerCase().includes(term))) {
          out.push({ id: m.id, name: m.name, price: m.price, categoryId: c.id, categoryName: c.shortName });
        }
      }
    }
    return out.slice(0, 7);
  }, [categories, term]);

  const pick = (categoryId: string, label: string) => {
    track({ kind: "search", label: term, meta: { picked: label } });
    closeSearch();
    navigate(`#/category/${categoryId}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstDish = dishHits[0];
    if (firstDish) {
      pick(firstDish.categoryId, firstDish.name);
      return;
    }
    const firstStall = stallHits[0];
    if (firstStall) pick(firstStall.id, firstStall.name);
  };

  if (!isOpen) return null;

  const total = stallHits.length + dishHits.length;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search Bellymall">
      <div className="search-overlay__backdrop" onClick={closeSearch} />
      <div className="search-panel">
        <form className="search-field" onSubmit={onSubmit}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes, stalls, cravings…"
            aria-label="Search dishes and stalls"
            autoComplete="off"
          />
          <button type="button" className="search-close" onClick={closeSearch} aria-label="Close search">
            ESC
          </button>
        </form>

        <div className="search-results">
          {!term && (
            <div className="search-start">
              <p>
                <i className="fa-solid fa-lightbulb"></i> Try “jollof”, “spicy”, “swallow” or a stall name.
              </p>
              <div className="search-chips">
                {["jollof", "suya", "soup", "snacks", "drinks"].map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {term && total === 0 && (
            <div className="search-empty">
              <i className="fa-solid fa-face-meh"></i>
              <strong>No matches for “{q.trim()}”</strong>
              <span>Try a shorter word — or browse the mall directory on the home page.</span>
            </div>
          )}

          {stallHits.length > 0 && (
            <>
              <span className="search-label">Stalls</span>
              {stallHits.map((c) => (
                <button key={c.id} className="search-hit" onClick={() => pick(c.id, c.name)}>
                  <span className="search-hit__icon">
                    <i className={`fa-solid ${c.icon}`}></i>
                  </span>
                  <span className="search-hit__body">
                    <strong>{c.name}</strong>
                    <small>{c.slogan}</small>
                  </span>
                  <span className="search-hit__meta">{c.menu.length} dishes</span>
                </button>
              ))}
            </>
          )}

          {dishHits.length > 0 && (
            <>
              <span className="search-label">Dishes</span>
              {dishHits.map((d) => (
                <button key={d.id} className="search-hit" onClick={() => pick(d.categoryId, d.name)}>
                  <span className="search-hit__icon">
                    <i className="fa-solid fa-bowl-food"></i>
                  </span>
                  <span className="search-hit__body">
                    <strong>{d.name}</strong>
                    <small>{d.categoryName}</small>
                  </span>
                  <span className="search-hit__meta">{naira(d.price)}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <footer className="search-foot">
          <span>
            <kbd>↵</kbd> open first result
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
          <span className="search-foot__hint">
            <i className="fa-solid fa-keyboard"></i> Press <kbd>/</kbd> anywhere to search
          </span>
        </footer>
      </div>
    </div>
  );
}
