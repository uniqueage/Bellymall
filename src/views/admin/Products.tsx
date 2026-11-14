import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { toast } from "../../toast";
import {
  ICON_CHOICES,
  errorMessage,
  hit,
  newItemId,
  uploadSiteImage,
  type CategoryRow,
  type ProductRow,
} from "./shared";

/* ============================================================
   PRODUCTS — full CRUD for every dish on the menu: name, story,
   price, tag, rating, icon, stall, order and photo. Everything
   saves straight to Postgres and shows on the storefront at once.
   ============================================================ */

type Props = { query: string };

export function Products({ query }: Props) {
  const sb = getSupabase();
  const [items, setItems] = useState<ProductRow[] | null>(null);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [tableGone, setTableGone] = useState(false);

  const load = useCallback(async () => {
    const [itemsRes, catsRes] = await Promise.all([
      sb.from("menu_items").select("*").order("category_id").order("sort_order"),
      sb.from("categories").select("*").order("sort_order"),
    ]);
    if (itemsRes.error) {
      setItems([]);
      setTableGone(/could not find the table|does not exist/i.test(itemsRes.error.message ?? ""));
      return;
    }
    setItems((itemsRes.data ?? []) as ProductRow[]);
    setCats((catsRes.data ?? []) as CategoryRow[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (item: ProductRow) => {
    if (!window.confirm(`Delete “${item.name}” for good? This cannot be undone.`)) return;
    const { error } = await sb.from("menu_items").delete().eq("id", item.id);
    if (error) {
      toast(errorMessage(error, "Could not delete this dish"), "fa-triangle-exclamation");
      return;
    }
    toast(`“${item.name}” deleted`, "fa-trash");
    void load();
  };

  if (!items) return <p className="section-sub">Loading products…</p>;

  if (tableGone) {
    return (
      <div className="admin-stack">
        <div className="cart-empty">
          <i className="fa-solid fa-database"></i>
          <strong>The database tables are missing</strong>
          <span>
            Run <code>supabase/schema.sql</code> in the Supabase SQL editor (it is safe to re-run), then reload this
            page.
          </span>
        </div>
      </div>
    );
  }

  const shown = items.filter(
    (m) =>
      (catFilter === "all" || m.category_id === catFilter) &&
      (availFilter === "all" || (availFilter === "available" ? m.available : !m.available)) &&
      hit(query, m.name, m.desc, m.tag, m.id, m.category_id)
  );

  const catName = (id: string) => cats.find((c) => c.id === id)?.short_name ?? id;

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by stall">
            <option value="all">All stalls</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name}
              </option>
            ))}
          </select>
          <select value={availFilter} onChange={(e) => setAvailFilter(e.target.value)} aria-label="Filter by availability">
            <option value="all">Available + hidden</option>
            <option value="available">Available only</option>
            <option value="hidden">Hidden only</option>
          </select>
          <span className="admin-count">
            {shown.length} / {items.length} dishes
          </span>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setAdding((v) => !v)}>
          <i className={`fa-solid ${adding ? "fa-xmark" : "fa-plus"}`}></i> {adding ? "Close" : "Add dish"}
        </button>
      </div>

      {adding && (
        <AddDish
          cats={cats}
          onDone={() => {
            setAdding(false);
            void load();
          }}
        />
      )}

      {shown.length === 0 && (
        <div className="cart-empty">
          <i className="fa-solid fa-bowl-food"></i>
          <strong>{items.length === 0 ? "No dishes yet" : "No dishes match your filters"}</strong>
          <span>
            {items.length === 0
              ? "Add your first dish with the button above."
              : "Clear the search box or pick another stall."}
          </span>
        </div>
      )}

      {shown.map((m) => (
        <ProductCard key={m.id} item={m} cats={cats} catName={catName(m.category_id)} onChanged={load} onDelete={remove} />
      ))}

      <p className="admin-hint">
        <i className="fa-solid fa-circle-info"></i> Edit any field and press <strong>Save dish</strong> — changes are
        live for every visitor immediately. Uncheck “Available” to hide a sold-out dish.
      </p>
    </div>
  );
}

