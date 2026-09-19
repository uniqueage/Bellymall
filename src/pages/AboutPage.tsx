import { useState } from "react";
import { useCart, naira, type Order } from "../App";
import { CATEGORIES } from "../data";

export function AboutPage({ orders }: { orders: Order[] }) {
  const { session } = useCart();
  const [tab, setTab] = useState<"orders" | "stalls">("orders");

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="page-pad">
      {/* intro */}
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div>
            <span className="eyebrow">About Bellymall</span>
            <h1 className="section-title">
              One mall. <em>Every craving.</em>
            </h1>
            <p className="section-sub">
              Bellymall began as three friends arguing about where to eat after work. Someone asked, “why do we have to
              choose?” So we built a food hall in your pocket — 120+ stalls under one roof, one basket, one rider.
            </p>
            {session ? (
              <p className="about-hello">
                <i className="fa-solid fa-user"></i> Welcome back, {session.name}.
              </p>
            ) : (
              <div className="about-hero__actions">
                <a className="btn btn--primary" href="#directory">
                  <i className="fa-solid fa-store"></i> Explore the stalls
                </a>
                <a className="btn btn--dark" href="#/category/build-a-belly">
                  <i className="fa-solid fa-box-open"></i> Try Build-a-belly
                </a>
              </div>
            )}
          </div>
          <figure className="about-hero__media">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
              alt="The warm interior of a busy food hall"
              loading="lazy"
            />
            <figcaption>
              <i className="fa-solid fa-store"></i> Hall One, Bellymall — Lagos
            </figcaption>
          </figure>
        </div>
      </section>

      {/* values */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="section-title">
              Cooked with <em>care</em>, delivered with speed
            </h2>
          </div>
          <div className="about-values">
            <article className="value-card">
              <i className="fa-solid fa-leaf"></i>
              <h3>Cooked, never reheated</h3>
              <p>Every dish is made to order. If it can't travel hot, it doesn't leave the kitchen.</p>
            </article>
            <article className="value-card">
              <i className="fa-solid fa-handshake"></i>
              <h3>Fair to stalls</h3>
              <p>Stalls keep more of every sale than on any other app we know. Happy cooks, better food.</p>
            </article>
            <article className="value-card">
              <i className="fa-solid fa-scale-balanced"></i>
              <h3>Honest pricing</h3>
              <p>The price you see is the price you pay. No surge, no games, no hidden fees.</p>
            </article>
            <article className="value-card">
              <i className="fa-solid fa-motorcycle"></i>
              <h3>Riders we respect</h3>
              <p>Insurance, fair pay and real hours. The people who bring the food matter most.</p>
            </article>
          </div>
        </div>
      </section>

      {/* orders / stalls tabs */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Your dashboard</span>
            <h2 className="section-title">
              Your Bellymall, <em>at a glance</em>
            </h2>
            <p className="section-sub">
              Orders placed on this device show up here. {totalSpent > 0 && `You've feasted for ${naira(totalSpent)} so far.`}
            </p>
          </div>

          <div className="tab-row" role="tablist" aria-label="Dashboard tabs">
            <button
              role="tab"
              aria-selected={tab === "orders"}
              className={`tab-btn${tab === "orders" ? " is-active" : ""}`}
              onClick={() => setTab("orders")}
            >
              <i className="fa-solid fa-receipt"></i> Orders ({orders.length})
            </button>
            <button
              role="tab"
              aria-selected={tab === "stalls"}
              className={`tab-btn${tab === "stalls" ? " is-active" : ""}`}
              onClick={() => setTab("stalls")}
            >
              <i className="fa-solid fa-store"></i> All stalls
            </button>
          </div>

          {tab === "orders" && (
            <div className="orders-list">
              {orders.length === 0 ? (
                <div className="cart-empty">
                  <i className="fa-solid fa-receipt"></i>
                  <strong>No orders yet</strong>
                  <span>Place a demo order from any stall page and it will show up here.</span>
                </div>
              ) : (
                orders.map((o) => (
                  <article key={o.id} className="order-card">
                    <header className="order-card__head">
                      <strong>{o.id}</strong>
                      <span className="order-card__status">
                        <i className="fa-solid fa-motorcycle"></i> On the way
                      </span>
                    </header>
                    <ul className="order-card__items">
                      {o.items.map((it) => (
                        <li key={it.name}>
                          {it.qty} × {it.name} — {naira(it.price * it.qty)}
                        </li>
                      ))}
                    </ul>
                    <footer className="order-card__foot">
                      <span>
                        <i className="fa-solid fa-location-dot"></i> {o.address}
                      </span>
                      <strong>{naira(o.total)}</strong>
                    </footer>
                  </article>
                ))
              )}
            </div>
          )}

          {tab === "stalls" && (
            <div className="stall-list-grid">
              {CATEGORIES.map((c) => (
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
          )}
        </div>
      </section>
    </div>
  );
}
