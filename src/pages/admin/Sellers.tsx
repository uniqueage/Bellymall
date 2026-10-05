import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { toast } from "../../toast";
import {
  errorMessage,
  hit,
  missingTable,
  uploadSiteImage,
  type CategoryRow,
  type SellerRow,
} from "./shared";

/* ============================================================
   SELLERS — the people behind each stall: contact details,
   assigned stall, rating and active/paused status. CRUD lives in
   the public.sellers table (see supabase/schema.sql).
   ============================================================ */

type Props = { query: string };

export function Sellers({ query }: Props) {
  const sb = getSupabase();
  const [sellers, setSellers] = useState<SellerRow[] | null>(null);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [tableGone, setTableGone] = useState(false);

  const load = useCallback(async () => {
    const [sellersRes, catsRes] = await Promise.all([
      sb.from("sellers").select("*").order("sort_order"),
      sb.from("categories").select("*").order("sort_order"),
    ]);
    setCats((catsRes.data ?? []) as CategoryRow[]);
    if (sellersRes.error) {
      setSellers([]);
      setTableGone(missingTable(sellersRes.error));
      return;
    }
    setSellers((sellersRes.data ?? []) as SellerRow[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (s: SellerRow) => {
    if (!window.confirm(`Remove ${s.name} from the team?`)) return;
    const { error } = await sb.from("sellers").delete().eq("id", s.id);
    if (error) {
      toast(errorMessage(error, "Could not remove this seller"), "fa-triangle-exclamation");
      return;
    }
    toast(`${s.name} removed`, "fa-trash");
    void load();
  };

  const uploadImage = async (s: SellerRow, file: File) => {
    setUploading(s.id);
    try {
      const url = await uploadSiteImage(sb, "sellers", file);
      const { error } = await sb.from("sellers").update({ image: url }).eq("id", s.id);
      if (error) throw error;
      toast("Photo updated", "fa-image");
      void load();
    } catch (err) {
      toast(errorMessage(err, "Upload failed"), "fa-triangle-exclamation");
    } finally {
      setUploading(null);
    }
  };

  if (!sellers) return <p className="section-sub">Loading sellers…</p>;

  if (tableGone) {
    return (
      <div className="admin-stack">
        <div className="cart-empty">
          <i className="fa-solid fa-database"></i>
          <strong>The sellers table does not exist yet</strong>
          <span>
            Re-run <code>supabase/schema.sql</code> in the Supabase SQL editor — it is idempotent and will add the
            missing table without touching your data — then reload.
          </span>
        </div>
      </div>
    );
  }

  const shown = sellers.filter((s) => hit(query, s.name, s.email, s.phone, s.role, s.stall));

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <span className="admin-count">
            {shown.length} / {sellers.length} sellers
          </span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding((v) => !v)}>
          <i className={`fa-solid ${adding ? "fa-xmark" : "fa-plus"}`}></i> {adding ? "Close" : "Add seller"}
        </button>
      </div>

      {adding && (
        <AddSeller
          cats={cats}
          onDone={() => {
            setAdding(false);
            void load();
          }}
        />
      )}

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-store"></i>
          <strong>No sellers found</strong>
          <span>Add the cooks and stall owners who keep the mall running.</span>
        </div>
      )}

      {shown.map((s) => (
        <SellerCard
          key={s.id}
          seller={s}
          cats={cats}
          uploading={uploading === s.id}
          onChanged={load}
          onDelete={remove}
          onUpload={uploadImage}
        />
      ))}

      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> Pausing a seller keeps their record but flags them as inactive for
        the team view.
      </p>
    </div>
  );
}

/* ---------------- seller card ---------------- */

