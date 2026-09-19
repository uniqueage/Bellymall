import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useReveal } from "./hooks/useReveal";
import { Ticker } from "./components/Ticker";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { Directory } from "./components/Directory";
import { Picks } from "./components/Picks";
import { Deal } from "./components/Deal";
import { HowItWorks } from "./components/HowItWorks";
import { CtaPanel } from "./components/CtaPanel";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { Toaster } from "./components/Toaster";
import type { CartItem } from "./data";

type CartContextValue = {
  cart: Map<string, CartItem>;
  addItem: (item: Omit<CartItem, "qty">) => void;
  changeQty: (id: string, delta: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within App");
  return ctx;
}

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
export { naira };

export default function App() {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const el = document.getElementById("cartClose");
      el?.focus();
    }, 50);
    return () => window.clearTimeout(id);
  }, [cartOpen]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item) => {
      setCart((prev) => {
        const next = new Map(prev);
        const existing = next.get(item.id);
        if (existing) next.set(item.id, { ...existing, qty: existing.qty + 1 });
        else next.set(item.id, { ...item, qty: 1 });
        return next;
      });
    };
    const changeQty: CartContextValue["changeQty"] = (id, delta) => {
      setCart((prev) => {
        const next = new Map(prev);
        const existing = next.get(id);
        if (!existing) return prev;
        const qty = existing.qty + delta;
        if (qty <= 0) next.delete(id);
        else next.set(id, { ...existing, qty });
        return next;
      });
    };
    return {
      cart,
      addItem,
      changeQty,
      clear: () => setCart(new Map()),
      cartOpen,
      setCartOpen,
      mobileNavOpen,
      setMobileNavOpen,
    };
  }, [cart, cartOpen, mobileNavOpen]);

  return (
    <CartContext.Provider value={value}>
      <Ticker />
      <Header scrolled={scrolled} />
      <MobileNav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Directory />
        <Picks />
        <Deal />
        <HowItWorks />
        <CtaPanel />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </CartContext.Provider>
  );
}
