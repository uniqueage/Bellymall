import { STALLS } from "../data";
import { toast } from "../toast";

export function Directory() {
  return (
    <section className="section" id="directory">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Mall directory</span>
          <h2 className="section-title">
            Every craving has <em>an address</em>
          </h2>
          <p className="section-sub">Seven districts, one roof. Tap a stall to see what the buzz is about.</p>
        </div>

        <div className="directory-grid">
          {STALLS.map((stall, i) => (
            <article
              key={stall.name}
              className={`stall${stall.featured ? " stall--feature" : ""} reveal`}
              data-stall={stall.name}
              style={{ "--reveal-delay": `${(i % 3) * 0.06}s` } as React.CSSProperties}
              onClick={() => toast(`Opening ${stall.name} — full menu coming soon!`, "fa-store")}
            >
              <div>
                <div className="stall__top">
                  <span className="stall__icon">
                    <i className={`fa-solid ${stall.icon}`}></i>
                  </span>
                  <span className="stall__slogan">{stall.slogan}</span>
                </div>
                <h3 className="stall__name">{stall.name}</h3>
                {stall.description && <p className="stall__desc">{stall.description}</p>}
                <div className="stall__chips">
                  {stall.chips.map((chip) => (
                    <span key={chip} className="chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <span className="stall__link">
                {stall.link} <i className="fa-solid fa-arrow-right"></i>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
