-- Singleton row holding the lounge's pin on the map. Editable from the portal.

CREATE TABLE business_location (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  zoom INTEGER NOT NULL DEFAULT 15,
  label TEXT,
  map_style TEXT NOT NULL DEFAULT 'stamen_toner_lite',
  stadia_api_key TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed with the lounge's pin (Plus Code 39H5+J7, West Melbourne FL).
INSERT INTO business_location (id, lat, lng, zoom, label) VALUES
  (1, 28.0791, -80.6418, 16, 'Jimmy''s Cigar Lounge');
