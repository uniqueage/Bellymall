import { useCart } from "../App";
import { useScrollLock } from "../hooks/useScrollLock";
import { CATEGORIES } from "../data";

const PAGES = [
  { label: "Home", href: "#/" },
  { label: "About", href: "#/about" },
  { label: "Sign in", href: "#/signin" },
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, setCartOpen, session } = useCart();
  useScrollLock(mobileNavOpen);

  return (
    <nav className={`mobile-nav${mobileNavOpen ? " is-open" : ""}`} id="mobileNav" aria-label="Mobile">
      <div className="mnav-scroll">
        {PAGES.map((link) => (
          <a key={link.href} className="mnav-link" href={link.href} onClick={() => setMobileNavOpen(false)}>
            {link.label} <i className="fa-solid fa-arrow-right"></i>
          </a>
        ))}
        <a className="mnav-link" href="#directory" onClick={() => setMobileNavOpen(false)}>
          Mall directory <i className="fa-solid fa-arrow-right"></i>
        </a>
        <a className="mnav-link" href="#picks" onClick={() => setMobileNavOpen(false)}>
          Hot picks <i className="fa-solid fa-arrow-right"></i>
        </a>

        <span className="mnav-sub">Stalls</span>
        <div className="mnav-stalls">
          {CATEGORIES.map((c) => (
            <a key={c.id} href={`#/category/${c.id}`} className="mnav-stall" onClick={() => setMobileNavOpen(false)}>
              <i className={`fa-solid ${c.icon}`}></i> {c.shortName}
            </a>
          ))}
        </div>

        <div className="mnav-actions">
          <button
            className="btn btn--dark"
            onClick={() => {
              setMobileNavOpen(false);
              setCartOpen(true);
            }}
          >
            <i className="fa-solid fa-basket-shopping"></i> Basket
          </button>
          {session ? (
            <a href="#/about" className="btn btn--primary" onClick={() => setMobileNavOpen(false)}>
              <i className="fa-solid fa-user"></i> My orders
            </a>
          ) : (
            <a href="#/signin" className="btn btn--primary" onClick={() => setMobileNavOpen(false)}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
