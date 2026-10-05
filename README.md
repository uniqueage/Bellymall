# Bellymall

Food-hall ordering site built with **Vite + React + TypeScript**.

## Backend (Supabase)

The site works without a backend (static catalog + local demo orders). With Supabase configured it becomes fully dynamic:

- Editable **hero carousel** and **gallery** (images, titles, buttons, add/remove slides)
- Full **products CRUD** (add/edit/delete dishes: name, story, price, badge, rating, photo, availability)
- **Categories CRUD** — create a new stall from the dashboard and it appears on the storefront at once
- **Sellers** directory (stall owners/kitchen staff) with photos, contact details and active/paused status
- **Customers** directory assembled from orders + activity (orders, spend, repeat buyers, last seen)
- **Orders** saved to Postgres, with a searchable order board and status updates
- **Store settings** (announcement ticker, delivery fee & free-delivery threshold, contact details, socials)
- **Customer activity** tracked (page views, stall visits, basket adds, searches, orders, sign-ins) with a live realtime feed
- **Search** in the storefront (⌘K / Ctrl+K or `/`) and inside every admin list

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
   This creates the tables, security policies, image storage bucket, seeds your current menu, and enables realtime.
   The file is idempotent — if you installed an older version, just run it again to add the newer tables
   (`sellers`, `store_settings`) without touching your data.

### 2. Add your keys

From **Project Settings → API**, copy the Project URL and anon public key into:

- **Local dev:** `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Freebuff hosting:** Settings → Environment (same keys)
- **GitHub Pages:** repo **Settings → Secrets and variables → Actions**, create `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the deploy workflow already reads them)

### 3. Claim the admin dashboard

Open **`/#/admin`** on the site and create an account (or use the **`/admin.html`** shortcut,
which forwards straight to the console: [bellymall.freebuff.app/admin.html](https://bellymall.freebuff.app/admin.html)).
**The first account registered becomes the admin automatically.**
(To add more admins later, run in the Supabase SQL editor:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'someone@example.com';
```
)

## Admin dashboard sections

| Section | What you can do |
| --- | --- |
| Overview | Orders, revenue, customers, products, sellers and live events; best sellers, latest orders, quick actions |
| Products | Add, edit and delete dishes — name, description, price, badge, rating, icon, stall, order, photo, availability |
| Categories | Create a new stall (it appears in the directory immediately), edit its copy/icon/photo, feature or delete it |
| Orders | Search orders; filter by status; items, address, phone, payment; move status *placed → preparing → on the way → delivered* |
| Sellers | Add/edit/delete sellers: role, stall assignment, phone, email, rating, photo, active/paused |
| Customers | Who buys, how much and how often — orders, spend, repeat buyers, last order, last action, anonymous visitors |
| Contents | Hero + gallery carousels: titles, subtitles, buttons, trust badges, photos; add or remove slides |
| Settings | Announcement ticker, delivery fee, free-delivery threshold, contact details, social links |
| Activity | Realtime stream of customer actions with per-event filters and search |

## Search

- **Storefront:** the magnifying-glass button in the header (or press **⌘K / Ctrl+K**, or **`/`** anywhere)
  searches stalls and dishes live; picking a result opens that stall's page and logs a `search` event.
- **Admin:** the search box at the top of the dashboard filters the active section (products, categories,
  orders, sellers, customers, activity).

## Development

```bash
bun install      # or npm install
bun run dev      # local dev server
bun run build    # production build → dist/
```

## Troubleshooting

**uniqueage.github.io/Bellymall shows raw code / a directory listing instead of the site.**
The repo's Pages source was set to the legacy "deploy from branch" mode, which serves the
raw repository. It must be **Settings → Pages → Source → GitHub Actions**. After changing
it, open the **Actions** tab → *Deploy Bellymall to GitHub Pages* → **Run workflow** (or
push any commit) so a fresh Actions deploy overwrites the stale artifact. If both an
Actions deploy and a legacy deploy run at the same time, whichever finishes last wins —
just trigger one more Actions run afterwards.

**The site shows old content after a deploy.**
github.io caches pages for up to 10 minutes. Hard-refresh (Ctrl/Cmd+Shift+R) or wait it
out — the Freebuff URL (https://bellymall.freebuff.app) picks up deploys immediately.
