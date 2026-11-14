import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { toast } from "../../toast";
import {
  ICON_CHOICES,
  PLACEHOLDER_IMAGE,
  errorMessage,
  hit,
  slugify,
  uploadSiteImage,
  type CategoryRow,
} from "./shared";

/* ============================================================
   CATEGORIES — create, edit, reorder and delete stalls. A new
   category created here appears on the storefront directory and
   gets its own /stall/<id> page immediately.
   ============================================================ */

type Props = { query: string };

export function Categories({ query }: Props) {
  const sb = getSupabase();
  const [cats, setCats] = useState<CategoryRow[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [catsRes, itemsRes] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("menu_items").select("category_id"),
    ]);
    if (catsRes.error) {
      setCats([]);
      return;
    }
    setCats((catsRes.data ?? []) as CategoryRow[]);
    const map: Record<string, number> = {};
    for (const row of (itemsRes.data ?? []) as { category_id: string }[]) {
      map[row.category_id] = (map[row.category_id] ?? 0) + 1;
    }
    setCounts(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (c: CategoryRow) => {
    const n = counts[c.id] ?? 0;
    const msg =
      n > 0
        ? `Delete “${c.name}” and its ${n} dish(s)? This cannot be undone.`
        : `Delete “${c.name}”? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    const { error } = await sb.from("categories").delete().eq("id", c.id);
    if (error) {
      toast(errorMessage(error, "Could not delete this stall"), "fa-triangle-exclamation");
      return;
    }
    toast(`“${c.name}” removed from the directory`, "fa-trash");
    void load();
  };

  const uploadImage = async (c: CategoryRow, file: File) => {
    setUploading(c.id);
    try {
      const url = await uploadSiteImage(sb, "stalls", file);
      const { error } = await sb.from("categories").update({ image: url }).eq("id", c.id);
      if (error) throw error;
      toast("Stall photo updated", "fa-image");
      void load();
    } catch (err) {
      toast(errorMessage(err, "Upload failed"), "fa-triangle-exclamation");
    } finally {
      setUploading(null);
    }
  };

  if (!cats) return <p className="section-sub">Loading stalls…</p>;

  const shown = cats.filter((c) => hit(query, c.name, c.short_name, c.slogan, c.blurb, c.id));

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <span className="admin-count">
            {shown.length} / {cats.length} stalls
          </span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding((v) => !v)}>
          <i className={`fa-solid ${adding ? "fa-xmark" : "fa-plus"}`}></i> {adding ? "Close" : "New category"}
        </button>
      </div>

      {adding && (
        <AddCategory
          existingIds={cats.map((c) => c.id)}
          onDone={() => {
            setAdding(false);
            void load();
          }}
        />
      )}

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-layer-group"></i>
          <strong>No stalls match that search</strong>
          <span>Clear the search box to see every stall.</span>
        </div>
      )}

      {shown.map((c) => (
        <CategoryCard
          key={c.id}
          cat={c}
          dishCount={counts[c.id] ?? 0}
          uploading={uploading === c.id}
          onChanged={load}
          onDelete={remove}
          onUpload={uploadImage}
        />
      ))}

      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> A new category is added to the mall directory and opens at{" "}
        <code>/stall/&lt;id&gt;</code>. Deleting a stall also removes its dishes (database cascade).
      </p>
    </div>
  );
}

/* ---------------- single stall card ---------------- */

function CategoryCard({
  cat,
  dishCount,
  uploading,
  onChanged,
  onDelete,
  onUpload,
}: {
  cat: CategoryRow;
  dishCount: number;
  uploading: boolean;
  onChanged: () => void;
  onDelete: (c: CategoryRow) => void;
  onUpload: (c: CategoryRow, file: File) => void;
}) {
  const sb = getSupabase();
  const [draft, setDraft] = useState<CategoryRow>(cat);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(cat), [cat]);

  const dirty =
    draft.name !== cat.name ||
    draft.short_name !== cat.short_name ||
    draft.slogan !== cat.slogan ||
    draft.blurb !== cat.blurb ||
    draft.icon !== cat.icon ||
    draft.featured !== cat.featured ||
    draft.sort_order !== cat.sort_order ||
    draft.image_alt !== cat.image_alt ||
    draft.image !== cat.image;

  const patch = (p: Partial<CategoryRow>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    if (!draft.name.trim() || !draft.short_name.trim()) {
      toast("Name and short name are required", "fa-triangle-exclamation");
      return;
    }
    setSaving(true);
    const { error } = await sb
      .from("categories")
      .update({
        name: draft.name.trim(),
        short_name: draft.short_name.trim(),
        slogan: draft.slogan,
        blurb: draft.blurb,
        icon: draft.icon,
        featured: draft.featured,
        sort_order: draft.sort_order,
        image_alt: draft.image_alt,
        image: draft.image,
      })
      .eq("id", cat.id);
    setSaving(false);
    if (error) {
      toast(errorMessage(error, "Could not save this stall"), "fa-triangle-exclamation");
      return;
    }
    toast(`${draft.name} saved — live in the directory`, "fa-floppy-disk");
    void onChanged();
  };

  return (
    <article className="admin-card">
      <div className="admin-card__media">
        <img src={draft.image} alt={draft.image_alt || draft.name} loading="lazy" />
        <label className="admin-upload">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(cat, e.target.files[0])}
          />
          {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
          Upload
        </label>
        {draft.featured && <span className="admin-flag admin-flag--good">Featured</span>}
      </div>

      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Stall name</span>
            <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
          </label>
          <label>
            <span>Short name</span>
            <input value={draft.short_name} onChange={(e) => patch({ short_name: e.target.value })} />
          </label>
        </div>
        <label>
          <span>Slogan</span>
          <input value={draft.slogan} onChange={(e) => patch({ slogan: e.target.value })} />
        </label>
        <label>
          <span>Blurb</span>
          <textarea value={draft.blurb} rows={2} onChange={(e) => patch({ blurb: e.target.value })} />
        </label>
        <div className="admin-four-col">
          <label>
            <span>Icon</span>
            <select value={draft.icon} onChange={(e) => patch({ icon: e.target.value })}>
              {!ICON_CHOICES.includes(draft.icon) && <option value={draft.icon}>{draft.icon}</option>}
              {ICON_CHOICES.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Order</span>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => patch({ sort_order: Number(e.target.value) })}
            />
          </label>
          <label>
            <span>Image alt text</span>
            <input value={draft.image_alt} onChange={(e) => patch({ image_alt: e.target.value })} />
          </label>
          <label>
            <span>Url id</span>
            <input value={draft.id} disabled />
          </label>
        </div>

        <div className="admin-row-actions">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
            Featured
          </label>
          <span className="admin-id">{dishCount} dish(s)</span>
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" disabled={!dirty || saving} onClick={() => void save()}>
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save
          </button>
          <button className="admin-status-btn admin-status-btn--danger" onClick={() => void onDelete(cat)}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- create a category ---------------- */

function AddCategory({ existingIds, onDone }: { existingIds: string[]; onDone: () => void }) {
  const sb = getSupabase();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [shortName, setShortName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [blurb, setBlurb] = useState("");
  const [icon, setIcon] = useState("fa-store");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);

  const onName = (value: string) => {
    setName(value);
    setId(slugify(value));
    if (!shortName) setShortName(value);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = slugify(id || name);
    if (!name.trim() || !finalId) {
      toast("Give the category a name", "fa-triangle-exclamation");
      return;
    }
    if (existingIds.includes(finalId)) {
      toast(`The id “${finalId}” is already used by another stall`, "fa-triangle-exclamation");
      return;
    }
    setBusy(true);
    const { error } = await sb.from("categories").insert({
      id: finalId,
      name: name.trim(),
      short_name: (shortName || name).trim(),
      slogan: slogan.trim() || name.trim(),
      blurb: blurb.trim(),
      image: PLACEHOLDER_IMAGE,
      image_alt: name.trim(),
      icon,
      featured,
      sort_order: existingIds.length,
    });
    setBusy(false);
    if (error) {
      toast(errorMessage(error, "Could not create the category"), "fa-triangle-exclamation");
      return;
    }
    toast(`${name.trim()} is live in the directory`, "fa-layer-group");
    onDone();
  };

  return (
    <form className="admin-card admin-card--stall" onSubmit={submit}>
      <header className="admin-stall-head">
        <i className="fa-solid fa-layer-group"></i>
        <strong>New category</strong>
        <span>appears on the storefront instantly</span>
      </header>
      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => onName(e.target.value)} placeholder="e.g. Seafood corner" required />
          </label>
          <label>
            <span>Short name</span>
            <input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="Seafood" />
          </label>
        </div>
        <div className="admin-two-col">
          <label>
            <span>Url id</span>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="seafood-corner" />
          </label>
          <label>
            <span>Icon</span>
            <select value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_CHOICES.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span>Slogan</span>
          <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Fresh from the Atlantic" />
        </label>
        <label>
          <span>Blurb</span>
          <textarea value={blurb} rows={2} onChange={(e) => setBlurb(e.target.value)} placeholder="What is this stall about?" />
        </label>
        <div className="admin-row-actions">
          <label className="admin-toggle">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" type="button" onClick={onDone}>
            Cancel
          </button>
          <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create category"}
          </button>
        </div>
      </div>
    </form>
  );
}