function SellerCard({
  seller,
  cats,
  uploading,
  onChanged,
  onDelete,
  onUpload,
}: {
  seller: SellerRow;
  cats: CategoryRow[];
  uploading: boolean;
  onChanged: () => void;
  onDelete: (s: SellerRow) => void;
  onUpload: (s: SellerRow, file: File) => void;
}) {
  const sb = getSupabase();
  const [draft, setDraft] = useState<SellerRow>(seller);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(seller), [seller]);

  const dirty =
    draft.name !== seller.name ||
    draft.role !== seller.role ||
    draft.stall !== seller.stall ||
    draft.phone !== seller.phone ||
    draft.email !== seller.email ||
    draft.rating !== seller.rating ||
    draft.status !== seller.status ||
    draft.sort_order !== seller.sort_order;

  const patch = (p: Partial<SellerRow>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    if (!draft.name.trim()) {
      toast("A seller needs a name", "fa-triangle-exclamation");
      return;
    }
    setSaving(true);
    const { error } = await sb
      .from("sellers")
      .update({
        name: draft.name.trim(),
        role: draft.role,
        stall: draft.stall || null,
        phone: draft.phone,
        email: draft.email,
        rating: draft.rating,
        status: draft.status,
        sort_order: draft.sort_order,
      })
      .eq("id", seller.id);
    setSaving(false);
    if (error) {
      toast(errorMessage(error, "Could not save this seller"), "fa-triangle-exclamation");
      return;
    }
    toast(`${draft.name} saved`, "fa-floppy-disk");
    void onChanged();
  };

  const initials = draft.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.slice(0, 1).toUpperCase())
    .join("");

  return (
    <article className="admin-card">
      <div className="admin-card__media">
        {draft.image ? (
          <img src={draft.image} alt={draft.name} loading="lazy" />
        ) : (
          <div className="admin-avatar">{initials}</div>
        )}
        <label className="admin-upload">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(seller, e.target.files[0])} />
          {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
          Upload
        </label>
        <span className={`admin-flag${draft.status === "active" ? " admin-flag--good" : ""}`}>
          {draft.status === "active" ? "Active" : "Paused"}
        </span>
      </div>

      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Full name</span>
            <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
          </label>
          <label>
            <span>Role</span>
            <input value={draft.role} placeholder="Head chef" onChange={(e) => patch({ role: e.target.value })} />
          </label>
        </div>
        <div className="admin-two-col">
          <label>
            <span>Phone</span>
            <input value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} />
          </label>
        </div>
        <div className="admin-four-col">
          <label>
            <span>Stall</span>
            <select value={draft.stall ?? ""} onChange={(e) => patch({ stall: e.target.value || null })}>
              <option value="">Unassigned</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Rating</span>
            <input
              type="number"
              step="0.1"
              min={1}
              max={5}
              value={draft.rating}
              onChange={(e) => patch({ rating: Number(e.target.value) })}
            />
          </label>
          <label>
            <span>Status</span>
            <select value={draft.status} onChange={(e) => patch({ status: e.target.value })}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <label>
            <span>Order</span>
            <input type="number" value={draft.sort_order} onChange={(e) => patch({ sort_order: Number(e.target.value) })} />
          </label>
        </div>

        <div className="admin-row-actions">
          <span className="admin-id">{seller.id.slice(0, 8)}</span>
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" disabled={!dirty || saving} onClick={() => void save()}>
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save
          </button>
          <button className="admin-status-btn admin-status-btn--danger" onClick={() => void onDelete(seller)}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- add seller ---------------- */

function AddSeller({ cats, onDone }: { cats: CategoryRow[]; onDone: () => void }) {
  const sb = getSupabase();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Chef");
  const [stall, setStall] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Give the seller a name", "fa-triangle-exclamation");
      return;
    }
    setBusy(true);
    const { error } = await sb.from("sellers").insert({
      name: name.trim(),
      role: role.trim() || "Chef",
      stall: stall || null,
      phone: phone.trim(),
      email: email.trim(),
      status: "active",
      sort_order: 99,
    });
    setBusy(false);
    if (error) {
      toast(errorMessage(error, "Could not add the seller"), "fa-triangle-exclamation");
      return;
    }
    toast(`${name.trim()} added to the team`, "fa-user-plus");
    onDone();
  };

  return (
    <form className="admin-card admin-card--stall" onSubmit={submit}>
      <header className="admin-stall-head">
        <i className="fa-solid fa-user-plus"></i>
        <strong>New seller</strong>
        <span>stall owner or kitchen staff</span>
      </header>
      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chidi Nwosu" required />
          </label>
          <label>
            <span>Role</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Grill master" />
          </label>
        </div>
        <div className="admin-two-col">
          <label>
            <span>Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@bellymall.ng" />
          </label>
        </div>
        <label>
          <span>Stall</span>
          <select value={stall} onChange={(e) => setStall(e.target.value)}>
            <option value="">Unassigned</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-row-actions">
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" type="button" onClick={onDone}>
            Cancel
          </button>
          <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add seller"}
          </button>
        </div>
      </div>
    </form>
  );
}
