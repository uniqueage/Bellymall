/* Minimal hash router — no dependencies, works with Vite's static hosting. */

export type Route =
  | { page: "home" }
  | { page: "about" }
  | { page: "signin" }
  | { page: "cart" }
  | { page: "category"; id: string };

export function parseRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("/category/")) {
    return { page: "category", id: decodeURIComponent(hash.slice("/category/".length)) };
  }
  if (hash === "/about") return { page: "about" };
  if (hash === "/signin") return { page: "signin" };
  if (hash === "/cart") return { page: "cart" };
  return { page: "home" };
}

export function navigate(path: string) {
  window.location.hash = path;
}
