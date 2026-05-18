import { eventWithSeats, validateEventPayload } from '../../../_shared/events.js';
import { badRequest, json, notFound } from '../../../_shared/response.js';

async function getEvent(env, id) {
  return env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
}

export async function onRequestGet({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await getEvent(env, id);
  if (!row) return notFound();
  return json({ event: await eventWithSeats(env, row) });
}

export async function onRequestPut({ request, params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }
  const errors = validateEventPayload(body);
  if (errors.length) return badRequest(errors.join('; '));

  const current = await getEvent(env, id);
  if (!current) return notFound();

  const featured = body.featured ? 1 : 0;
  if (featured && !current.featured) {
    await env.DB.prepare('UPDATE events SET featured = 0').run();
  }

  await env.DB.prepare(
    `UPDATE events SET
       title = ?, blurb = ?, start_at = ?, end_at = ?, price_text = ?,
       seats_total = ?, tag = ?, tag_kind = ?, featured = ?, published = ?,
       photo_path = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).bind(
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
    body.photo_path?.trim() || null,
    id,
  ).run();

  const row = await getEvent(env, id);
  return json({ event: await eventWithSeats(env, row) });
}

export async function onRequestDelete({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await getEvent(env, id);
  if (!row) return notFound();
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
