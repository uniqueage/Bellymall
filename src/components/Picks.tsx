import { DISHES } from "../data";
import { useCart } from "../App";
import { toast } from "../toast";

export function Picks() {
  const { addItem } = useCart();

  return (
    <section className="section" id="picks">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Trending today</span>
          <h2 className="section-title">
            Today's <em>hot picks</em>
          </h2>
          <p className="section-sub">What the mall is ordering right now — straight from the stoves to your street.</p>
        </div>

        <div className="dish-grid">
          {DISHES.map((dish, i) => (
            <article
              key={dish.id}
              className="dish reveal"
              style={{ "--reveal-delay": `${i * 0.08}s` } as React.CSSProperties}
            >
              <div className="dish__media">
                <img src={dish.image} alt={dish.alt} loading="lazy" />
                <span className="dish__tag">{dish.tag}</span>
                <span className="dish__rating">
                  <i className="fa-solid fa-star"></i> {dish.rating}
                </span>
              </div>
              <div className="dish__body">
                <span className="dish__stall">
                  <i className="fa-solid fa-store"></i> {dish.stall}
                </span>
                <h3 className="dish__name">{dish.name}</h3>
                <div className="dish__foot">
                  <span className="dish__price">₦{dish.price.toLocaleString("en-NG")}</span>
                  <button
                    className="dish__add"
                    aria-label={`Add ${dish.name} to basket`}
                    onClick={() => {
                      addItem({ id: dish.id, name: dish.name, price: dish.price, icon: dish.icon });
                      toast(`Added ${dish.name} to your basket`, "fa-bag-shopping");
                    }}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
