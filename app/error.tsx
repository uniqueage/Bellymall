"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section page-pad">
      <div className="container category-missing">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h1 className="section-title">The kitchen dropped a plate.</h1>
        <p className="section-sub">Something went wrong loading this page. Try again — the mall is still open.</p>
        <button className="btn btn--primary" onClick={reset}>
          <i className="fa-solid fa-rotate-right"></i> Try again
        </button>
      </div>
    </section>
  );
}
