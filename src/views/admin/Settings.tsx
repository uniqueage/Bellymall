import { useEffect, useState } from "react";
import { getSupabase, SUPABASE_URL } from "../../lib/supabaseClient";
import { applySettings, DEFAULT_SETTINGS, type StoreSettings } from "../../lib/settings";
import { toast } from "../../toast";
import { errorMessage } from "./shared";

/* ============================================================
   SETTINGS — store-wide configuration written to site_content
   (store_settings) and read live by the storefront: announcement
   ticker, delivery pricing, contact details and social links.
   ============================================================ */

export function Settings() {
  const sb = getSupabase();
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await sb.from("site_content").select("value").eq("key", "store_settings").maybeSingle();
      const row = data?.value && typeof data.value === "object" ? (data.value as Partial<StoreSettings>) : {};
      setDraft({ ...DEFAULT_SETTINGS, ...row });
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (p: Partial<StoreSettings>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (draft.deliveryFee < 0 || draft.freeDeliveryOver < 0) {
      toast("Delivery amounts cannot be negative", "fa-triangle-exclamation");
      return;
    }
    setSaving(true);
    const { error } = await sb.from("site_content").upsert({ key: "store_settings", value: draft });
    setSaving(false);
    if (error) {
      toast(errorMessage(error, "Could not save settings"), "fa-triangle-exclamation");
      return;
    }
    applySettings(draft);
    toast("Settings saved — live across the site", "fa-floppy-disk");
  };

  if (!draft || !loaded) return <p className="section-sub">Loading settings…</p>;

  return (
    <form className="admin-stack" onSubmit={save}>
      <section className="admin-card admin-card--stall">
        <header className="admin-stall-head">
          <i className="fa-solid fa-bullhorn"></i>
          <strong>Storefront &amp; announcement</strong>
          <span>header ticker + footer tagline</span>
        </header>
        <div className="admin-card__fields">
          <div className="admin-two-col">
            <label>
              <span>Store name</span>
              <input value={draft.storeName} onChange={(e) => patch({ storeName: e.target.value })} />
            </label>
            <label>
              <span>Tagline</span>
              <input value={draft.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
            </label>
          </div>
          <label>
            <span>Announcement ticker (top of every page)</span>
            <textarea value={draft.ticker} rows={2} onChange={(e) => patch({ ticker: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="admin-card admin-card--stall">
        <header className="admin-stall-head">
          <i className="fa-solid fa-truck-fast"></i>
          <strong>Delivery &amp; pricing</strong>
          <span>applies at checkout instantly</span>
        </header>
        <div className="admin-card__fields">
          <div className="admin-two-col">
            <label>
              <span>Delivery fee (₦)</span>
              <input
                type="number"
                min={0}
                value={draft.deliveryFee}
                onChange={(e) => patch({ deliveryFee: Number(e.target.value) })}
              />
            </label>
            <label>
              <span>Free delivery over (₦)</span>
              <input
                type="number"
                min={0}
                value={draft.freeDeliveryOver}
                onChange={(e) => patch({ freeDeliveryOver: Number(e.target.value) })}
              />
            </label>
          </div>
          <p className="admin-hint">
            <i className="fa-solid fa-circle-info"></i> Set “free delivery over” to <strong>0</strong> to make every
            order ship free. Current preview: delivery is ₦{draft.deliveryFee.toLocaleString("en-NG")} below{" "}
            ₦{draft.freeDeliveryOver.toLocaleString("en-NG")}.
          </p>
        </div>
      </section>

      <section className="admin-card admin-card--stall">
        <header className="admin-stall-head">
          <i className="fa-solid fa-address-book"></i>
          <strong>Contact details</strong>
          <span>shown in the footer</span>
        </header>
        <div className="admin-card__fields">
          <div className="admin-two-col">
            <label>
              <span>Address</span>
              <input value={draft.address} onChange={(e) => patch({ address: e.target.value })} />
            </label>
            <label>
              <span>Opening hours</span>
              <input value={draft.hours} onChange={(e) => patch({ hours: e.target.value })} />
            </label>
            <label>
              <span>Phone</span>
              <input value={draft.supportPhone} onChange={(e) => patch({ supportPhone: e.target.value })} />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={draft.supportEmail} onChange={(e) => patch({ supportEmail: e.target.value })} />
            </label>
          </div>
        </div>
      </section>

      <section className="admin-card admin-card--stall">
        <header className="admin-stall-head">
          <i className="fa-solid fa-share-nodes"></i>
          <strong>Social links</strong>
          <span>footer icons</span>
        </header>
        <div className="admin-card__fields">
          <div className="admin-two-col">
            <label>
              <span>Instagram</span>
              <input value={draft.instagram} onChange={(e) => patch({ instagram: e.target.value })} />
            </label>
            <label>
              <span>X / Twitter</span>
              <input value={draft.twitter} onChange={(e) => patch({ twitter: e.target.value })} />
            </label>
            <label>
              <span>TikTok</span>
              <input value={draft.tiktok} onChange={(e) => patch({ tiktok: e.target.value })} />
            </label>
            <label>
              <span>Facebook</span>
              <input value={draft.facebook} onChange={(e) => patch({ facebook: e.target.value })} />
            </label>
          </div>
        </div>
      </section>

      <button className="btn btn--primary btn--block" type="submit" disabled={saving}>
        <i className="fa-solid fa-floppy-disk"></i> {saving ? "Saving…" : "Save settings"}
      </button>

      <p className="admin-hint">
        <i className="fa-solid fa-shield-halved"></i> Signed in as an administrator — settings are stored in Supabase
        (<code>site_content.store_settings</code>) and apply to every visitor on reload. Backend:{" "}
        <code>{new URL(SUPABASE_URL).host}</code>
      </p>
    </form>
  );
}
