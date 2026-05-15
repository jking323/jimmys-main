// Helpers for working with event rows + RSVP counts.

export async function eventWithSeats(env, eventRow) {
  if (!eventRow) return null;
  let seats_left = null;
  if (eventRow.seats_total != null) {
    const row = await env.DB.prepare(
      `SELECT COALESCE(SUM(party_size), 0) AS taken
       FROM rsvps WHERE event_id = ? AND status = 'confirmed'`,
    ).bind(eventRow.id).first();
    const taken = Number(row?.taken || 0);
    seats_left = Math.max(0, eventRow.seats_total - taken);
  }
  return { ...eventRow, seats_left };
}

export async function listEventsWithSeats(env, rows) {
  if (!rows.length) return [];
  const ids = rows.filter((r) => r.seats_total != null).map((r) => r.id);
  if (ids.length === 0) return rows.map((r) => ({ ...r, seats_left: null }));

  const placeholders = ids.map(() => '?').join(',');
  const counts = await env.DB.prepare(
    `SELECT event_id, COALESCE(SUM(party_size), 0) AS taken
     FROM rsvps WHERE status='confirmed' AND event_id IN (${placeholders})
     GROUP BY event_id`,
  ).bind(...ids).all();
  const byId = {};
  for (const r of counts.results || []) byId[r.event_id] = Number(r.taken || 0);

  return rows.map((r) => {
    if (r.seats_total == null) return { ...r, seats_left: null };
    return { ...r, seats_left: Math.max(0, r.seats_total - (byId[r.id] || 0)) };
  });
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export function validateEventPayload(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string') errors.push('title is required');
  if (!body.blurb || typeof body.blurb !== 'string') errors.push('blurb is required');
  if (!body.start_at || isNaN(new Date(body.start_at).getTime())) errors.push('start_at must be a valid ISO datetime');
  if (body.end_at && isNaN(new Date(body.end_at).getTime())) errors.push('end_at must be a valid ISO datetime');
  if (body.tag_kind && !['brass', 'leaf', 'ember'].includes(body.tag_kind)) errors.push("tag_kind must be one of: brass, leaf, ember");
  if (body.seats_total != null && (typeof body.seats_total !== 'number' || body.seats_total < 0)) errors.push('seats_total must be a non-negative number');
  return errors;
}
