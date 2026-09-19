import { useCart } from "../App";
import { toast } from "../toast";

export function CtaPanel() {
  const { setCartOpen } = useCart();

  return (
    <section className="section">
      <div className="container">
        <div className="cta-panel reveal">
          <span className="cta-panel__emoji" aria-hidden="true">
            🍲
          </span>
          <h2 className="cta-panel__title">
            Hungry? Enter the <em>mall</em>.
          </h2>
          <p className="cta-panel__sub">120+ stalls, one basket, zero stress. Your next favourite plate is already cooking.</p>
          <div className="cta-panel__actions">
            <button
              className="btn btn--primary"
              onClick={() => {
                setCartOpen(true);
                toast("Pick your stall below the hood — cart is ready!", "fa-store");
              }}
            >
              <i className="fa-solid fa-bag-shopping"></i> Order online
            </button>
            <a href="#directory" className="btn btn--ghost">
              Browse the directory
            </a>
          </div>
          <span className="cta-panel__note">
            <i className="fa-solid fa-motorcycle"></i> Delivered hot in minutes — belly guaranteed
          </span>
        </div>
      </div>
    </section>
  );
}
