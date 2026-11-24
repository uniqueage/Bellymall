# Bellymall

Food-hall ordering site built with **Next.js (App Router) + React + TypeScript**.

Every stall has a real URL, pages are server-rendered with per-page metadata, and the
storefront keeps its original cocoa-and-cream design system.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Storefront home — hero carousel, directory, hot picks, gallery, deal, how it works |
| `/stall/[id]` | A single stall with its full, orderable menu (statically generated per stall) |
| `/about` | About Bellymall plus your orders and the stall list |
| `/signin` | Demo sign-in / sign-up |
| `/admin` | Admin dashboard (Supabase auth + first account becomes admin) |
| `/sitemap.xml`, `/robots.txt` | Generated for search engines; `/admin` and `/signin` are noindex |

Search (⌘K / Ctrl+K or `/`), the basket drawer, checkout and toasts are shared across
every route by the app shell in [`src/App.tsx`](src/App.tsx).

## Backend (Supabase) — optional

The site works without a backend (static catalog + local demo orders). With Supabase
configured it becomes fully dynamic:

- Editable **hero carousel** and **gallery**
- Full **products CRUD**, **categories CRUD**, **sellers**, **customers**, **orders**, **store settings**
- **Customer activity** tracking with a live realtime feed
- Search in the storefront and inside every admin list

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
   This creates the tables, security policies, image storage bucket, seeds the menu and enables realtime.
   The file is idempotent — run it again to pick up newer tables without touching your data.

### 2. Add your keys

From **Project Settings → API**, copy the Project URL and anon public key into:

- **Local dev:** `.env.local` (see [`.env.example`](.env.example))
- **Vercel:** Project → **Settings → Environment Variables** (all environments)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is publishable by design — Row Level Security decides what it may read or
write. Never use the `service_role` key in these variables.

### 3. Claim the admin dashboard

Open **`/admin`** and create an account. **The first account registered becomes the admin
automatically.** (To add more admins later, run in the Supabase SQL editor:

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
| Categories | Create a new stall (it appears in the directory and at `/stall/<id>` immediately), edit, feature or delete it |
| Orders | Search orders; filter by status; move status *placed → preparing → on the way → delivered* |
| Sellers | Add/edit/delete sellers: role, stall, contact details, rating, photo, active/paused |
| Customers | Who buys, how much and how often, last order, last action, anonymous visitors |
| Contents | Hero + gallery carousels: titles, subtitles, buttons, trust badges, photos |
| Settings | Announcement ticker, delivery fee, free-delivery threshold, contact details, socials |
| Activity | Realtime stream of customer actions with filters and search |

## Testing the admin dashboard locally (no live data)

`mocks/supabase-mock.mjs` is a small local stand-in for Supabase — auth, REST tables and storage —
seeded with demo content. Nothing leaves your machine, so you can click through every dashboard
section, including saves and deletes, without touching the real project.

```bash
bun run mock:supabase        # mock API on http://127.0.0.1:54399

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key \
bun run dev
```

Open `/admin` and sign in as `owner@bellymall.ng` with any password of 8+ characters (for example
`bellymall`). All nine sections load from the fixtures: 7 stalls, 10 dishes, 4 sellers, 5 orders and
10 activity events.

- `GET http://127.0.0.1:54399/__admin/state` — dump the in-memory tables
- `POST http://127.0.0.1:54399/__admin/reset` — restore the seed data

Restart the dev server without those two variables to point back at the real Supabase project.
Realtime websockets are not emulated, so the Orders and Activity live feeds only show whatever the
normal queries return.

## Development

```bash
bun install      # or npm install
bun run dev      # http://localhost:3000
bun run build    # production build
bun run start    # serve the production build
bun run typecheck
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the repository. Vercel detects Next.js, runs
   `next build` and needs no extra configuration.
3. Add the environment variables from step 2 above under **Settings → Environment Variables**
   (optional — the site runs fine without them).
4. Canonical URLs, OG tags and the sitemap default to **https://bellymall-ng.vercel.app**. If the
   project is served from a different domain, set `NEXT_PUBLIC_SITE_URL` to that origin and redeploy.

## Search

- **Storefront:** the magnifying-glass button in the header (or **⌘K / Ctrl+K**, or **`/`** anywhere)
  searches stalls and dishes live; picking a result opens that stall's page and logs a `search` event.
- **Admin:** the search box at the top of the dashboard filters the active section.
