import { useEffect, useMemo, useRef, useState } from "react";
import { HERO_SLIDES } from "../data";

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 42;

export function Hero() {
  const slides = HERO_SLIDES;
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const touchX = useRef(0);

  const prefersReduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const paused = prefersReduced || hoverPaused || tabHidden;

  const goTo = (i: number) => {
    setCurrent(((i % slides.length) + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  };

  /* restart the visual cycle whenever autoplay resumes */
  useEffect(() => {
    if (!paused) setProgressKey((k) => k + 1);
  }, [paused]);

  /* autoplay timer */
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  /* pause when the tab is hidden */
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <section
      className="hero"
      id="top"
      aria-roledescription="carousel"
      aria-label="Bellymall highlights"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(current + 1);
        if (e.key === "ArrowLeft") goTo(current - 1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > SWIPE_THRESHOLD) goTo(dx < 0 ? current + 1 : current - 1);
      }}
    >
      <p className="sr-only" aria-live="polite">
        Slide {current + 1} of {slides.length}
      </p>

      <div className="hero__slides">
        {slides.map((slide, i) => (
          <article
            key={slide.image}
            className={`hero__slide${i === current ? " is-active" : ""}`}
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== current}
          >
            <div className="hero__img-wrap">
              <img
                className="hero__img"
                src={slide.image}
                alt={slide.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
            </div>
            <div className="hero__scrim" aria-hidden="true"></div>
            <div className="container hero__content">
              <div className="hero__inner">
                <span className="hero__kicker">
                  <i className={`fa-solid ${slide.kickerIcon}`}></i> {slide.kicker}
                </span>
                {i === 0 ? (
                  <h1 className="hero__title">
                    {slide.titlePre}
                    <em>{slide.titleEm}</em>
                    {slide.titlePost}
                  </h1>
                ) : (
                  <h2 className="hero__title">
                    {slide.titlePre}
                    <em>{slide.titleEm}</em>
                    {slide.titlePost}
                  </h2>
                )}
                <p className="hero__sub">{slide.sub}</p>
                <div className="hero__ctas">
                  {slide.ctas.map((cta) =>
                    cta.variant === "primary" ? (
                      <a key={cta.label} href={cta.href} className="btn btn--primary">
                        <i className={`fa-solid ${cta.icon}`}></i> {cta.label}
                      </a>
                    ) : (
                      <a key={cta.label} href={cta.href} className="btn btn--ghost">
                        {cta.label} <i className={`fa-solid ${cta.icon}`}></i>
                      </a>
                    )
                  )}
                </div>
                <div className="hero__trust">
                  {slide.trust.map((t) => (
                    <span key={t.text}>
                      <i className={`fa-solid ${t.icon}`}></i> {t.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className="hero__arrow hero__arrow--prev" onClick={() => goTo(current - 1)} aria-label="Previous slide">
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={() => goTo(current + 1)} aria-label="Next slide">
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      <div className="hero__dots" role="tablist" aria-label="Choose slide">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            className={`hero__dot${i === current ? " is-active" : ""}`}
            role="tab"
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === current}
            onClick={() => goTo(i)}
          ></button>
        ))}
      </div>

      {!prefersReduced && (
        <div
          key={progressKey}
          className="hero__progress"
          aria-hidden="true"
          style={{
            animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </section>
  );
}
