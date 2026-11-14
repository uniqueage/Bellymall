"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem } from "./data";
import { sessionStore, type Session } from "./session";

/* ============================================================
   SHOPPING STATE — basket, checkout, mobile nav and the shopper
   session, shared by every storefront surface.
   ============================================================ */

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export type CartContextValue = {
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
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot
  );

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
    }),
    [cart, addItem, changeQty, clear, cartOpen, mobileNavOpen, checkoutOpen, session]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ============================================================
   ORDERS — demo persistence on this device, mirrored to Supabase
   when a backend is configured.
   ============================================================ */

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
const EMPTY_ORDERS: Order[] = [];
const orderListeners = new Set<() => void>();

export function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]") as Order[];
  } catch {
    return EMPTY_ORDERS;
  }
}

let orders: Order[] = typeof window === "undefined" ? EMPTY_ORDERS : readOrders();

function emitOrders() {
  orderListeners.forEach((fn) => fn());
}

export function placeOrder(order: Order) {
  orders = [order, ...orders].slice(0, 20);
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
  emitOrders();
}

export function subscribeOrders(fn: () => void) {
  orderListeners.add(fn);
  return () => {
    orderListeners.delete(fn);
  };
}

export function useOrders(): Order[] {
  return useSyncExternalStore(
    subscribeOrders,
    () => orders,
    () => EMPTY_ORDERS
  );
}
