import { useMemo } from "react";
import { useCart, naira } from "../App";
import { findCategory, CATEGORIES, type MenuItem } from "../data";
import { toast } from "../toast";

function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <article className="dish dish--menu">
      <div className="dish__media">
        <img src={item.image} alt={item.alt} loading="lazy" />
        {item.tag && <span className="dish__tag">{item.tag}</span>}
        <span className="dish__rating">
          <i className="fa-solid fa-star"></i> {item.rating}
        </span>
      </div>
      <div className="dish__body">
        <h3 className="dish__name">{item.name}</h3>
        <p className="dish__desc">{item.desc}</p>
        <div className="dish__foot">
          <span className="dish__price">{naira(item.price)}</span>
          <button
            className="dish__add"
            aria-label={`Add ${item.name} to basket`}
            onClick={() => {
              addItem({ id: item.id, name: item.name, price: item.price, icon: item.icon });
              toast(`Added ${item.name} to your basket`, "fa-bag-shopping");
            }}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

export function CategoryPage({ id }: { id: string }) {
  const { cart, setCartOpen } = useCart();
  const category = findCategory(id);

  const totalQty = useMemo(
    () => Array.from(cart.values()).reduce((sum, it) => sum + it.qty, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => Array.from(cart.values()).reduce((sum, it) => sum + it.qty * it.price, 0),
    [cart]
  );

  if (!category) {
    return (
      <section className="section page-pad">
        <div className="container category-missing">
          <i className="fa-solid fa-compass"></i>
          <h1 className="section-title">This stall moved.</h1>
          <p className="section-sub">
            We couldn't find “{id}”. The directory below has every open stall in the mall.
          </p>
          <a className="btn btn--primary" href="#directory">
            <i className="fa-solid fa-store"></i> Back to the directory
          </a>
        </div>
      </section>
    );
  }

  const related = CATEGORIES.filter((c) => c.id !== category.id).slice(0, 3);

  return (
    <div className="category-page">
      {/* banner */}
      <section className="cat-hero" style={{ backgroundImage: `url(${category.image})` }}>
        <div className="cat-hero__scrim" aria-hidden="true"></div>
        <div className="container cat-hero__content">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <i className="fa-solid fa-angle-right"></i>
            <a href="#directory">Directory</a>
            <i className="fa-solid fa-angle-right"></i>
            <span aria-current="page">{category.shortName}</span>
          </nav>
          <span className="cat-hero__kicker">
            <i className={`fa-solid ${category.icon}`}></i> {category.slogan}
          </span>
          <h1 className="cat-hero__title">{category.name}</h1>
          <p className="cat-hero__sub">{category.blurb}</p>
          <a className="btn btn--primary cat-hero__cta" href="#menu">
            <i className="fa-solid fa-utensils"></i> See the menu · {category.menu.length} dishes
          </a>
        </div>
      </section>

      {/* menu */}
      <section className="section" id="menu">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Full menu</span>
            <h2 className="section-title">
              Order from <em>{category.shortName}</em>
            </h2>
            <p className="section-sub">
              Tap <i className="fa-solid fa-plus" aria-hidden="true"></i> on any dish to drop it straight into your
              basket — checkout takes under a minute.
            </p>
          </div>

          <div className="dish-grid dish-grid--menu">
            {category.menu.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* related stalls */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Keep exploring</span>
            <h2 className="section-title">
              Other <em>stalls</em> nearby
            </h2>
          </div>
          <div className="related-grid">
            {related.map((c) => (
              <a key={c.id} className="related-card" href={`#/category/${c.id}`}>
                <img src={c.image} alt={c.imageAlt} loading="lazy" />
                <div className="related-card__body">
                  <strong>{c.name}</strong>
                  <span>
                    {c.menu.length} dishes <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* sticky basket bar */}
      <div className={`basket-bar${totalQty > 0 ? " is-active" : ""}`}>
        <button className="basket-bar__btn" onClick={() => setCartOpen(true)}>
          <span className="basket-bar__count">
            <i className="fa-solid fa-basket-shopping"></i> {totalQty}
          </span>
          <span className="basket-bar__label">View basket</span>
          <span className="basket-bar__total">{naira(subtotal)}</span>
          <i className="fa-solid fa-arrow-right basket-bar__arrow"></i>
        </button>
      </div>
    </div>
  );
}
