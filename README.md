# Bellymall

Food-hall ordering site built with **Vite + React + TypeScript**.

## Backend (Supabase)

The site works without a backend (static catalog + local demo orders). With Supabase configured it becomes fully dynamic:

- Editable **hero carousel** and **gallery** (images, titles, buttons)
- Editable **stalls and dishes** (prices, photos, availability)
- **Orders** saved to Postgres, with an admin order board and status updates
- **Customer activity** tracked (page views, stall visits, basket adds, orders, sign-ins) with a live realtime feed

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste the whole contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
   This creates the tables, security policies, image storage bucket, seeds your current menu, and enables realtime.

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
| Overview | Orders, revenue, customer events at a glance |
| Hero & gallery | Edit slide titles, text, buttons; upload new images |
| Stalls & dishes | Change any price, swap dish photos, hide sold-out items |
| Orders | Every order with items/address/phone; move status from *placed → preparing → on the way → delivered* |
| Live activity | Realtime stream of what customers do on the site |

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
