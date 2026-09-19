import { useEffect, useRef, useState } from "react";
import { STATS, type StatDef } from "../data";

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatValue(value: number, stat: StatDef) {
  return (
    (stat.decimals > 0
      ? value.toFixed(stat.decimals)
      : Math.round(value).toLocaleString("en-NG")) + stat.suffix
  );
}

function Stat({ stat }: { stat: StatDef }) {
  const [display, setDisplay] = useState(formatValue(0, stat));
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started.current) continue;
          started.current = true;
          if (prefersReduced()) {
            setDisplay(formatValue(stat.count, stat));
          } else {
            const duration = 1400;
            const start = performance.now();
            const frame = (now: number) => {
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(formatValue(stat.count * eased, stat));
              if (t < 1) requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat]);

  return (
    <div className="stat" ref={ref}>
      <div className="stat__num">{display}</div>
      <div className="stat__label">{stat.label}</div>
    </div>
  );
}

export function Stats() {
  return (
    <section className="stats" aria-label="Bellymall in numbers">
      <div className="container stats__grid">
        {STATS.map((stat) => (
          <Stat key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
