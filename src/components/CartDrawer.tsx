import { useEffect, useMemo } from "react";
import { useCart, naira } from "../App";
import { toast } from "../toast";

export function CartDrawer() {
  const { cart, changeQty, cartOpen, setCartOpen } = useCart();
  const items = useMemo(() => Array.from(cart.values()), [cart]);
  const totalQty = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.qty * it.price, 0), [items]);

  /* Esc-to-close */
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  /* body scroll lock while open */
  useEffect(() => {
    document.body.classList.toggle("no-scroll", cartOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [cartOpen]);

  return (
    <>
      <div className={`cart-overlay${cartOpen ? " is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside
        className={`cart-drawer${cartOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your belly basket"
        aria-hidden={!cartOpen}
      >
        <header className="cart-head">
          <div>
            <h3>Your basket</h3>
            <span className="cart-count-line">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </span>
          </div>
        <button className="icon-btn" id="cartClose" onClick={() => setCartOpen(false)} aria-label="Close basket">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>
      <div className="cart-items">
            {items.length === 0 ? (
              <div className="cart-empty">
                <i className="fa-solid fa-basket-shopping"></i>
                <strong>Your belly cart is empty</strong>
                <span>Add something tasty from the mall and it lands right here.</span>
              </div>
            ) : (
              items.map((it) => (
                <div key={it.id} className="cart-item">
                  <span className="cart-item__thumb">
                    <i className={`fa-solid ${it.icon}`}></i>
                  </span>
                  <div>
                    <div className="cart-item__name">{it.name}</div>
                    <div className="cart-item__price">{naira(it.price)}</div>
                  </div>
                  <div className="cart-item__qty">
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(it.id, -1)}
                      aria-label={`Decrease ${it.name}`}
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span className="qty-val">{it.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(it.id, 1)}
                      aria-label={`Increase ${it.name}`}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
            ))
          )}
      </div>
      <footer className="cart-foot">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <strong>{naira(subtotal)}</strong>
            </div>
            <p className="cart-note">
              <i className="fa-solid fa-truck-fast"></i> Free delivery on orders over ₦10,000
            </p>
            <button
              className="btn btn--primary btn--block"
              onClick={() => {
                if (items.length === 0) {
                  toast("Your basket is empty — add something tasty first!", "fa-basket-shopping");
                  return;
                }
                toast("Demo checkout — your belly approves! 🍽️", "fa-utensils");
              }}
            >
            Checkout <i className="fa-solid fa-arrow-right"></i>
          </button>
        </footer>
      </aside>
    </>
  );
}
