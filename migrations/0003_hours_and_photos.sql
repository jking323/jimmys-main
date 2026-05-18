-- Business hours + per-date overrides, plus photo paths on the curated entities.

CREATE TABLE business_hours (
  day_of_week INTEGER PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  open_at TEXT,                          -- 'HH:MM', lounge-local time
  close_at TEXT,                         -- 'HH:MM'; if < open_at, treat as next-day
  closed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE hours_overrides (
  date TEXT PRIMARY KEY,                 -- 'YYYY-MM-DD' in lounge-local time
  open_at TEXT,
  close_at TEXT,
  closed INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed Jimmy's actual hours.
INSERT INTO business_hours (day_of_week, open_at, close_at, closed) VALUES
  (0, '11:00', '21:00', 0),  -- Sunday
  (1, '10:00', '21:00', 0),  -- Monday
  (2, '10:00', '21:00', 0),  -- Tuesday
  (3, '10:00', '21:00', 0),  -- Wednesday
  (4, '10:00', '21:00', 0),  -- Thursday
  (5, '10:00', '22:00', 0),  -- Friday
  (6, '10:00', '22:00', 0);  -- Saturday

-- Photo paths into the R2 bucket. NULL means no photo uploaded yet.
ALTER TABLE cigars ADD COLUMN photo_path TEXT;
ALTER TABLE events ADD COLUMN photo_path TEXT;
ALTER TABLE cotm   ADD COLUMN photo_path TEXT;
