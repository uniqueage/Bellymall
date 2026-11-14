import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { STATUS_META, timeAgo, type Tab } from "./shared";

/* ============================================================
   OVERVIEW — the dashboard home: headline numbers, best sellers
   (computed from real orders) and the latest orders.
   ============================================================ */

type OverviewData = {
  orders: number;
  revenue: number;
  customers: number;
  products: number;
  hidden: number;
  sellers: number;
  events: number;
  baskets: number;
  top: { name: string; qty: number; revenue: number }[];
  recent: { id: string; email: string | null; total: number; status: string; created_at: string }[];
};

export function Overview({ onGo }: { onGo: (t: Tab) => void }) {
  const sb = getSupabase();
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ordersRes, activityRes, itemsRes, sellersRes] = await Promise.all([
        sb.from("orders").select("id,email,total,status,created_at,items"),
        sb.from("activity").select("kind"),
        sb.from("menu_items").select("id,name,price,available"),
        sb.from("sellers").select("id,status"),
      ]);
      if (cancelled) return;

      type OrderLite = {
        id: string;
        email: string | null;
        total: number;
        status: string;
        created_at: string;
        items: { name: string; qty: number; price: number }[];
      };
      const orders = (ordersRes.data ?? []) as OrderLite[];

      const units = new Map<string, { qty: number; revenue: number }>();
      for (const o of orders) {
        for (const it of o.items ?? []) {
          const cur = units.get(it.name) ?? { qty: 0, revenue: 0 };
          cur.qty += it.qty;
          cur.revenue += it.qty * it.price;
          units.set(it.name, cur);
        }
      }
      const top = [...units.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      const kinds = (activityRes.data ?? []) as { kind: string }[];
      const items = (itemsRes.data ?? []) as { id: string; name: string; price: number; available: boolean }[];
      const emails = new Set<string>();
      let revenue = 0;
      for (const o of orders) {
        revenue += o.total;
        if (o.email) emails.add(o.email);
      }

      setData({
        orders: orders.length,
        revenue,
        customers: emails.size,
        products: items.length,
        hidden: items.filter((i) => !i.available).length,
        sellers: ((sellersRes.data ?? []) as { id: string }[]).length,
        events: kinds.length,
        baskets: kinds.filter((k) => k.kind === "add_to_cart").length,
        top,
        recent: orders.slice(0, 5).map(({ id, email, total, status, created_at }) => ({
          id,
          email,
          total,
          status,
          created_at,
        })),
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <p className="section-sub">Loading overview…</p>;

  const cards: { label: string; value: string; icon: string; tab: Tab }[] = [
    { label: "Orders", value: String(data.orders), icon: "fa-receipt", tab: "orders" },
    { label: "Revenue", value: "₦" + data.revenue.toLocaleString("en-NG"), icon: "fa-naira-sign", tab: "orders" },
    { label: "Customers", value: String(data.customers), icon: "fa-users", tab: "customers" },
    { label: "Products", value: String(data.products), icon: "fa-bowl-food", tab: "products" },
    { label: "Sellers", value: String(data.sellers), icon: "fa-store", tab: "sellers" },
    { label: "Live events", value: String(data.events), icon: "fa-wave-square", tab: "activity" },
  ];

  return (
    <div className="admin-stack">
      <div className="admin-grid">
        {cards.map((c) => (
          <button key={c.label} className="admin-stat" onClick={() => onGo(c.tab)}>
            <span className="admin-stat__icon">
              <i className={`fa-solid ${c.icon}`}></i>
            </span>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-quick">
        <span>Quick actions</span>
        <button className="admin-status-btn" onClick={() => onGo("products")}>
          <i className="fa-solid fa-plus"></i> Add a dish
        </button>
        <button className="admin-status-btn" onClick={() => onGo("categories")}>
          <i className="fa-solid fa-layer-group"></i> New category
        </button>
        <button className="admin-status-btn" onClick={() => onGo("orders")}>
          <i className="fa-solid fa-fire-burner"></i> Process orders
        </button>
        <button className="admin-status-btn" onClick={() => onGo("contents")}>
          <i className="fa-solid fa-image"></i> Edit hero
        </button>
        <button className="admin-status-btn" onClick={() => onGo("settings")}>
          <i className="fa-solid fa-gear"></i> Store settings
        </button>
      </div>

      <div className="admin-cols">
        <section className="admin-card admin-card--stall">
          <header className="admin-stall-head">
            <i className="fa-solid fa-ranking-star"></i>
            <strong>Best sellers</strong>
            <span>by units sold</span>
          </header>
          {data.top.length === 0 ? (
            <p className="admin-hint">
              <i className="fa-solid fa-circle-info"></i> No orders yet — top dishes appear here once customers start
              buying.
            </p>
          ) : (
            <ul className="activity-list">
              {data.top.map((t, i) => (
                <li key={t.name} className="activity-row">
                  <span className="activity-row__icon">
                    <i className="fa-solid fa-trophy"></i>
                  </span>
                  <div className="activity-row__body">
                    <strong>
                      {i + 1}. {t.name}
                    </strong>
                    <span>
                      {t.qty} sold · ₦{t.revenue.toLocaleString("en-NG")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card admin-card--stall">
          <header className="admin-stall-head">
            <i className="fa-solid fa-receipt"></i>
            <strong>Latest orders</strong>
            <span>{data.hidden > 0 ? `${data.hidden} dish(s) hidden` : "menu fully live"}</span>
          </header>
          {data.recent.length === 0 ? (
            <p className="admin-hint">
              <i className="fa-solid fa-circle-info"></i> Orders placed on the storefront land here instantly.
            </p>
          ) : (
            <ul className="activity-list">
              {data.recent.map((o) => {
                const meta = STATUS_META[o.status] ?? { icon: "fa-circle-dot", label: o.status };
                return (
                  <li key={o.id} className="activity-row">
                    <span className="activity-row__icon">
                      <i className={`fa-solid ${meta.icon}`}></i>
                    </span>
                    <div className="activity-row__body">
                      <strong>
                        {o.id} · ₦{o.total.toLocaleString("en-NG")}
                      </strong>
                      <span>
                        {o.email ?? "guest"} · {meta.label}
                      </span>
                    </div>
                    <time>{timeAgo(o.created_at)}</time>
                  </li>
                );
              })}
            </ul>
          )}
          <button className="link-btn" onClick={() => onGo("orders")}>
            Open the order board →
          </button>
        </section>
      </div>
    </div>
  );
}
