# Jimmy's Cigar Lounge

Public marketing site + staff management portal for Jimmy's Cigar Lounge.

- **Frontend**: Vite + React (single SPA, with `/admin/*` routes for the portal)
- **Backend**: Cloudflare Pages Functions in `functions/` (`/api/*`)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Auth**: Email + password, PBKDF2-hashed, httpOnly session cookies

## What's in the portal

Staff sign in at `/admin` and manage:

- **Events** — create/edit/delete events on the homepage. RSVPs + CSV export per event.
- **Humidor** — the live cigar list synced from your POS via a nightly CSV import. Staff curate which SKUs show on the site, set tasting notes, strength, origin, etc. The cron-imported columns (qty, price, cost) are never overwritten by hand and the hand-curated columns are never overwritten by the cron.
- **Cigar of the Month** — pick the current month's feature, plus a full archive.
- **Newsletter** — subscriber list, search/filter, unsubscribe, CSV export.
- **POS sync** — the last 50 import runs with row counts and errors, for debugging.

## Inventory data model

One `cigars` table with two categories of columns:

| Owned by | Columns |
|---|---|
| **POS import** (overwritten every sync) | `pos_id`, `sku`, `pos_name`, `pos_category`, `pos_vendor`, `qty`, `price`, `cost`, `last_synced_at` |
| **Staff** (untouched by import) | `display_name`, `brand`, `vitola`, `origin`, `wrapper`, `strength`, `tasting_notes`, `slug`, `show_on_site`, `featured`, `sort_order` |

`pos_id` is the stable join key (Square's `Token`). SKUs that disappear from a new full snapshot get `qty=0` and `removed_at` set automatically.

## Photos (R2)

Photos live in a Cloudflare R2 bucket named `jimmys-media` (binding: `MEDIA`). Path conventions:

| Where | Path |
|---|---|
| Cigar | `cigars/<pos_id>/main.<ext>` |
| Event | `events/<slug>.<ext>` |
| Cigar of the Month | `cotm/<YYYY-MM>.<ext>` |
| Hero / site chrome | `site/<name>.<ext>` |

Allowed extensions: `.jpg .jpeg .png .webp .avif .gif`. Max 8 MB per file.

Upload happens through the portal — each editor has a photo widget. The widget POSTs to `/api/admin/upload?path=...`. Photos are served via `/api/media/<path>` (cached at the edge for a day).

To create the bucket the first time:

```bash
npx wrangler r2 bucket create jimmys-media
```

## Hours

Hours are stored in `business_hours` (one row per day, 0=Sun .. 6=Sat) with `hours_overrides` for one-off changes (holidays, weather closures). The lounge's timezone is hardcoded to `America/New_York` in `functions/_shared/hours.js`.

Edit hours at `/admin/hours`. The public Visit section and Hero "Open now" indicator both pull from `/api/hours`, with the open/closed decision computed server-side in lounge-local time.

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

4. Optional — seed sample events and a current pick:
   ```bash
   npm run db:seed:local
   ```

5. Create yourself a staff account (local DB):
   ```bash
   npm run create-staff -- --email you@jimmys.com --name "Your Name" --password "something-good" --role admin
   ```

6. Add a local inventory-import token. Create `.dev.vars` (gitignored):
   ```
   INVENTORY_IMPORT_TOKEN=any-string-you-like-for-local
   ```

7. Run it:
   ```bash
   npx wrangler pages dev -- npm run dev
   ```
   Open `http://localhost:8788`. Admin is at `http://localhost:8788/admin`.

## Importing inventory

```bash
curl -X POST http://localhost:8788/api/inventory/import \
  -H "Authorization: Bearer $INVENTORY_IMPORT_TOKEN" \
  -H "Content-Type: text/csv" \
  -H "X-Inventory-Filename: square-export-2025-11-12.csv" \
  --data-binary @./square-export.csv
```

You'll get back:
```json
{ "ok": true, "import_id": 3, "rows_total": 169, "inserted": 4, "updated": 165, "zeroed": 0, "skipped": 0 }
```

The history is visible at `/admin/inventory`. After the first run, head to `/admin/cigars` and flip `show_on_site` on the cigars you want featured.

### Cron job snippet (external server)

```bash
#!/usr/bin/env bash
# /etc/cron.d/jimmys-sync — runs at 03:00 local every night.

set -euo pipefail

TOKEN="$(cat /etc/jimmys/inventory_token)"   # 0600 root:root
EXPORT="/tmp/square-$(date +%Y%m%d).csv"

# 1. Pull the Square catalog CSV (replace with however you grab it)
square-export-tool export --output "$EXPORT"

# 2. Send it up
curl -fsS -X POST https://your-domain.com/api/inventory/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/csv" \
  -H "X-Inventory-Filename: $(basename "$EXPORT")" \
  --data-binary "@$EXPORT"

rm -f "$EXPORT"
```

### Switching POS systems

When you move off Square, update one env var. Set `INVENTORY_CSV_MAPPING` to a JSON object listing your new POS's column names. Defaults are in `functions/_shared/inventory.js`.

```bash
wrangler pages secret put INVENTORY_CSV_MAPPING
# Then paste:
# {"pos_id":"Product ID","sku":"UPC","pos_name":"Description","qty_prefix":"On Hand","price":"Retail","cost":"Cost","pos_vendor":"Manufacturer"}
```

No code change needed.

## Deploying to Cloudflare

One-time setup:

```bash
# 1. Sign in and create the project
npx wrangler login
npx wrangler d1 create jimmys                # paste id into wrangler.toml
npx wrangler pages project create jimmys --production-branch=main

# 2. Apply schema + seed (production D1)
npm run db:apply:remote
npx wrangler d1 execute jimmys --remote --file=./migrations/seed.sql  # optional

# 3. Create your admin account on production
npm run create-staff -- --email you@jimmys.com --name "Your Name" --password "..." --role admin --remote

# 4. Secrets
npx wrangler pages secret put INVENTORY_IMPORT_TOKEN --project-name=jimmys
# (paste a strong random string — this is what your cron job will use)
```

Every deploy:

```bash
npm run deploy
```

That builds Vite into `dist/` and pushes to Cloudflare Pages. The D1 binding from `wrangler.toml` carries through.

## Layout

```
src/
  main.jsx              entry, React Router setup
  Site.jsx              public marketing page
  components/           public site components (Nav, Hero, Humidor, Events, …)
  data/                 static frontend data (launches, quiz)
  admin/                admin SPA (login, dashboard, editors)
  lib/api.js            fetch wrappers around /api/*

functions/
  _shared/              auth + crypto + csv + inventory + response helpers
  api/                  public endpoints (events, cotm, humidor, newsletter, inventory/import)
  api/admin/            staff-only endpoints (guarded by _middleware.js)

migrations/             D1 schema (0001 base, 0002 inventory) + optional seed
scripts/create-staff.mjs  CLI to add or reset a staff account
```

## Notes

- Passwords are PBKDF2-SHA256 with 100k iterations and a per-user salt. Session tokens are 32 random bytes stored in the `sessions` table.
- The `/api/inventory/import` endpoint is bearer-auth'd, not session-auth'd, so cron jobs can hit it without a browser.
- The pairing quiz still uses static cigar data in `src/data/`. After you've curated the humidor in `/admin/cigars`, the quiz can be re-wired to score live cigars by `strength`/`tasting_notes`/`vitola` instead of hardcoded IDs — flagged as a follow-up.
- The Hero's "240 cigars in stock" stat is hardcoded copy for now; once you've curated the humidor the real total is shown at the bottom of the humidor section.
