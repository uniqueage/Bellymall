import { useState } from "react";
import { useCart } from "../App";
import { sessionStore } from "../session";
import { toast } from "../toast";

export function SignInPage() {
  const { session, setCartOpen } = useCart();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStore.signIn(email.trim());
    toast(mode === "signin" ? "Welcome back to the mall!" : "Account created — welcome to the mall!", "fa-user");
    setPassword("");
  };

  /* already signed in */
  if (session) {
    return (
      <section className="section page-pad">
        <div className="container auth-card auth-card--signedin">
          <span className="auth-avatar" aria-hidden="true">
            <i className="fa-solid fa-user"></i>
          </span>
          <h1 className="section-title">
            You're signed in, <em>{session.name}</em>
          </h1>
          <p className="section-sub">{session.email}</p>
          <p className="auth-note">
            Your basket and order history stay on this device. Sign out any time — the mall is always open.
          </p>
          <div className="auth-actions">
            <button className="btn btn--primary" onClick={() => setCartOpen(true)}>
              <i className="fa-solid fa-basket-shopping"></i> Open your basket
            </button>
            <button className="btn btn--dark" onClick={() => sessionStore.signOut()}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-pad">
      <div className="container auth-wrap">
        <div className="auth-card">
          <span className="auth-avatar" aria-hidden="true">
            <i className="fa-solid fa-utensils"></i>
          </span>
          <h1 className="section-title">
            {mode === "signin" ? (
              <>
                Welcome back to the <em>mall</em>
              </>
            ) : (
              <>
                Join the <em>mall</em>
              </>
            )}
          </h1>
          <p className="section-sub">
            {mode === "signin"
              ? "Sign in to keep your basket and order history in one place."
              : "Create an account — one basket for every stall, and your orders all in one place."}
          </p>

          <form className="auth-form" onSubmit={submit}>
            <label className="field">
              <span>Email address</span>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
            <button className="btn btn--primary btn--block" type="submit">
              {mode === "signin" ? (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i> Create account
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "signin" ? (
              <>
                New to Bellymall?{" "}
                <button className="link-btn" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="link-btn" onClick={() => setMode("signin")}>
                  Sign in instead
                </button>
              </>
            )}
          </p>

          <p className="auth-note">
            <i className="fa-solid fa-shield-halved"></i> Demo authentication — details stay on this device only.
          </p>
        </div>

        <aside className="auth-aside">
          <h2>
            <i className="fa-solid fa-star"></i> Why join?
          </h2>
          <ul>
            <li>
              <i className="fa-solid fa-basket-shopping"></i> One basket across every stall
            </li>
            <li>
              <i className="fa-solid fa-receipt"></i> Order history with live ETA
            </li>
            <li>
              <i className="fa-solid fa-tags"></i> Members-only deals like <strong>BELLY10</strong>
            </li>
            <li>
              <i className="fa-solid fa-motorcycle"></i> Faster checkout, saved addresses
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
