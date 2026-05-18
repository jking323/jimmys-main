import { eventWithSeats } from '../../_shared/events.js';
import { json, notFound } from '../../_shared/response.js';

export async function onRequestGet({ params, env }) {
  const id = parseInt(params.id, 10);
  let row;
  if (!Number.isNaN(id)) {
    row = await env.DB.prepare(
      `SELECT id, slug, title, blurb, start_at, end_at, price_text, seats_total,
              tag, tag_kind, featured, photo_path
       FROM events
       WHERE id = ? AND published = 1`,
    ).bind(id).first();
  } else {
    row = await env.DB.prepare(
      `SELECT id, slug, title, blurb, start_at, end_at, price_text, seats_total,
              tag, tag_kind, featured, photo_path
       FROM events
       WHERE slug = ? AND published = 1`,
    ).bind(params.id).first();
  }
  if (!row) return notFound('Event not found');
  return json({ event: await eventWithSeats(env, row) });
}
