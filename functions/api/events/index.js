import { listEventsWithSeats } from '../../_shared/events.js';
import { json } from '../../_shared/response.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, slug, title, blurb, start_at, end_at, price_text, seats_total,
            tag, tag_kind, featured, photo_path
     FROM events
     WHERE published = 1
       AND (end_at IS NULL OR datetime(end_at) >= datetime('now'))
       AND datetime(start_at) >= datetime('now', '-1 day')
     ORDER BY start_at ASC
     LIMIT 12`,
  ).all();
  const events = await listEventsWithSeats(env, results || []);
  return json({ events });
}
