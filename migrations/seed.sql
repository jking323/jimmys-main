-- Optional seed data — useful in local dev to mirror the wireframe content.
-- Run with: npm run db:seed:local

INSERT OR IGNORE INTO events (slug, title, blurb, start_at, end_at, price_text, seats_total, tag, tag_kind, featured) VALUES
('padron-pairing', 'Padrón Pairing Night',
 'Four cigars from the 1964 series. Three bourbons hand-picked to match. Padrón rep flying in from Miami — bring questions.',
 '2026-05-17T19:00:00', '2026-05-17T22:00:00', '$35', 32, 'Featured', 'brass', 1),
('open-mic', 'Open Mic & Cigars',
 'Local players bring acoustic sets to the back lounge. Sign-up sheet at the bar, first-come-first-strum.',
 '2026-05-24T20:00:00', NULL, 'Free', NULL, 'Weekly favorite', 'leaf', 0),
('newcomer', 'Newcomer Night',
 'Never had a cigar? Start here. A walkthrough on cuts, lights, and the right pace — your first stick is on the house.',
 '2026-06-01T18:00:00', '2026-06-01T21:00:00', 'First one''s free', 16, 'For first-timers', 'ember', 0),
('bourbon-boveda', 'Bourbon & Boveda',
 'A 60-minute class on humidor care: humidity, rotation, the difference between a $20 and a $200 box. Two pours of bourbon included.',
 '2026-06-08T19:00:00', '2026-06-08T21:00:00', '$20', 20, 'Class', 'brass', 0),
('drew-herf', 'Drew Estate Herf',
 'A casual rep-night with raffle prizes, freebies, and the full Liga Privada lineup at member pricing.',
 '2026-06-22T19:00:00', NULL, 'Free · raffle $10', 40, 'Rep night', 'brass', 0);

INSERT OR IGNORE INTO cotm (month, name, italic_word, blurb, quote, quote_by, origin, strength, smoke_time, price_regular, price_special, stock, is_current) VALUES
('2026-05', 'Oliva Serie V Melanio', 'Melanio',
 'A Nicaraguan puro that smokes like a long quiet evening. Cocoa up front, leather in the middle, a slow honeyed finish. If you''ve never had a real Nicaraguan, start here.',
 'The one I keep on the shelf above the register.', 'Jimmy',
 'Nicaragua', 'Full', '~75 min', 13.0, 10.0, 22, 1);
