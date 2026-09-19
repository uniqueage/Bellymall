import { STEPS } from "../data";

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-head section-head--center reveal">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title">
            Three steps to <em>full</em>
          </h2>
          <p className="section-sub">From craving to doorstep before your show hits the good part.</p>
        </div>

        <div className="steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="step reveal" style={{ "--reveal-delay": `${i * 0.1}s` } as React.CSSProperties}>
              <i className={`fa-solid ${step.glyph} step__glyph`}></i>
              <span className="step__num" aria-hidden="true"></span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