/* ---------------- single dish card ---------------- */

function ProductCard({
  item,
  cats,
  catName,
  onChanged,
  onDelete,
}: {
  item: ProductRow;
  cats: CategoryRow[];
  catName: string;
  onChanged: () => void;
  onDelete: (item: ProductRow) => void;
}) {
  const sb = getSupabase();
  const [draft, setDraft] = useState<ProductRow>(item);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setDraft(item), [item]);

  const dirty =
    draft.name !== item.name ||
    draft.desc !== item.desc ||
    draft.price !== item.price ||
    draft.tag !== item.tag ||
    draft.rating !== item.rating ||
    draft.icon !== item.icon ||
    draft.category_id !== item.category_id ||
    draft.available !== item.available ||
    draft.sort_order !== item.sort_order ||
    draft.alt !== item.alt ||
    draft.image !== item.image;

  const patch = (p: Partial<ProductRow>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    if (!draft.name.trim()) {
      toast("A dish needs a name", "fa-triangle-exclamation");
      return;
    }
    setSaving(true);
    const { error } = await sb
      .from("menu_items")
      .update({
        name: draft.name.trim(),
        desc: draft.desc,
        price: Math.max(0, Math.round(draft.price)),
        tag: draft.tag?.trim() || null,
        rating: draft.rating,
        icon: draft.icon,
        category_id: draft.category_id,
        available: draft.available,
        sort_order: draft.sort_order,
        alt: draft.alt,
        image: draft.image,
      })
      .eq("id", item.id);
    setSaving(false);
    if (error) {
      toast(errorMessage(error, "Could not save this dish"), "fa-triangle-exclamation");
      return;
    }
    toast(`${draft.name} saved — live now`, "fa-floppy-disk");
    void onChanged();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadSiteImage(sb, "dishes", file);
      patch({ image: url });
      const { error } = await sb.from("menu_items").update({ image: url }).eq("id", item.id);
      if (error) throw error;
      toast("Photo uploaded", "fa-image");
      void onChanged();
    } catch (err) {
      toast(errorMessage(err, "Upload failed — are you signed in as admin?"), "fa-triangle-exclamation");
    } finally {
      setUploading(false);
    }
  };

  return (
    <article className="admin-card">
      <div className="admin-card__media">
        <img src={draft.image} alt={draft.alt || draft.name} loading="lazy" />
        <label className="admin-upload">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
          Upload
        </label>
        {!draft.available && <span className="admin-flag">Hidden</span>}
      </div>

      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Dish name</span>
            <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
          </label>
          <label>
            <span>Stall</span>
            <select value={draft.category_id} onChange={(e) => patch({ category_id: e.target.value })}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea value={draft.desc} rows={2} onChange={(e) => patch({ desc: e.target.value })} />
        </label>

        <div className="admin-four-col">
          <label>
            <span>Price (₦)</span>
            <input
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => patch({ price: Number(e.target.value) })}
            />
          </label>
          <label>
            <span>Badge</span>
            <input value={draft.tag ?? ""} placeholder="Bestseller" onChange={(e) => patch({ tag: e.target.value })} />
          </label>
          <label>
            <span>Rating</span>
            <input value={draft.rating} placeholder="4.8" onChange={(e) => patch({ rating: e.target.value })} />
          </label>
          <label>
            <span>Order</span>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) => patch({ sort_order: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="admin-two-col">
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
            <span>Image alt text</span>
            <input value={draft.alt} onChange={(e) => patch({ alt: e.target.value })} />
          </label>
        </div>

        <div className="admin-row-actions">
          <label className="admin-toggle">
            <input type="checkbox" checked={draft.available} onChange={(e) => patch({ available: e.target.checked })} />
            Available
          </label>
          <span className="admin-id">{catName} · {item.id}</span>
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" onClick={() => setOpen((v) => !v)}>
            <i className="fa-solid fa-ellipsis"></i> {open ? "Less" : "More"}
          </button>
          <button className="admin-status-btn" disabled={!dirty || saving} onClick={() => void save()}>
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save
            dish
          </button>
          <button className="admin-status-btn admin-status-btn--danger" onClick={() => void onDelete(item)}>
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>

        {open && (
          <details className="admin-details" open>
            <summary>Raw image URL</summary>
            <input value={draft.image} onChange={(e) => patch({ image: e.target.value })} />
          </details>
        )}
      </div>
    </article>
  );
}

