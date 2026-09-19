import { CATEGORIES } from "../data";

export function Directory() {
  return (
    <section className="section" id="directory">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Mall directory</span>
          <h2 className="section-title">
            Every craving has <em>an address</em>
          </h2>
          <p className="section-sub">
            Seven districts, one roof. Open a stall to see its full menu, add to your basket and order online.
          </p>
        </div>

        <div className="directory-grid">
          {CATEGORIES.map((stall, i) => (
            <a
              key={stall.id}
              className={`stall${stall.featured ? " stall--feature" : ""} reveal`}
              data-stall={stall.id}
              style={{ "--reveal-delay": `${(i % 3) * 0.06}s` } as React.CSSProperties}
              href={`#/category/${stall.id}`}
            >
              <div>
                <div className="stall__top">
                  <span className="stall__icon">
                    <i className={`fa-solid ${stall.icon}`}></i>
                  </span>
                  <span className="stall__slogan">{stall.slogan}</span>
                </div>
                <h3 className="stall__name">{stall.name}</h3>
                <p className="stall__desc">{stall.blurb}</p>
                <div className="stall__chips">
                  {stall.menu.slice(0, 3).map((m) => (
                    <span key={m.id} className="chip">
                      {m.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  ))}
                  <span className="chip chip--count">
                    {stall.menu.length} dishes
                  </span>
                </div>
              </div>
              <span className="stall__link">
                View menu &amp; order <i className="fa-solid fa-arrow-right"></i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
