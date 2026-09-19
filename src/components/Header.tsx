import { useMemo } from "react";
import { useCart } from "../App";

export function Header() {
  const { cart, setCartOpen, session, route, mobileNavOpen, setMobileNavOpen } = useCart();
  const totalQty = useMemo(
    () => Array.from(cart.values()).reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const isActive = (hash: string) =>
    (hash === "#/" && route.page === "home") ||
    (hash === "#/about" && route.page === "about") ||
    (hash === "#/signin" && route.page === "signin");

  return (
    <header className="site-header is-scrolled">
      <div className="container header-inner">
        <a className="brand" href="#/" aria-label="Bellymall home">
          <span className="brand-mark" aria-hidden="true">
            <i className="fa-solid fa-utensils"></i>
          </span>
          <span className="brand-word">
            Belly<span>mall</span>
          </span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#/" className={isActive("#/") ? "is-active" : undefined}>
            Home
          </a>
          <a href="#directory">Directory</a>
          <a href="#picks">Hot picks</a>
          <a href="#/about" className={isActive("#/about") ? "is-active" : undefined}>
            About
          </a>
        </nav>

        <div className="header-actions">
          {session ? (
            <a href="#/about" className="user-chip" aria-label="Your account">
              <span className="user-chip__avatar" aria-hidden="true">
                {session.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="user-chip__name">{session.name}</span>
            </a>
          ) : (
            <a href="#/signin" className="btn btn--dark btn--sm header-signin">
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in
            </a>
          )}
          <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Open your basket">
            <i className="fa-solid fa-basket-shopping" aria-hidden="true"></i>
            <span className="cart-badge" hidden={totalQty === 0}>
              {totalQty}
            </span>
          </button>
          <a href="#picks" className="btn btn--primary btn--sm header-order">
            Order now
          </a>
          <button
            className="nav-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobileNav"
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
