import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import type { HeroRow } from "../../lib/content";
import { toast } from "../../toast";
import {
  GALLERY_SLIDES as STATIC_GALLERY,
  HERO_SLIDES as STATIC_HERO,
  type GallerySlide,
  type HeroSlide,
} from "../../data";
import { errorMessage, uploadSiteImage } from "./shared";

/* ============================================================
   CONTENTS — the hero carousel (top of the home page) and the
   gallery carousel below it. Both live in site_content as JSON,
   so edits go live on reload with no deploy.
   ============================================================ */

/** Static slide (nested ctas) → database row (flat cta fields). */
function slideToRow(s: HeroSlide): HeroRow {
  return {
    image: s.image,
    alt: s.alt,
    kickerIcon: s.kickerIcon,
    kicker: s.kicker,
    titlePre: s.titlePre,
    titleEm: s.titleEm,
    titlePost: s.titlePost,
    sub: s.sub,
    ctaPrimary: s.ctas[0]?.label ?? "",
    ctaPrimaryHref: s.ctas[0]?.href ?? "",
    ctaGhost: s.ctas[1]?.label ?? "",
    ctaGhostHref: s.ctas[1]?.href ?? "",
    trust: s.trust,
  };
}

const EMPTY_HERO: HeroRow = {
  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  alt: "A new hero slide",
  kickerIcon: "fa-store",
  kicker: "New slide",
  titlePre: "",
  titleEm: "Headline",
  titlePost: "",
  sub: "",
  ctaPrimary: "Start an order",
  ctaPrimaryHref: "#picks",
  ctaGhost: "Explore the mall",
  ctaGhostHref: "#directory",
  trust: [{ icon: "fa-star", text: "Fresh in the mall" }],
};

export function Contents() {
  return (
    <div className="admin-stack">
      <HeroEditor />
      <GalleryEditor />
    </div>
  );
}

/* ---------------- hero ---------------- */

