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

-- Seed with the wireframe address (1220 W New Haven Ave, West Melbourne FL).
INSERT INTO business_location (id, lat, lng, zoom, label) VALUES
  (1, 28.0668, -80.6520, 16, 'Jimmy''s Cigar Lounge');
