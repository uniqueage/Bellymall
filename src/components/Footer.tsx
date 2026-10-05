import { useCatalog } from "../lib/catalog";
import { useSettings } from "../lib/settings";

const EXPLORE_LINKS = [
  { label: "Home", href: "#/" },
  { label: "Mall directory", href: "#directory" },
  { label: "Hot picks", href: "#picks" },
  { label: "Kitchen gallery", href: "#gallery" },
  { label: "Deals", href: "#deals" },
  { label: "About us", href: "#/about" },
];

export function Footer() {
  const { categories } = useCatalog();
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <a className="brand" href="#/" aria-label="Bellymall home">
              <span className="brand-mark" aria-hidden="true">
                <i className="fa-solid fa-utensils"></i>
              </span>
              <span className="brand-word">
                Belly<span>mall</span>
              </span>
            </a>
            <p className="footer__about">
              {settings.tagline || "Everything you love, all in one mall"}. From street cravings to chef specials —
              delivered hot in minutes.
            </p>
            <div className="footer__socials">
              <a href={settings.instagram || "#/"} aria-label={`${settings.storeName} on Instagram`}>
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href={settings.twitter || "#/"} aria-label={`${settings.storeName} on X`}>
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href={settings.tiktok || "#/"} aria-label={`${settings.storeName} on TikTok`}>
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href={settings.facebook || "#/"} aria-label={`${settings.storeName} on Facebook`}>
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
              {categories.map((c) => (
                <a key={c.id} href={`#/category/${c.id}`}>
                  {c.shortName}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Reach us</h4>
            <div className="footer__contact">
              <span>
                <i className="fa-solid fa-location-dot"></i> {settings.address}
              </span>
              <span>
                <i className="fa-solid fa-phone"></i> {settings.supportPhone}
              </span>
              <span>
                <i className="fa-solid fa-envelope"></i> {settings.supportEmail}
              </span>
              <span>
                <i className="fa-solid fa-clock"></i> {settings.hours}
              </span>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} Bellymall • everything you love, all in one mall.</span>
          <span>
            Made with <i className="fa-solid fa-fire"></i> and measured paddings.
          </span>
        </div>
      </div>
    </footer>
  );
}
