import { useEffect, useState } from "react";

const EXPLORE_LINKS = [
  { label: "Mall directory", href: "#directory" },
  { label: "Hot picks", href: "#picks" },
  { label: "Deals", href: "#deals" },
  { label: "How it works", href: "#how" },
];

const STALL_LINKS = ["Build-a-belly box", "The swallow hall", "Protein factory", "Snack street"];

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <a className="brand" href="#top" aria-label="Bellymall home">
              <span className="brand-mark" aria-hidden="true">
                <i className="fa-solid fa-utensils"></i>
              </span>
              <span className="brand-word">
                Belly<span>mall</span>
              </span>
            </a>
            <p className="footer__about">
              Everything you love, all in one mall. From street cravings to chef specials — delivered hot in minutes.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="Bellymall on Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" aria-label="Bellymall on X">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" aria-label="Bellymall on TikTok">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="#" aria-label="Bellymall on Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <div className="footer__links">
              {EXPLORE_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Stalls</h4>
            <div className="footer__links">
              {STALL_LINKS.map((label) => (
                <a key={label} href="#directory">
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Reach us</h4>
            <div className="footer__contact">
              <span>
                <i className="fa-solid fa-location-dot"></i> 12 Food Hall Way, Lagos
              </span>
              <span>
                <i className="fa-solid fa-phone"></i> +234 800 BELLY-01
              </span>
              <span>
                <i className="fa-solid fa-envelope"></i> hello@bellymall.ng
              </span>
              <span>
                <i className="fa-solid fa-clock"></i> Open daily · 9am – 11pm
              </span>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>
            © {year} Bellymall • everything you love, all in one mall.
          </span>
          <span>
            Made with <i className="fa-solid fa-fire"></i> and measured paddings.
          </span>
        </div>
      </div>
    </footer>
  );
}
