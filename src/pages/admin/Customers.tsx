import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { hit, timeAgo, type ActivityRow, type OrderRow } from "./shared";

/* ============================================================
   CUSTOMERS — a directory assembled from orders + activity:
   who buys, how much, how often and what they last did on the
   site. Anonymous browsers are counted separately so the numbers
   stay honest.
   ============================================================ */

type Props = { query: string };

type Person = {
  key: string;
  label: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  orders: number;
  spent: number;
  items: number;
  lastOrder: string | null;
  lastSeen: string | null;
  lastAction: string;
  repeat: boolean;
};

function nameFromEmail(email: string): string {
  const local = email.split("@")[0];
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || email;
}

export function Customers({ query }: Props) {
  const sb = getSupabase();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [anonymous, setAnonymous] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ordersRes, activityRes] = await Promise.all([
        sb.from("orders").select("id,email,phone,address,total,items,created_at").order("created_at", { ascending: false }).limit(500),
        sb.from("activity").select("id,session_id,email,kind,created_at").order("created_at", { ascending: false }).limit(500),
      ]);
      if (cancelled) return;
      const orders = (ordersRes.data ?? []) as Pick<OrderRow, "email" | "phone" | "address" | "total" | "items" | "created_at">[];
      const activity = (activityRes.data ?? []) as Pick<ActivityRow, "session_id" | "email" | "kind" | "created_at">[];

      const map = new Map<string, Person>();
      const touch = (key: string, email: string | null): Person => {
        let p = map.get(key);
        if (!p) {
          p = {
            key,
            label: email ?? key,
            name: email ? nameFromEmail(email) : "Guest shopper",
            email,
            phone: "",
            address: "",
            orders: 0,
            spent: 0,
            items: 0,
            lastOrder: null,
            lastSeen: null,
            lastAction: "",
            repeat: false,
          };
          map.set(key, p);
        }
        return p;
      };

      for (const o of orders) {
        const key = o.email ?? o.phone ?? "guest";
        const p = touch(key, o.email);
        p.orders += 1;
        p.spent += o.total;
        p.items += (o.items ?? []).reduce((n, it) => n + it.qty, 0);
        if (!p.phone && o.phone) p.phone = o.phone;
        if (!p.address && o.address) p.address = o.address;
        if (!p.lastOrder || o.created_at > p.lastOrder) p.lastOrder = o.created_at;
      }

      const sessions = new Set<string>();
      for (const a of activity) {
        if (!a.email) {
          sessions.add(a.session_id);
          continue;
        }
        const p = touch(a.email, a.email);
        if (!p.lastSeen || a.created_at > p.lastSeen) {
          p.lastSeen = a.created_at;
          p.lastAction = a.kind.replace(/_/g, " ");
        }
      }

      const list = [...map.values()];
      for (const p of list) {
        if (!p.lastSeen) p.lastSeen = p.lastOrder;
        p.repeat = p.orders > 1;
      }
      list.sort((a, b) => b.spent - a.spent || b.orders - a.orders);

      setPeople(list);
      setAnonymous(sessions.size);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    if (!people) return { total: 0, repeat: 0, spend: 0, withOrders: 0 };
    return {
      total: people.length,
      repeat: people.filter((p) => p.repeat).length,
      spend: people.reduce((s, p) => s + p.spent, 0),
      withOrders: people.filter((p) => p.orders > 0).length,
    };
  }, [people]);

  if (!people) return <p className="section-sub">Loading customers…</p>;

  const shown = people.filter((p) =>
    hit(query, p.label, p.name, p.phone, p.address, p.lastAction)
  );

  return (
    <div className="admin-stack">
      <div className="admin-grid">
        <div className="admin-stat">
          <span className="admin-stat__icon">
            <i className="fa-solid fa-users"></i>
          </span>
          <strong>{stats.total}</strong>
          <span>Known customers</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">
            <i className="fa-solid fa-repeat"></i>
          </span>
          <strong>{stats.repeat}</strong>
          <span>Repeat buyers</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">
            <i className="fa-solid fa-naira-sign"></i>
          </span>
          <strong>₦{stats.spend.toLocaleString("en-NG")}</strong>
          <span>Total spent</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__icon">
            <i className="fa-solid fa-user-secret"></i>
          </span>
          <strong>{anonymous}</strong>
          <span>Anonymous visitors</span>
        </div>
      </div>

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-users"></i>
          <strong>No customers match that search</strong>
          <span>
            {people.length === 0
              ? "Customers appear here as soon as orders or sign-ins are recorded."
              : "Clear the search box to see everyone."}
          </span>
        </div>
      )}

      <div className="admin-people">
        {shown.map((p) => (
          <article key={p.key} className="admin-person">
            <span className="admin-person__avatar">
              {p.name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w.slice(0, 1).toUpperCase())
                .join("")}
            </span>
            <div className="admin-person__main">
              <strong>
                {p.name}
                {p.repeat && <em className="admin-flag admin-flag--good">Regular</em>}
              </strong>
              <span>
                {p.label}
                {p.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${p.phone.replace(/\s+/g, "")}`}>{p.phone}</a>
                  </>
                )}
              </span>
              {p.address && <span className="admin-person__addr">{p.address}</span>}
            </div>
            <div className="admin-person__stats">
              <span>
                <strong>{p.orders}</strong> orders
              </span>
              <span>
                <strong>₦{p.spent.toLocaleString("en-NG")}</strong> spent
              </span>
              <span>
                <strong>{p.items}</strong> items
              </span>
            </div>
            <div className="admin-person__seen">
              <span>{p.lastOrder ? `last order ${timeAgo(p.lastOrder)}` : "no orders yet"}</span>
              <span>{p.lastAction ? `last action: ${p.lastAction}` : "browsing only"}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> Guests who never leave an email are counted as anonymous visitors —
        their identity is never collected without a sign-in.
      </p>
    </div>
  );
}
