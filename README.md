# Jimmy's Cigar Lounge

Public marketing site + staff management portal for Jimmy's Cigar Lounge.

- **Frontend**: Vite + React (single SPA, with `/admin/*` routes for the portal)
- **Backend**: Cloudflare Pages Functions in `functions/` (`/api/*`)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Auth**: Email + password, PBKDF2-hashed, httpOnly session cookies

## What's in the portal

Staff can sign in at `/admin` and manage:

- **Events** — create / edit / delete events that show up on the homepage, including RSVPs (with CSV export).
- **Cigar of the Month** — pick the current month's feature, plus a full archive.
- **Newsletter** — see who's subscribed, unsubscribe people, export the list as CSV.

The public site fetches events from `/api/events`, the current pick from `/api/cotm/current`, accepts RSVPs at `/api/events/:id/rsvp`, and newsletter signups at `/api/newsletter/subscribe`.

## Local setup

1. Install deps:
   ```bash
   npm install
   ```

2. Create the D1 database (one-time):
   ```bash
   npx wrangler d1 create jimmys
   ```
   Copy the printed `database_id` into `wrangler.toml`.

3. Apply migrations locally:
   ```bash
   npm run db:apply:local
   ```

4. Optional — seed sample events / a current pick:
   ```bash
   npm run db:seed:local
   ```

5. Create yourself a staff account (local DB):
   ```bash
   npm run create-staff -- --email you@jimmys.com --name "Your Name" --password "something-good" --role admin
   ```

6. Run it:
   ```bash
   # In one terminal — Pages dev server with Functions + D1 bindings:
   npx wrangler pages dev -- npm run dev
   ```
   Open http://localhost:8788. Admin is at http://localhost:8788/admin.

Alternatively, run `npm run dev` for Vite-only mode (frontend at :5173, but `/api/*` requests will fail without the Workers runtime).

## Deploying to Cloudflare

1. One-time — apply migrations to the production DB:
   ```bash
   npm run db:apply:remote
   ```

2. Create your real staff account:
   ```bash
   npm run create-staff -- --email you@jimmys.com --name "Your Name" --password "something-strong" --role admin --remote
   ```

3. Push the site:
   ```bash
   npm run deploy
   ```

   This builds Vite into `dist/`, then deploys to Cloudflare Pages. The first deploy creates the project; the D1 binding is read from `wrangler.toml`.

## Layout

```
src/
  main.jsx              entry, sets up React Router
  Site.jsx              public marketing page
  components/           public site components (Nav, Hero, Events, etc.)
  data/                 static frontend data (humidor, launches, quiz)
  admin/                admin SPA (login, dashboard, editors)
  lib/api.js            fetch wrappers around /api/*

functions/
  _shared/              auth + crypto + response helpers
  api/                  public endpoints (events, cotm, newsletter)
  api/admin/            staff-only endpoints (guarded by _middleware.js)

migrations/             D1 schema + optional seed data
scripts/create-staff.mjs  CLI to add or reset a staff account
```

## Notes

- Passwords are PBKDF2-SHA256 with 100k iterations and a per-user salt. Session tokens are 32 random bytes stored in the `sessions` table.
- The public site is a single SPA route at `/`; React Router takes over for `/admin/*`. `public/_redirects` makes deep admin links work after a hard refresh.
- Humidor inventory and the launch schedule stay as static data in `src/data/` for now — easy to swap for an API later.
