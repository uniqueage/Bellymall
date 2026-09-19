import { FEATURES } from "../data";

export function Features() {
  return (
    <section className="section" aria-label="Why Bellymall">
      <div className="container">
        <div className="features">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="feature reveal"
              style={{ "--reveal-delay": `${i * 0.08}s` } as React.CSSProperties}
            >
              <i className={`fa-solid ${feature.icon}`}></i>
              <div>
                <strong>{feature.title}</strong>
                <small>{feature.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
