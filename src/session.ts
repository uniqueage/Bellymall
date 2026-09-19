/* Demo client-side session store (no real backend — Bellymall demo accounts). */

export type Session = { email: string; name: string };

const KEY = "bellymall-session";
const listeners = new Set<() => void>();

function read(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

let session: Session | null = read();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  return session;
}

function signIn(email: string) {
  const name = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  session = { email, name: name || "Foodie" };
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — session lives for this tab only */
  }
  emit();
}

function signOut() {
  session = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export const sessionStore = {
  subscribe,
  getSnapshot,
  signIn,
  signOut,
};
