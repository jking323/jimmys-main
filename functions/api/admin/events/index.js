import { listEventsWithSeats, slugify, validateEventPayload } from '../../../_shared/events.js';
import { badRequest, json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, slug, title, blurb, start_at, end_at, price_text, seats_total,
            tag, tag_kind, featured, published, created_at, updated_at
     FROM events
     ORDER BY start_at DESC`,
  ).all();
  const events = await listEventsWithSeats(env, results || []);
  return json({ events });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }
  const errors = validateEventPayload(body);
  if (errors.length) return badRequest(errors.join('; '));

  const baseSlug = body.slug ? slugify(body.slug) : slugify(body.title);
  let slug = baseSlug || `event-${Date.now()}`;
  // Ensure unique slug
  let suffix = 1;
  while (true) {
    const exists = await env.DB.prepare('SELECT id FROM events WHERE slug = ?').bind(slug).first();
    if (!exists) break;
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  const featured = body.featured ? 1 : 0;
  if (featured) {
    await env.DB.prepare('UPDATE events SET featured = 0').run();
  }

  const res = await env.DB.prepare(
    `INSERT INTO events (slug, title, blurb, start_at, end_at, price_text,
                         seats_total, tag, tag_kind, featured, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    slug,
    body.title.trim(),
    body.blurb.trim(),
    new Date(body.start_at).toISOString().slice(0, 19),
    body.end_at ? new Date(body.end_at).toISOString().slice(0, 19) : null,
    body.price_text?.trim() || 'Free',
    body.seats_total ?? null,
    body.tag?.trim() || null,
    body.tag_kind || null,
    featured,
    body.published === false ? 0 : 1,
  ).run();

  const id = res.meta?.last_row_id;
  const row = await env.DB.prepare(`SELECT * FROM events WHERE id = ?`).bind(id).first();
  return json({ event: { ...row, seats_left: row.seats_total } });
}
