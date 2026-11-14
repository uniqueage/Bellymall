"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useReveal } from "./hooks/useReveal";
import { CartProvider, useCart } from "./store";
import { Ticker } from "./components/Ticker";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { Toaster } from "./components/Toaster";
import { SearchOverlay } from "./components/SearchOverlay";
import { initCatalog } from "./lib/catalog";
import { loadSettings } from "./lib/settings";
import { track } from "./lib/activity";

/* ============================================================
   APP SHELL — the storefront chrome that wraps every route.
   ============================================================ */

function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setMobileNavOpen } = useCart();

  useReveal(pathname);

  /* boot the live catalog + store settings once */
  useEffect(() => {
    initCatalog();
    void loadSettings();
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    track({ kind: "page_view", label: pathname });
    /* keep the top of each page in view; #anchors handle their own scroll */
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, setMobileNavOpen]);

  return (
    <>
      <Ticker />
      <Header />
      <MobileNav />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <SearchOverlay />
      <Toaster />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Chrome>{children}</Chrome>
    </CartProvider>
  );
}
