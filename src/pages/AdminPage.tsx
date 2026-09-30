import { useCallback, useEffect, useState } from "react";
import { getSupabase, backendReady } from "../lib/supabaseClient";
import type { HeroRow } from "../lib/content";
import { useCart } from "../App";
import { toast } from "../toast";
import { HERO_SLIDES as STATIC_HERO, GALLERY_SLIDES as STATIC_GALLERY, type Category, type GallerySlide, type HeroSlide, type MenuItem } from "../data";

/* ============================================================
   ADMIN DASHBOARD — Bellymall control room
   Sections: Overview · Hero · Stalls & dishes · Orders · Activity
   Works only when the Supabase backend is configured.
   ============================================================ */

type OrderRow = {
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

type ActivityRow = {
  id: number;
  session_id: string;
  email: string | null;
  kind: string;
  label: string | null;
  meta: Record<string, unknown> | null;
  path: string | null;
  created_at: string;
};

type Tab = "overview" | "hero" | "stalls" | "orders" | "activity";

const KIND_META: Record<string, { icon: string; label: string }> = {
  page_view: { icon: "fa-eye", label: "Viewed page" },
  category_view: { icon: "fa-store", label: "Opened stall" },
  add_to_cart: { icon: "fa-cart-plus", label: "Added to basket" },
  checkout_open: { icon: "fa-cash-register", label: "Checkout" },
  order_placed: { icon: "fa-receipt", label: "Order placed" },
  sign_in: { icon: "fa-arrow-right-to-bracket", label: "Signed in" },
  sign_up: { icon: "fa-user-plus", label: "Created account" },
  sign_out: { icon: "fa-arrow-right-from-bracket", label: "Signed out" },
};

const STATUS_META: Record<string, { icon: string; label: string }> = {
  placed: { icon: "fa-hourglass-half", label: "Placed" },
  preparing: { icon: "fa-fire-burner", label: "Preparing" },
  on_the_way: { icon: "fa-motorcycle", label: "On the way" },
  delivered: { icon: "fa-circle-check", label: "Delivered" },
  cancelled: { icon: "fa-circle-xmark", label: "Cancelled" },
};

const STATUSES = ["placed", "preparing", "on_the_way", "delivered", "cancelled"] as const;

function timeAgo(iso: string): string {
  const secs = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AdminPage() {
  const { session } = useCart();
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [booting, setBooting] = useState(true);

  /* ------------ auth gate ------------ */
  const check = useCallback(async () => {
    if (!backendReady) {
      setIsAdmin(false);
      setBooting(false);
      return;
    }
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) {
      setIsAdmin(false);
      setBooting(false);
      return;
    }
    const { data: row } = await sb.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
    setIsAdmin(Boolean(row));
    setBooting(false);
  }, []);

  useEffect(() => {
    if (!backendReady) {
      setBooting(false);
      return;
    }
    void check();
    const { data: sub } = getSupabase().auth.onAuthStateChange(() => void check());
    return () => sub.subscription.unsubscribe();
  }, [check]);

  if (!backendReady) {
    return (
      <section className="section page-pad">
        <div className="container admin-gate">
          <i className="fa-solid fa-plug-circle-xmark"></i>
          <h1 className="section-title">Backend not connected</h1>
          <p className="section-sub">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment, then run
            the SQL in <code>supabase/schema.sql</code> inside the Supabase SQL editor.
          </p>
        </div>
      </section>
    );
  }

  if (booting) {
    return (
      <section className="section page-pad">
        <div className="container admin-gate">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p className="section-sub">Checking your access…</p>
        </div>
      </section>
    );
  }

  if (isAdmin === false) {
    return <AdminAuth onSignedIn={() => void check()} />;
  }

  if (isAdmin === null) {
    /* session exists but the admins row hasn't confirmed yet */
    return (
      <section className="section page-pad">
        <div className="container admin-gate">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p className="section-sub">Verifying admin rights…</p>
        </div>
      </section>
    );
  }

  return (
    <div className="page-pad admin-page">
      <section className="about-hero">
        <div className="container">
          <span className="eyebrow">Bellymall control room</span>
          <h1 className="section-title">
            Admin <em>dashboard</em>
          </h1>
          <p className="section-sub">
            Signed in as {session?.email}. Edit the storefront, manage orders and watch customers in real time.
          </p>
          <div className="tab-row" role="tablist" aria-label="Admin sections">
            {(
              [
                ["overview", "Overview", "fa-gauge-high"],
                ["hero", "Hero & gallery", "fa-image"],
                ["stalls", "Stalls & dishes", "fa-store"],
                ["orders", "Orders", "fa-receipt"],
                ["activity", "Live activity", "fa-wave-square"],
              ] as [Tab, string, string][]
            ).map(([id, label, icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={`tab-btn${tab === id ? " is-active" : ""}`}
                onClick={() => setTab(id)}
              >
                <i className={`fa-solid ${icon}`}></i> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {tab === "overview" && <Overview onGo={setTab} />}
        {tab === "hero" && (
          <>
            <HeroEditor />
            <GalleryEditor />
          </>
        )}
        {tab === "stalls" && <StallsEditor />}
        {tab === "orders" && <OrdersBoard />}
        {tab === "activity" && <ActivityFeed />}
      </div>
    </div>
  );
}

/* ============================================================
   AUTH CARD
   ============================================================ */

function AdminAuth({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const sb = getSupabase();
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
      }
      // Bootstrap claim: the FIRST account inserts itself into public.admins
      // (RLS allows this while the admins table is still empty). If the slot is
      // already taken the insert is rejected by RLS and quietly ignored.
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        await sb.from("admins").upsert(
          { user_id: user.id, email: user.email ?? email },
          { onConflict: "user_id" }
        );
      }
      toast("Admin signed in", "fa-user-shield");
      onSignedIn();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Authentication failed", "fa-triangle-exclamation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section page-pad">
      <div className="container auth-wrap">
        <div className="auth-card">
          <span className="auth-avatar" aria-hidden="true">
            <i className="fa-solid fa-user-shield"></i>
          </span>
          <h1 className="section-title">
            Admin <em>access</em>
          </h1>
          <p className="section-sub">
            {mode === "signin"
              ? "Sign in with your Supabase admin account."
              : "The first account created becomes the store admin."}
          </p>
          <form className="auth-form" onSubmit={submit}>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bellymall.ng"
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create admin account"}
            </button>
          </form>
          <p className="auth-switch">
            {mode === "signin" ? (
              <>
                No admin yet?{" "}
                <button className="link-btn" onClick={() => setMode("signup")}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button className="link-btn" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
        <aside className="auth-aside">
          <h2>
            <i className="fa-solid fa-shield-halved"></i> How admin works
          </h2>
          <ul>
            <li>
              <i className="fa-solid fa-database"></i> Accounts live in Supabase Auth — real, secure, per-device.
            </li>
            <li>
              <i className="fa-solid fa-user-gear"></i> The first registration claims admin automatically.
            </li>
            <li>
              <i className="fa-solid fa-lock"></i> Only admins can edit content or read orders/activity.
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

/* ============================================================
   OVERVIEW
   ============================================================ */

function Overview({ onGo }: { onGo: (t: Tab) => void }) {
  const sb = getSupabase();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, activity: 0, baskets: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [orders, activity, adds] = await Promise.all([
        sb.from("orders").select("total"),
        sb.from("activity").select("kind"),
        sb.from("activity").select("kind").eq("kind", "add_to_cart"),
      ]);
      if (cancelled) return;
      const totals = (orders.data ?? []) as { total: number }[];
      setStats({
        orders: totals.length,
        revenue: totals.reduce((s, o) => s + o.total, 0),
        activity: (activity.data ?? []).length,
        baskets: (adds.data ?? []).length,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards: { label: string; value: string; icon: string; tab: Tab }[] = [
    { label: "Orders", value: String(stats.orders), icon: "fa-receipt", tab: "orders" },
    { label: "Revenue", value: "₦" + stats.revenue.toLocaleString("en-NG"), icon: "fa-naira-sign", tab: "orders" },
    { label: "Customer events", value: String(stats.activity), icon: "fa-wave-square", tab: "activity" },
    { label: "Basket adds", value: String(stats.baskets), icon: "fa-cart-plus", tab: "activity" },
  ];

  return (
    <div className="admin-grid">
      {cards.map((c) => (
        <button key={c.label} className="admin-stat" onClick={() => onGo(c.tab)}>
          <span className="admin-stat__icon">
            <i className={`fa-solid ${c.icon}`}></i>
          </span>
          <strong>{c.value}</strong>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   HERO & GALLERY EDITOR
   ============================================================ */

type Sb = ReturnType<typeof getSupabase>;

async function uploadSiteImage(sb: Sb, prefix: string, file: File): Promise<string> {
  const path = `${prefix}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await sb.storage.from("site-images").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("site-images").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("no url");
  return data.publicUrl;
}

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
      } catch {
        toast("Could not save. Are you signed in as admin?", "fa-triangle-exclamation");
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
    } catch {
      toast("Upload failed — check admin rights", "fa-triangle-exclamation");
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

  return (
    <div className="admin-stack">
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
    </div>
  );
}

/* ============================================================
   GALLERY EDITOR
   ============================================================ */

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
      } catch {
        toast("Could not save. Are you signed in as admin?", "fa-triangle-exclamation");
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
    } catch {
      toast("Upload failed — check admin rights", "fa-triangle-exclamation");
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
    <div className="admin-stack">
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
          </div>
        </div>
      ))}
      <button className="btn btn--primary btn--block" disabled={saving} onClick={() => void save(slides)}>
        <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving…" : "Save gallery changes"}
      </button>
      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> The gallery is the second carousel on the home page.
      </p>
    </div>
  );
}

/* ============================================================
   STALLS & DISHES EDITOR
   ============================================================ */

function StallsEditor() {
  const sb = getSupabase();
  type AdminDish = MenuItem & { category_id: string; available?: boolean };
  type AdminCat = Omit<Category, "menu"> & { menu: AdminDish[] };
  const [cats, setCats] = useState<AdminCat[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadItem, setUploadItem] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [catsRes, itemsRes] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("menu_items").select("*").order("sort_order"),
    ]);
    if (!catsRes.data) return;
    type AdminDish = MenuItem & { category_id: string; available?: boolean };
    const byCat = new Map<string, AdminDish[]>();
    for (const row of (itemsRes.data ?? []) as AdminDish[]) {
      const list = byCat.get(row.category_id) ?? [];
      list.push({ ...row });
      byCat.set(row.category_id, list);
    }
    setCats(
      (catsRes.data as (Category & { image_alt: string })[]).map((c) => ({
        ...c,
        imageAlt: c.image_alt,
        menu: byCat.get(c.id) ?? [],
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePrice = async (itemId: string, price: number) => {
    setSavingId(itemId);
    const { error } = await sb.from("menu_items").update({ price }).eq("id", itemId);
    setSavingId(null);
    if (error) {
      toast("Could not save price", "fa-triangle-exclamation");
      return;
    }
    toast("Price updated — live now", "fa-floppy-disk");
  };

  const saveAvailability = async (itemId: string, available: boolean) => {
    const { error } = await sb.from("menu_items").update({ available }).eq("id", itemId);
    if (error) {
      toast("Could not update", "fa-triangle-exclamation");
      return;
    }
    toast(available ? "Dish is back on the menu" : "Dish hidden from the menu", "fa-floppy-disk");
    void load();
  };

  const uploadImage = async (itemId: string, file: File) => {
    setUploadItem(itemId);
    try {
      const path = `dishes/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await sb.storage.from("site-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = sb.storage.from("site-images").getPublicUrl(path);
      if (!data) throw new Error("no url");
      const { error: upErr } = await sb.from("menu_items").update({ image: data.publicUrl }).eq("id", itemId);
      if (upErr) throw upErr;
      toast("Dish image updated", "fa-image");
      void load();
    } catch {
      toast("Upload failed — check admin rights", "fa-triangle-exclamation");
    } finally {
      setUploadItem(null);
    }
  };

  if (!cats) return <p className="section-sub">Loading stalls…</p>;

  return (
    <div className="admin-stack">
      {cats.map((c) => (
        <div key={c.id} className="admin-card admin-card--stall">
          <header className="admin-stall-head">
            <i className={`fa-solid ${c.icon}`}></i>
            <strong>{c.name}</strong>
            <span>{c.menu.length} dishes</span>
          </header>
          <div className="admin-dishes">
            {c.menu.map((m) => (
              <div key={m.id} className="admin-dish">
                <img src={m.image} alt={m.alt} loading="lazy" />
                <label className="admin-upload admin-upload--sm">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(m.id, e.target.files[0])} />
                  {uploadItem === m.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
                </label>
                <div className="admin-dish__info">
                  <strong>{m.name}</strong>
                  <div className="admin-dish__row">
                    <span className="admin-naira">₦</span>
                    <input
                      type="number"
                      min={0}
                      defaultValue={m.price}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== m.price && v >= 0) void savePrice(m.id, v);
                      }}
                    />
                    {savingId === m.id && <i className="fa-solid fa-spinner fa-spin"></i>}
                  </div>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={m.available ?? true}
                      onChange={(e) => void saveAvailability(m.id, e.target.checked)}
                    />
                    Available
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> Change a price and click away — it saves instantly. Uncheck
        "Available" to hide a dish that sold out.
      </p>
    </div>
  );
}

/* ============================================================
   ORDERS BOARD
   ============================================================ */

function OrdersBoard() {
  const sb = getSupabase();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      setOrders((data ?? []) as OrderRow[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* realtime inserts */
  useEffect(() => {
    const channel = sb
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => [payload.new as OrderRow, ...(prev ?? [])]);
        toast("New order received!", "fa-bell");
      })
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: string) => {
    await sb.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => (prev ?? []).map((o) => (o.id === id ? { ...o, status } : o)));
    toast(`Order ${id} → ${status.replace(/_/g, " ")}`, "fa-motorcycle");
  };

  if (!orders) return <p className="section-sub">Loading orders…</p>;

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-stack">
      <div className="tab-row" role="tablist" aria-label="Order status filter">
        {["all", ...STATUSES].map((s) => (
          <button key={s} className={`tab-btn${filter === s ? " is-active" : ""}`} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : STATUS_META[s]?.label ?? s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-receipt"></i>
          <strong>No orders here yet</strong>
          <span>Orders placed on the storefront appear here instantly.</span>
        </div>
      )}

      {shown.map((o) => (
        <article key={o.id} className="order-card">
          <header className="order-card__head">
            <strong>{o.id}</strong>
            <span className="order-card__email">{o.email ?? "guest"}</span>
            <span className="order-card__when">{timeAgo(o.created_at)}</span>
          </header>
          <ul className="order-card__items">
            {o.items.map((it) => (
              <li key={it.name}>
                {it.qty} × {it.name} — ₦{(it.price * it.qty).toLocaleString("en-NG")}
              </li>
            ))}
          </ul>
          <footer className="order-card__foot">
            <span>
              <i className="fa-solid fa-location-dot"></i> {o.address} · <i className="fa-solid fa-phone"></i> {o.phone}
            </span>
            <strong>₦{o.total.toLocaleString("en-NG")}</strong>
          </footer>
          <div className="order-card__actions">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`admin-status-btn${o.status === s ? " is-active" : ""}`}
                onClick={() => void setStatus(o.id, s)}
              >
                <i className={`fa-solid ${STATUS_META[s].icon}`}></i> {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ============================================================
   LIVE ACTIVITY FEED
   ============================================================ */

function ActivityFeed() {
  const sb = getSupabase();
  const [rows, setRows] = useState<ActivityRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("activity").select("*").order("created_at", { ascending: false }).limit(80);
      setRows((data ?? []) as ActivityRow[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* realtime appends */
  useEffect(() => {
    const channel = sb
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity" }, (payload) => {
        setRows((prev) => [payload.new as ActivityRow, ...(prev ?? [])]);
      })
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) return <p className="section-sub">Loading activity…</p>;

  return (
    <div className="admin-stack">
      <p className="admin-hint">
        <i className="fa-solid fa-wave-square"></i> Live — new customer actions stream in automatically.
      </p>
      {rows.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-wave-square"></i>
          <strong>No customer activity yet</strong>
          <span>Open the site in another tab and click around — events appear here instantly.</span>
        </div>
      )}
      <ul className="activity-list">
        {rows.map((r) => {
          const meta = KIND_META[r.kind] ?? { icon: "fa-circle-dot", label: r.kind };
          return (
            <li key={r.id} className="activity-row">
              <span className="activity-row__icon">
                <i className={`fa-solid ${meta.icon}`}></i>
              </span>
              <div className="activity-row__body">
                <strong>{meta.label}</strong>
                <span>
                  {r.label ?? ""}
                  {r.email ? ` · ${r.email}` : " · guest"}
                </span>
              </div>
              <time>{timeAgo(r.created_at)}</time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
