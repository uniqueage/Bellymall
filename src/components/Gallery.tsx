import { useEffect, useMemo, useRef, useState } from "react";
import { GALLERY_SLIDES } from "../data";
import { navigate } from "../router";

const AUTOPLAY_MS = 5200;
const SWIPE_THRESHOLD = 42;

export function Gallery() {
  const slides = GALLERY_SLIDES;
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(0);

  const prefersReduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const autoplayOn = !prefersReduced && !paused;

  const goTo = (i: number) => {
    setCurrent(((i % slides.length) + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  };

  useEffect(() => {
    if (!autoplayOn) return;
    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplayOn, slides.length]);

  useEffect(() => {
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    function onVis() {
      setPaused(document.hidden);
    }
  }, []);

  return (
    <section className="section" id="gallery" aria-roledescription="carousel" aria-label="From the kitchens">
      <div className="container">
        <div className="section-head section-head--center reveal">
          <span className="eyebrow">From the kitchens</span>
          <h2 className="section-title">
            Straight from <em>the pass</em>
          </h2>
          <p className="section-sub">Real plates, real stalls — swipe through the mall's kitchen table.</p>
        </div>

        <div
          className="gallery reveal"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > SWIPE_THRESHOLD) goTo(dx < 0 ? current + 1 : current - 1);
          }}
        >
          <div className="gallery__stage">
            {slides.map((slide, i) => (
              <figure
                key={slide.image}
                className={`gallery__slide${i === current ? " is-active" : ""}`}
                aria-hidden={i !== current}
              >
                <img src={slide.image} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} />
                <figcaption className="gallery__caption">
                  <strong>{slide.caption}</strong>
                  <span>
                    <i className="fa-solid fa-store"></i> {slide.where}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <button className="gallery__arrow gallery__arrow--prev" onClick={() => goTo(current - 1)} aria-label="Previous photo">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="gallery__arrow gallery__arrow--next" onClick={() => goTo(current + 1)} aria-label="Next photo">
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="gallery__dots" role="tablist" aria-label="Choose photo">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                className={`gallery__dot${i === current ? " is-active" : ""}`}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => goTo(i)}
              ></button>
            ))}
          </div>

          {!prefersReduced && (
            <div
              key={progressKey}
              className="gallery__progress"
              aria-hidden="true"
              style={{
                animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                animationPlayState: paused || document.hidden ? "paused" : "running",
              }}
            />
          )}
        </div>

        <p className="gallery__cta">
          Hungry from looking?{" "}
          <button className="link-btn" onClick={() => navigate("#/category/build-a-belly")}>
            Build your box
          </button>
        </p>
      </div>
    </section>
  );
}