/* ---------------- add a new dish ---------------- */

function AddDish({ cats, onDone }: { cats: CategoryRow[]; onDone: () => void }) {
  const sb = getSupabase();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(cats[0]?.id ?? "");
  const [price, setPrice] = useState<number>(2500);
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("");
  const [rating, setRating] = useState("4.7");
  const [icon, setIcon] = useState("fa-bowl-food");
  const [sort, setSort] = useState(99);
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!categoryId && cats.length) setCategoryId(cats[0].id);
  }, [cats, categoryId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      toast("Give the dish a name and pick a stall", "fa-triangle-exclamation");
      return;
    }
    setBusy(true);
    const id = newItemId(name);
    const { error } = await sb.from("menu_items").insert({
      id,
      category_id: categoryId,
      name: name.trim(),
      desc: desc.trim(),
      price: Math.max(0, Math.round(price)),
      image:
        image ||
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
      alt: name.trim(),
      tag: tag.trim() || null,
      rating,
      icon,
      available: true,
      sort_order: sort,
    });
    setBusy(false);
    if (error) {
      toast(errorMessage(error, "Could not add the dish"), "fa-triangle-exclamation");
      return;
    }
    toast(`${name.trim()} added to the menu`, "fa-circle-check");
    onDone();
  };

  return (
    <form className="admin-card admin-card--stall" onSubmit={submit}>
      <header className="admin-stall-head">
        <i className="fa-solid fa-plus"></i>
        <strong>New dish</strong>
        <span>goes live the moment you save</span>
      </header>
      <div className="admin-card__fields">
        <div className="admin-two-col">
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spicy beef noodles" />
          </label>
          <label>
            <span>Stall</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short_name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span>Description</span>
          <textarea value={desc} rows={2} onChange={(e) => setDesc(e.target.value)} placeholder="What makes it good?" />
        </label>
        <div className="admin-four-col">
          <label>
            <span>Price (₦)</span>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>
          <label>
            <span>Badge</span>
            <input value={tag} placeholder="New" onChange={(e) => setTag(e.target.value)} />
          </label>
          <label>
            <span>Rating</span>
            <input value={rating} onChange={(e) => setRating(e.target.value)} />
          </label>
          <label>
            <span>Order</span>
            <input type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} />
          </label>
        </div>
        <div className="admin-two-col">
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
          <div className="admin-field">
            <span className="admin-field-label">Photo</span>
            <span className="admin-upload-row">
              <label className="admin-upload admin-upload--sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const url = await uploadSiteImage(sb, "dishes", file);
                      setImage(url);
                      toast("Photo ready — save to attach it", "fa-image");
                    } catch (err) {
                      toast(errorMessage(err, "Upload failed"), "fa-triangle-exclamation");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
                {image ? "Replace" : "Upload photo"}
              </label>
              {image && <span className="admin-id">attached</span>}
            </span>
          </div>
        </div>
        <div className="admin-row-actions">
          <span className="admin-spacer"></span>
          <button className="admin-status-btn" type="button" onClick={onDone}>
            Cancel
          </button>
          <button className="btn btn--primary btn--sm" type="submit" disabled={busy || uploading}>
            {busy ? "Saving…" : "Add to menu"}
          </button>
        </div>
      </div>
    </form>
  );
}
