import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { toast } from "../../toast";
import { STATUSES, STATUS_META, hit, timeAgo, type OrderRow } from "./shared";

/* ============================================================
   ORDERS — the live order board: search, status filters, revenue
   totals, realtime inserts and one-tap status moves.
   ============================================================ */

type Props = { query: string };

const PAY_LABEL: Record<string, string> = {
  card: "Paid by card",
  transfer: "Bank transfer",
  delivery: "Pay on delivery",
};

export function Orders({ query }: Props) {
  const sb = getSupabase();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        toast("Could not load orders", "fa-triangle-exclamation");
        setOrders([]);
        return;
      }
      setOrders((data ?? []) as OrderRow[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* realtime inserts */
  useEffect(() => {
    const channel = sb
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => [payload.new as OrderRow, ...(prev ?? [])]);
        toast("New order received!", "fa-bell");
      })
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast("Could not update the status", "fa-triangle-exclamation");
      return;
    }
    setOrders((prev) => (prev ?? []).map((o) => (o.id === id ? { ...o, status } : o)));
    toast(`Order ${id} → ${status.replace(/_/g, " ")}`, "fa-motorcycle");
  };

  const searched = useMemo(() => {
    if (!orders) return null;
    return orders.filter((o) =>
      hit(
        query,
        o.id,
        o.email,
        o.phone,
        o.address,
        o.payment,
        o.status,
        ...(o.items ?? []).map((it) => it.name)
      )
    );
  }, [orders, query]);

  if (!searched) return <p className="section-sub">Loading orders…</p>;

  const shown = filter === "all" ? searched : searched.filter((o) => o.status === filter);
  const revenue = shown.reduce((s, o) => s + (o.status === "cancelled" ? 0 : o.total), 0);
  const items = shown.reduce(
    (s, o) => s + (o.items ?? []).reduce((n, it) => n + it.qty, 0),
    0
  );

  return (
    <div className="admin-stack">
      <div className="admin-summary">
        <span>
          <strong>{shown.length}</strong> orders
        </span>
        <span>
          <strong>{items}</strong> items
        </span>
        <span>
          <strong>₦{revenue.toLocaleString("en-NG")}</strong> revenue
        </span>
      </div>

      <div className="tab-row" role="tablist" aria-label="Order status filter">
        {["all", ...STATUSES].map((s) => (
          <button key={s} className={`tab-btn${filter === s ? " is-active" : ""}`} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : STATUS_META[s]?.label ?? s} (
            {s === "all" ? searched.length : searched.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-receipt"></i>
          <strong>No orders here yet</strong>
          <span>Orders placed on the storefront appear here instantly.</span>
        </div>
      )}

      {shown.map((o) => (
        <article key={o.id} className="order-card">
          <header className="order-card__head">
            <strong>{o.id}</strong>
            <span className="order-card__email">{o.email ?? "guest"}</span>
            <span className="order-card__when">{timeAgo(o.created_at)}</span>
          </header>
          <ul className="order-card__items">
            {(o.items ?? []).map((it) => (
              <li key={it.name}>
                {it.qty} × {it.name} — ₦{(it.price * it.qty).toLocaleString("en-NG")}
              </li>
            ))}
          </ul>
          <footer className="order-card__foot">
            <span>
              <i className="fa-solid fa-location-dot"></i> {o.address} ·{" "}
              <a href={`tel:${o.phone.replace(/\s+/g, "")}`}>
                <i className="fa-solid fa-phone"></i> {o.phone}
              </a>{" "}
              · <i className="fa-solid fa-credit-card"></i> {PAY_LABEL[o.payment] ?? o.payment}
            </span>
            <strong>
              ₦{o.total.toLocaleString("en-NG")}
              {o.delivery === 0 && <em className="admin-note"> free delivery</em>}
            </strong>
          </footer>
          <div className="order-card__actions">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`admin-status-btn${o.status === s ? " is-active" : ""}`}
                onClick={() => void setStatus(o.id, s)}
              >
                <i className={`fa-solid ${STATUS_META[s].icon}`}></i> {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
