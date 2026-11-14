"use client";

import Link from "next/link";
import { useCart } from "../store";
import { useScrollLock } from "../hooks/useScrollLock";
import { useCatalog } from "../lib/catalog";

const PAGES = [
  { label: "Home", href: "/" },
  { label: "Mall directory", href: "/#directory" },
  { label: "Hot picks", href: "/#picks" },
  { label: "About", href: "/about" },
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, setCartOpen, session } = useCart();
  const { categories } = useCatalog();
  useScrollLock(mobileNavOpen);

  return (
    <nav className={`mobile-nav${mobileNavOpen ? " is-open" : ""}`} id="mobileNav" aria-label="Mobile">
      <div className="mnav-scroll">
        {PAGES.map((link) => (
          <Link
            key={link.href}
            className="mnav-link"
            href={link.href}
            onClick={() => setMobileNavOpen(false)}
          >
            {link.label} <i className="fa-solid fa-arrow-right"></i>
          </Link>
        ))}

        <span className="mnav-sub">Stalls</span>
        <div className="mnav-stalls">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/stall/${c.id}`}
              className="mnav-stall"
              onClick={() => setMobileNavOpen(false)}
            >
              <i className={`fa-solid ${c.icon}`}></i> {c.shortName}
            </Link>
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
            <Link href="/about" className="btn btn--primary" onClick={() => setMobileNavOpen(false)}>
              <i className="fa-solid fa-user"></i> My orders
            </Link>
          ) : (
            <Link href="/signin" className="btn btn--primary" onClick={() => setMobileNavOpen(false)}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
