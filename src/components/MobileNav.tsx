import { useEffect } from "react";
import { useCart } from "../App";

const LINKS = [
  { label: "Mall directory", href: "#directory" },
  { label: "Hot picks", href: "#picks" },
  { label: "Deals", href: "#deals" },
  { label: "How it works", href: "#how" },
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, setCartOpen } = useCart();

  /* body scroll lock while open */
  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileNavOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileNavOpen]);

  return (
    <nav className={`mobile-nav${mobileNavOpen ? " is-open" : ""}`} id="mobileNav" aria-label="Mobile">
      {LINKS.map((link) => (
        <a key={link.href} className="mnav-link" href={link.href} onClick={() => setMobileNavOpen(false)}>
          {link.label} <i className="fa-solid fa-arrow-right"></i>
        </a>
      ))}
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
        <a href="#picks" className="btn btn--primary" onClick={() => setMobileNavOpen(false)}>
          Order now
        </a>
      </div>
    </nav>
  );
}
