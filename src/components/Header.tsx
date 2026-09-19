import { useMemo } from "react";
import { useCart } from "../App";

type HeaderProps = { scrolled: boolean };

export function Header({ scrolled }: HeaderProps) {
  const { cart, setCartOpen, mobileNavOpen, setMobileNavOpen } = useCart();
  const totalQty = useMemo(
    () => Array.from(cart.values()).reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="siteHeader">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Bellymall home">
          <span className="brand-mark" aria-hidden="true">
            <i className="fa-solid fa-utensils"></i>
          </span>
          <span className="brand-word">
            Belly<span>mall</span>
          </span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#directory">Directory</a>
          <a href="#picks">Hot picks</a>
          <a href="#deals">Deals</a>
          <a href="#how">How it works</a>
        </nav>

        <div className="header-actions">
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
