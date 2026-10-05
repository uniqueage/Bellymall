import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { KIND_META, hit, timeAgo, type ActivityRow } from "./shared";

/* ============================================================
   ACTIVITY — realtime stream of everything customers do:
   views, stall visits, basket adds, searches, orders and
   sign-ins. Filter by event type or search the label/email.
   ============================================================ */

type Props = { query: string };

export function Activity({ query }: Props) {
  const sb = getSupabase();
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [kind, setKind] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await sb
        .from("activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data ?? []) as ActivityRow[]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* realtime appends */
  useEffect(() => {
    const channel = sb
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity" }, (payload) => {
        setRows((prev) => [payload.new as ActivityRow, ...(prev ?? [])]);
      })
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kinds = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows ?? []) set.add(r.kind);
    return ["all", ...[...set].sort()];
  }, [rows]);

  if (!rows) return <p className="section-sub">Loading activity…</p>;

  const shown = rows.filter(
    (r) => (kind === "all" || r.kind === kind) && hit(query, r.label, r.email, r.kind, r.path, r.session_id)
  );

  return (
    <div className="admin-stack">
      <p className="admin-hint">
        <i className="fa-solid fa-wave-square"></i> Live — new customer actions stream in automatically.
      </p>

      <div className="tab-row" role="tablist" aria-label="Activity type filter">
        {kinds.map((k) => (
          <button key={k} className={`tab-btn${kind === k ? " is-active" : ""}`} onClick={() => setKind(k)}>
            {k === "all" ? "All" : (KIND_META[k]?.label ?? k)} (
            {k === "all" ? rows.length : rows.filter((r) => r.kind === k).length})
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-wave-square"></i>
          <strong>No customer activity yet</strong>
          <span>Open the site in another tab and click around — events appear here instantly.</span>
        </div>
      )}

      <ul className="activity-list">
        {shown.map((r) => {
          const meta = KIND_META[r.kind] ?? { icon: "fa-circle-dot", label: r.kind };
          return (
            <li key={r.id} className="activity-row">
              <span className="activity-row__icon">
                <i className={`fa-solid ${meta.icon}`}></i>
              </span>
              <div className="activity-row__body">
                <strong>{meta.label}</strong>
                <span>
                  {r.label ?? ""}
                  {r.email ? ` · ${r.email}` : " · guest"}
                </span>
              </div>
              <time>{timeAgo(r.created_at)}</time>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
