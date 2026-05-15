import { badRequest, json, notFound } from '../../../_shared/response.js';

export async function onRequestPost({ request, params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid event id');

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const partySize = Number(body.party_size || 1);
  const phone = body.phone ? String(body.phone).trim() : null;
  const note = body.note ? String(body.note).trim().slice(0, 500) : null;

  if (!name) return badRequest('Name is required');
  if (!email || !email.includes('@')) return badRequest('A valid email is required');
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 12) {
    return badRequest('Party size must be between 1 and 12');
  }

  const event = await env.DB.prepare(
    'SELECT id, seats_total, published FROM events WHERE id = ?',
  ).bind(id).first();
  if (!event || !event.published) return notFound('Event not found');

  if (event.seats_total != null) {
    const taken = await env.DB.prepare(
      "SELECT COALESCE(SUM(party_size),0) AS taken FROM rsvps WHERE event_id = ? AND status='confirmed'",
    ).bind(id).first();
    const available = event.seats_total - Number(taken?.taken || 0);
    if (available < partySize) {
      return badRequest('Sorry, not enough seats left for that party size', {
        seats_left: Math.max(0, available),
      });
    }
  }

  try {
    await env.DB.prepare(
      `INSERT INTO rsvps (event_id, name, email, phone, party_size, note)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(event_id, email) DO UPDATE SET
         name = excluded.name,
         phone = excluded.phone,
         party_size = excluded.party_size,
         note = excluded.note,
         status = 'confirmed'`,
    ).bind(id, name, email, phone, partySize, note).run();
  } catch (err) {
    return badRequest(`Could not save RSVP: ${err.message || 'unknown error'}`);
  }

  return json({ ok: true });
}