function HeroEditor() {
  const sb = getSupabase();
  const [slides, setSlides] = useState<HeroRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("site_content").select("value").eq("key", "hero_slides").maybeSingle();
      setSlides(Array.isArray(data?.value) ? (data.value as HeroRow[]) : []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    async (next: HeroRow[]) => {
      setSaving(true);
      try {
        const { error } = await sb.from("site_content").upsert({ key: "hero_slides", value: next });
        if (error) throw error;
        setSlides(next);
        toast("Hero saved — reload the home page to see it", "fa-floppy-disk");
      } catch (err) {
        toast(errorMessage(err, "Could not save. Are you signed in as admin?"), "fa-triangle-exclamation");
      } finally {
        setSaving(false);
      }
    },
    [sb]
  );

  const uploadImage = async (idx: number, file: File) => {
    setUploading(idx);
    try {
      const url = await uploadSiteImage(sb, "hero", file);
      if (!slides) throw new Error("not loaded");
      const next = [...slides];
      next[idx] = { ...next[idx], image: url };
      await save(next);
      toast("Image uploaded", "fa-image");
    } catch (err) {
      toast(errorMessage(err, "Upload failed — check admin rights"), "fa-triangle-exclamation");
    } finally {
      setUploading(null);
    }
  };

  if (!slides) return <p className="section-sub">Loading hero…</p>;

  if (slides.length === 0) {
    return (
      <div className="admin-stack">
        <div className="cart-empty">
          <i className="fa-solid fa-image"></i>
          <strong>No hero slides in the database</strong>
          <span>The storefront is using its built-in slides. Restore them into the database to start editing.</span>
        </div>
        <button
          className="btn btn--primary btn--block"
          disabled={saving}
          onClick={() => void save(STATIC_HERO.map(slideToRow))}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> Restore the 4 default slides
        </button>
      </div>
    );
  }

  const update = (idx: number, patch: Partial<HeroRow>) => {
    const next = [...slides];
    next[idx] = { ...next[idx], ...patch };
    setSlides(next);
  };

  const remove = (idx: number) => {
    if (!window.confirm("Remove this hero slide?")) return;
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const add = () => setSlides([...slides, { ...EMPTY_HERO, trust: [...EMPTY_HERO.trust] }]);

  const updateTrust = (idx: number, tIdx: number, patch: Partial<{ icon: string; text: string }>) => {
    const next = [...slides];
    const trust = [...(next[idx].trust ?? [])];
    trust[tIdx] = { ...trust[tIdx], ...patch };
    next[idx] = { ...next[idx], trust };
    setSlides(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-filters">
          <span className="admin-count">{slides.length} hero slides</span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={add}>
          <i className="fa-solid fa-plus"></i> Add slide
        </button>
      </div>

      {slides.map((s, i) => (
        <div key={i} className="admin-card">
          <div className="admin-card__media">
            <img src={s.image} alt={s.alt} loading="lazy" />
            <label className="admin-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && void uploadImage(i, e.target.files[0])}
              />
              {uploading === i ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
              Upload
            </label>
          </div>
          <div className="admin-card__fields">
            <div className="admin-two-col">
              <label>
                <span>Small label (kicker)</span>
                <input value={s.kicker} onChange={(e) => update(i, { kicker: e.target.value })} />
              </label>
              <label>
                <span>Image alt text</span>
                <input value={s.alt} onChange={(e) => update(i, { alt: e.target.value })} />
              </label>
            </div>
            <label>
              <span>Title</span>
              <div className="admin-title-row">
                <input value={s.titlePre} onChange={(e) => update(i, { titlePre: e.target.value })} />
                <input value={s.titleEm} onChange={(e) => update(i, { titleEm: e.target.value })} />
                <input value={s.titlePost} onChange={(e) => update(i, { titlePost: e.target.value })} />
              </div>
            </label>
            <label>
              <span>Subtitle</span>
              <textarea value={s.sub} rows={2} onChange={(e) => update(i, { sub: e.target.value })} />
            </label>
            <div className="admin-two-col">
              <label>
                <span>Primary button</span>
                <input value={s.ctaPrimary} onChange={(e) => update(i, { ctaPrimary: e.target.value })} />
              </label>
              <label>
                <span>Primary link</span>
                <input value={s.ctaPrimaryHref} onChange={(e) => update(i, { ctaPrimaryHref: e.target.value })} />
              </label>
              <label>
                <span>Ghost button</span>
                <input value={s.ctaGhost} onChange={(e) => update(i, { ctaGhost: e.target.value })} />
              </label>
              <label>
                <span>Ghost link</span>
                <input value={s.ctaGhostHref} onChange={(e) => update(i, { ctaGhostHref: e.target.value })} />
              </label>
            </div>
            <div className="admin-trust">
              <span className="admin-trust__label">Trust badges</span>
              {(s.trust ?? []).map((t, ti) => (
                <div key={ti} className="admin-trust__row">
                  <input
                    value={t.icon}
                    placeholder="fa-star"
                    onChange={(e) => updateTrust(i, ti, { icon: e.target.value })}
                  />
                  <input
                    value={t.text}
                    placeholder="4.9 rated by foodies"
                    onChange={(e) => updateTrust(i, ti, { text: e.target.value })}
                  />
                  <button
                    className="admin-status-btn admin-status-btn--danger"
                    onClick={() => update(i, { trust: (s.trust ?? []).filter((_, k) => k !== ti) })}
                    aria-label="Remove badge"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
              <button
                className="admin-status-btn"
                onClick={() => update(i, { trust: [...(s.trust ?? []), { icon: "fa-star", text: "New badge" }] })}
              >
                <i className="fa-solid fa-plus"></i> Add badge
              </button>
            </div>
            <div className="admin-row-actions">
              <span className="admin-id">slide {i + 1}</span>
              <span className="admin-spacer"></span>
              <button className="admin-status-btn admin-status-btn--danger" onClick={() => remove(i)}>
                <i className="fa-solid fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="btn btn--primary btn--block" disabled={saving} onClick={() => void save(slides)}>
        <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving…" : "Save hero changes"}
      </button>
      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> Saved text appears for every new visitor — reload the home page to
        preview. Links look like <code>#picks</code> (home section) or <code>#/category/swallow-hall</code> (stall page).
      </p>
    </>
  );
}

/* ---------------- gallery ---------------- */

function GalleryEditor() {
  const sb = getSupabase();
  const [slides, setSlides] = useState<GallerySlide[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("site_content").select("value").eq("key", "gallery_slides").maybeSingle();
      setSlides(Array.isArray(data?.value) ? (data.value as GallerySlide[]) : []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    async (next: GallerySlide[]) => {
      setSaving(true);
      try {
        const { error } = await sb.from("site_content").upsert({ key: "gallery_slides", value: next });
        if (error) throw error;
        setSlides(next);
        toast("Gallery saved — reload the home page to see it", "fa-floppy-disk");
      } catch (err) {
        toast(errorMessage(err, "Could not save. Are you signed in as admin?"), "fa-triangle-exclamation");
      } finally {
        setSaving(false);
      }
    },
    [sb]
  );

  const uploadImage = async (idx: number, file: File) => {
    setUploading(idx);
    try {
      const url = await uploadSiteImage(sb, "gallery", file);
      if (!slides) throw new Error("not loaded");
      const next = [...slides];
      next[idx] = { ...next[idx], image: url };
      await save(next);
      toast("Image uploaded", "fa-image");
    } catch (err) {
      toast(errorMessage(err, "Upload failed — check admin rights"), "fa-triangle-exclamation");
    } finally {
      setUploading(null);
    }
  };

  if (!slides) return <p className="section-sub">Loading gallery…</p>;

  if (slides.length === 0) {
    return (
      <div className="admin-stack">
        <div className="cart-empty">
          <i className="fa-solid fa-images"></i>
          <strong>No gallery slides in the database</strong>
          <span>Restore the built-in gallery into the database to start editing it.</span>
        </div>
        <button className="btn btn--primary btn--block" disabled={saving} onClick={() => void save(STATIC_GALLERY)}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> Restore the 7 default slides
        </button>
      </div>
    );
  }

  const update = (idx: number, patch: Partial<GallerySlide>) => {
    const next = [...slides];
    next[idx] = { ...next[idx], ...patch };
    setSlides(next);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-filters">
          <span className="admin-count">{slides.length} gallery photos</span>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() =>
            setSlides([
              ...slides,
              {
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
                alt: "A new gallery photo",
                caption: "New photo",
                where: "Bellymall",
              },
            ])
          }
        >
          <i className="fa-solid fa-plus"></i> Add photo
        </button>
      </div>

      {slides.map((s, i) => (
        <div key={i} className="admin-card admin-card--slide">
          <div className="admin-card__media">
            <img src={s.image} alt={s.alt} loading="lazy" />
            <label className="admin-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && void uploadImage(i, e.target.files[0])}
              />
              {uploading === i ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
              Upload
            </label>
          </div>
          <div className="admin-card__fields">
            <div className="admin-two-col">
              <label>
                <span>Caption</span>
                <input value={s.caption} onChange={(e) => update(i, { caption: e.target.value })} />
              </label>
              <label>
                <span>Where (badge)</span>
                <input value={s.where} onChange={(e) => update(i, { where: e.target.value })} />
              </label>
            </div>
            <label>
              <span>Image alt text</span>
              <input value={s.alt} onChange={(e) => update(i, { alt: e.target.value })} />
            </label>
            <div className="admin-row-actions">
              <span className="admin-id">photo {i + 1}</span>
              <span className="admin-spacer"></span>
              <button
                className="admin-status-btn admin-status-btn--danger"
                onClick={() => {
                  if (window.confirm("Remove this gallery photo?")) setSlides(slides.filter((_, k) => k !== i));
                }}
              >
                <i className="fa-solid fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="btn btn--primary btn--block" disabled={saving} onClick={() => void save(slides)}>
        <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving…" : "Save gallery changes"}
      </button>
      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> The gallery is the second carousel on the home page.
      </p>
    </>
  );
}
