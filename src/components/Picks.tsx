import { useCatalog } from "../lib/catalog";
import { useCart } from "../App";
import { toast } from "../toast";
import { track } from "../lib/activity";

export function Picks() {
  const { addItem } = useCart();
  const { categories } = useCatalog();

  /* hot picks: curated dishes pulled from the live catalog */
  const dishes = ["gr-jollof", "pf-suya", "sw-egusi", "sn-puff"]
    .map((itemId) => {
      for (const cat of categories) {
        const item = cat.menu.find((m) => m.id === itemId);
        if (item) return { ...item, stall: cat.shortName };
      }
      return undefined;
    })
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

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
          {dishes.map((dish, i) => (
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
                      track({ kind: "add_to_cart", label: dish.name, meta: { price: dish.price, stall: dish.stall } });
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
