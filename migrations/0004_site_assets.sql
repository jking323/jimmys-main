-- Named site asset slots (hero collage, map, etc). Keys are predefined in
-- code; the table just stores which file is bound to which slot.

CREATE TABLE site_assets (
  key TEXT PRIMARY KEY,
  photo_path TEXT NOT NULL,
  alt_text TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
