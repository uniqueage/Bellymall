"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { naira, placeOrder, useCart } from "../store";
import { useSettings } from "../lib/settings";
import { useScrollLock } from "../hooks/useScrollLock";
import { toast } from "../toast";
import { track, saveOrderToDb } from "../lib/activity";

/* ============================================================
   CHECKOUT — basket summary, delivery details and payment.
   Delivery pricing comes live from admin → Settings.
   ============================================================ */

export function CheckoutModal() {
  const { cart, clear, checkoutOpen, setCheckoutOpen, setCartOpen, session } = useCart();
  const items = useMemo(() => Array.from(cart.values()), [cart]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.qty * it.price, 0), [items]);
  const [address, setAddress] = useState("12 Awolowo Road, Ikoyi, Lagos");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState<"card" | "transfer" | "delivery">("card");
  const { deliveryFee, freeDeliveryOver } = useSettings();
  const open = checkoutOpen && items.length > 0;
  const router = useRouter();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCheckoutOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setCheckoutOpen]);

  if (!open) return null;

  const delivery = freeDeliveryOver > 0 && subtotal >= freeDeliveryOver ? 0 : deliveryFee;
  const total = subtotal + delivery;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast("Add a phone number so the rider can reach you", "fa-phone");
      return;
    }
    const id = "BM-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const eta = Date.now() + 25 * 60 * 1000;
    placeOrder({
      id,
      items: items.map((it) => ({ name: it.name, qty: it.qty, price: it.price })),
      total,
      placedAt: Date.now(),
      eta,
      address: address.trim(),
      phone: phone.trim(),
    });
    void saveOrderToDb({
      id,
      email: session?.email ?? null,
      items: items.map((it) => ({ name: it.name, qty: it.qty, price: it.price })),
      subtotal,
      delivery,
      total,
      address: address.trim(),
      phone: phone.trim(),
      payment: pay,
      status: "placed",
      eta,
    });
    track({ kind: "order_placed", label: id, meta: { total, items: items.length } });
    clear();
    setCheckoutOpen(false);
    setCartOpen(false);
    toast(`Order ${id} placed — see it on your orders page`, "fa-motorcycle");
    router.push("/about");
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
