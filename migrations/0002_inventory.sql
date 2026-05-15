-- Inventory + import audit tables.

CREATE TABLE cigars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- POS-owned columns: overwritten on every import.
  pos_id TEXT NOT NULL UNIQUE,            -- e.g. Square's Token. The stable join key.
  sku TEXT,                                -- POS SKU/UPC; can be blank or duplicated.
  pos_name TEXT,
  pos_category TEXT,
  pos_vendor TEXT,
  qty INTEGER NOT NULL DEFAULT 0,
  price REAL,
  cost REAL,
  last_seen_import_id INTEGER,
  last_synced_at TEXT,

  -- Staff-owned columns: the import never touches these.
  display_name TEXT,
  brand TEXT,
  vitola TEXT,
  origin TEXT,
  wrapper TEXT,
  strength TEXT,
  tasting_notes TEXT,
  slug TEXT UNIQUE,
  show_on_site INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER,

  -- Lifecycle.
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  removed_at TEXT,                         -- set when the SKU disappears from POS exports
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cigars_show ON cigars(show_on_site, qty);
CREATE INDEX idx_cigars_sku ON cigars(sku);
CREATE INDEX idx_cigars_qty ON cigars(qty);

CREATE TABLE inventory_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'cron',     -- 'cron' | 'manual'
  filename TEXT,
  rows_total INTEGER,
  rows_inserted INTEGER,
  rows_updated INTEGER,
  rows_zeroed INTEGER,
  rows_skipped INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'ok' | 'error'
  error_text TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);
CREATE INDEX idx_imports_started ON inventory_imports(started_at DESC);
