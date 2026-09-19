import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useReveal } from "./hooks/useReveal";
import { useScrollLock } from "./hooks/useScrollLock";
import { parseRoute, navigate, type Route } from "./router";
import { sessionStore, type Session } from "./session";
import { Ticker } from "./components/Ticker";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { Directory } from "./components/Directory";
import { Picks } from "./components/Picks";
import { Gallery } from "./components/Gallery";
import { Deal } from "./components/Deal";
import { HowItWorks } from "./components/HowItWorks";
import { CtaPanel } from "./components/CtaPanel";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { Toaster } from "./components/Toaster";
import { CategoryPage } from "./pages/CategoryPage";
import { AboutPage } from "./pages/AboutPage";
import { SignInPage } from "./pages/SignInPage";
import type { CartItem } from "./data";
import { toast } from "./toast";

type CartContextValue = {
  cart: Map<string, CartItem>;
  addItem: (item: Omit<CartItem, "qty">) => void;
  changeQty: (id: string, delta: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  session: Session | null;
  route: Route;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within App");
  return ctx;
}

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

/* ---------------- orders (demo persistence) ---------------- */

export type Order = {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  placedAt: number;
  eta: number;
  address: string;
  phone: string;
};

const ORDERS_KEY = "bellymall-orders";
const orderListeners = new Set<() => void>();

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as Order[];
  } catch {
    return [];
  }
}

let orders: Order[] = readOrders();

function emitOrders() {
  orderListeners.forEach((fn) => fn());
}

function placeOrder(order: Order) {
  orders = [order, ...orders].slice(0, 20);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
  emitOrders();
}

function subscribeOrders(fn: () => void) {
  orderListeners.add(fn);
  return () => {
    orderListeners.delete(fn);
  };
}

function useOrders(): Order[] {
  return useSyncExternalStore(subscribeOrders, () => orders, () => orders);
}

/* ---------------- checkout modal ---------------- */

function CheckoutModal() {
  const { cart, clear, checkoutOpen, setCheckoutOpen, setCartOpen, session } = useCart();
  const items = useMemo(() => Array.from(cart.values()), [cart]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.qty * it.price, 0), [items]);
  const [address, setAddress] = useState("12 Awolowo Road, Ikoyi, Lagos");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState<"card" | "transfer" | "delivery">("card");
  const open = checkoutOpen && items.length > 0;

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCheckoutOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setCheckoutOpen]);

  if (!open) return null;

  const delivery = subtotal >= 10000 ? 0 : 900;
  const total = subtotal + delivery;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast("Add a phone number so the rider can reach you", "fa-phone");
      return;
    }
    const id = "BM-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    placeOrder({
      id,
      items: items.map((it) => ({ name: it.name, qty: it.qty, price: it.price })),
      total,
      placedAt: Date.now(),
      eta: Date.now() + 25 * 60 * 1000,
      address: address.trim(),
      phone: phone.trim(),
    });
    clear();
    setCheckoutOpen(false);
    setCartOpen(false);
    toast(`Order ${id} placed — see it on your About page`, "fa-motorcycle");
    navigate("#/about");
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="modal-overlay" onClick={() => setCheckoutOpen(false)} />
      <div className="modal-card">
        <header className="modal-head">
          <h3>
            <i className="fa-solid fa-bag-shopping"></i> Checkout
          </h3>
          <button className="icon-btn" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-summary">
            {items.map((it) => (
              <div key={it.id} className="modal-line">
                <span>
                  {it.qty} × {it.name}
                </span>
                <strong>{naira(it.qty * it.price)}</strong>
              </div>
            ))}
            <div className="modal-line modal-line--muted">
              <span>Delivery</span>
              <strong>{delivery === 0 ? "Free" : naira(delivery)}</strong>
            </div>
            <div className="modal-line modal-line--total">
              <span>Total</span>
              <strong>{naira(total)}</strong>
            </div>
          </div>

          <label className="field">
            <span>Deliver to</span>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, area, city"
              required
            />
          </label>
          <label className="field">
            <span>Phone number</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0803 123 4567"
              inputMode="tel"
              required
            />
          </label>

          <fieldset className="pay-row">
            <legend>Payment</legend>
            {(
              [
                { id: "card", label: "Card", icon: "fa-credit-card" },
                { id: "transfer", label: "Transfer", icon: "fa-building-columns" },
                { id: "delivery", label: "On delivery", icon: "fa-hand-holding-dollar" },
              ] as const
            ).map((opt) => (
              <label key={opt.id} className={`pay-opt${pay === opt.id ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name="pay"
                  value={opt.id}
                  checked={pay === opt.id}
                  onChange={() => setPay(opt.id)}
                />
                <i className={`fa-solid ${opt.icon}`}></i> {opt.label}
              </label>
            ))}
          </fieldset>

          <button className="btn btn--primary btn--block" type="submit">
            Place order · {naira(total)} <i className="fa-solid fa-arrow-right"></i>
          </button>
          <p className="modal-fine">
            <i className="fa-solid fa-shield-halved"></i>
            {session
              ? `Signed in as ${session.email} — demo checkout, no real charge.`
              : "Demo checkout — no real charge. Sign in to keep your order history."}
          </p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- app ---------------- */

export default function App() {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const routeKey = route.page === "category" ? `category:${route.id}` : route.page;
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getSnapshot);
  const orders = useOrders();

  useReveal(routeKey);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /* scroll to top on page change; restore home-anchor targets (e.g. #picks from another page) */
  useEffect(() => {
    if (route.page !== "home") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const hash = window.location.hash;
    if (hash.startsWith("#/") || !hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "auto" }));
  }, [route, routeKey]);

  useEffect(() => {
    if (!cartOpen) return;
    const id = window.setTimeout(() => document.getElementById("cartClose")?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [cartOpen]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) next.set(item.id, { ...existing, qty: existing.qty + 1 });
      else next.set(item.id, { ...item, qty: 1 });
      return next;
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (!existing) return prev;
      const qty = existing.qty + delta;
      if (qty <= 0) next.delete(id);
      else next.set(id, { ...existing, qty });
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart(new Map()), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      changeQty,
      clear,
      cartOpen,
      setCartOpen,
      mobileNavOpen,
      setMobileNavOpen,
      checkoutOpen,
      setCheckoutOpen,
      session,
      route,
    }),
    [cart, addItem, changeQty, clear, cartOpen, mobileNavOpen, checkoutOpen, session, route]
  );

  const isHome = route.page === "home";

  return (
    <CartContext.Provider value={value}>
      <Ticker />
      <Header />
      <MobileNav />
      <main>
        {isHome && (
          <>
            <Hero />
            <Stats />
            <Features />
            <Directory />
            <Picks />
            <Gallery />
            <Deal />
            <HowItWorks />
            <CtaPanel />
          </>
        )}
        {route.page === "category" && <CategoryPage id={route.id} />}
        {route.page === "about" && <AboutPage orders={orders} />}
        {route.page === "signin" && <SignInPage />}
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <Toaster />
    </CartContext.Provider>
  );
}

export { placeOrder, subscribeOrders, readOrders };
