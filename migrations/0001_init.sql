-- Jimmy's Cigar Lounge — initial schema

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  blurb TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT,
  price_text TEXT NOT NULL DEFAULT 'Free',
  seats_total INTEGER,
  tag TEXT,
  tag_kind TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_events_start ON events(start_at);
CREATE INDEX idx_events_published ON events(published);

CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(event_id, email)
);
CREATE INDEX idx_rsvps_event ON rsvps(event_id);

CREATE TABLE cotm (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  italic_word TEXT,
  blurb TEXT NOT NULL,
  quote TEXT,
  quote_by TEXT DEFAULT 'Jimmy',
  origin TEXT,
  strength TEXT,
  smoke_time TEXT,
  price_regular REAL,
  price_special REAL,
  stock INTEGER,
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cotm_current ON cotm(is_current);

CREATE TABLE newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  unsubscribe_token TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);
CREATE INDEX idx_subs_status ON newsletter_subscribers(status);
