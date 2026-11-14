"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../store";
import { openSearch } from "./SearchOverlay";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/#directory" },
  { label: "Hot picks", href: "/#picks" },
  { label: "About", href: "/about" },
];

export function Header() {
  const { cart, setCartOpen, session, mobileNavOpen, setMobileNavOpen } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const totalQty = useMemo(
    () => Array.from(cart.values()).reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Bellymall home">
          <span className="brand-mark" aria-hidden="true">
            <i className="fa-solid fa-utensils"></i>
          </span>
          <span className="brand-word">
            Belly<span>mall</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {session ? (
            <Link href="/about" className="user-chip" aria-label="Your account">
              <span className="user-chip__avatar" aria-hidden="true">
                {session.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="user-chip__name">{session.name}</span>
            </Link>
          ) : (
            <Link href="/signin" className="btn btn--dark btn--sm header-signin">
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign in
            </Link>
          )}
          <button className="search-btn" onClick={openSearch} aria-label="Search dishes and stalls">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          </button>
          <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Open your basket">
            <i className="fa-solid fa-basket-shopping" aria-hidden="true"></i>
            <span className="cart-badge" hidden={totalQty === 0}>
              {totalQty}
            </span>
          </button>
          <Link href="/#picks" className="btn btn--primary btn--sm header-order">
            Order now
          </Link>
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
