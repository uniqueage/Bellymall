import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section page-pad">
      <div className="container category-missing">
        <i className="fa-solid fa-compass"></i>
        <h1 className="section-title">This aisle doesn&apos;t exist.</h1>
        <p className="section-sub">
          The page you were looking for has moved. Every open stall is still in the directory.
        </p>
        <Link className="btn btn--primary" href="/">
          <i className="fa-solid fa-store"></i> Back to the mall
        </Link>
      </div>
    </section>
  );
}
