import { useCallback, useEffect, useState } from "react";
import { getSupabase, backendReady } from "../lib/supabaseClient";
import { useCart } from "../App";
import { toast } from "../toast";
import { Overview } from "./admin/Overview";
import { Products } from "./admin/Products";
import { Categories } from "./admin/Categories";
import { Orders } from "./admin/Orders";
import { Sellers } from "./admin/Sellers";
import { Customers } from "./admin/Customers";
import { Contents } from "./admin/Contents";
import { Settings } from "./admin/Settings";
import { Activity } from "./admin/Activity";
import { SEARCHABLE, TABS, type Tab } from "./admin/shared";

/* ============================================================
   ADMIN DASHBOARD — Bellymall control room.
   Shell: auth gate, tab navigation and the dashboard-wide search
   box. Each tab renders its own section from ./admin/*.
   ============================================================ */

export function AdminPage() {
  const { session } = useCart();
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
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

  /* keep the search box relevant when switching tabs */
  useEffect(() => {
    setQuery("");
  }, [tab]);

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
            Signed in as {session?.email}. Run the whole mall — products, stalls, sellers, orders, customers and
            content — from here.
          </p>
          <div className="tab-row" role="tablist" aria-label="Admin sections">
            {TABS.map(([id, label, icon]) => (
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
        <div className="admin-toolbar admin-toolbar--search">
          <div className="admin-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                SEARCHABLE.includes(tab)
                  ? `Search ${tab} — name, email, id, status…`
                  : "Search is available in Products, Categories, Orders, Sellers, Customers and Activity"
              }
              disabled={!SEARCHABLE.includes(tab)}
              aria-label="Search this section"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <span className="admin-count">
            <i className="fa-solid fa-database"></i> Supabase connected
          </span>
        </div>

        {tab === "overview" && <Overview onGo={setTab} />}
        {tab === "products" && <Products query={query} />}
        {tab === "categories" && <Categories query={query} />}
        {tab === "orders" && <Orders query={query} />}
        {tab === "sellers" && <Sellers query={query} />}
        {tab === "customers" && <Customers query={query} />}
        {tab === "contents" && <Contents />}
        {tab === "settings" && <Settings />}
        {tab === "activity" && <Activity query={query} />}
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
