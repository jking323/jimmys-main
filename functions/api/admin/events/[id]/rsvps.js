import { badRequest, json } from '../../../../_shared/response.js';

export async function onRequestGet({ params, env, request }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');

  const event = await env.DB.prepare(
    'SELECT id, title, start_at, seats_total FROM events WHERE id = ?',
  ).bind(id).first();
  if (!event) return badRequest('Event not found');

  const { results } = await env.DB.prepare(
    `SELECT id, name, email, phone, party_size, note, status, created_at
     FROM rsvps WHERE event_id = ? ORDER BY created_at ASC`,
  ).bind(id).all();

  const rsvps = results || [];
  const total = rsvps
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + (r.party_size || 0), 0);

  const url = new URL(request.url);
  if (url.searchParams.get('format') === 'csv') {
    const header = 'Name,Email,Phone,Party,Status,Note,Created';
    const escape = (s) => {
      if (s == null) return '';
      const str = String(s);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = rsvps.map((r) =>
      [r.name, r.email, r.phone, r.party_size, r.status, r.note, r.created_at].map(escape).join(','),
    );
    return new Response([header, ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rsvps-event-${id}.csv"`,
      },
    });
  }

  return json({ event, rsvps, confirmed_count: total });
}

export async function onRequestPost({ request, params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const partySize = Number(body.party_size || 1);
  if (!name || !email || !email.includes('@')) return badRequest('Name and valid email required');

  await env.DB.prepare(
    `INSERT INTO rsvps (event_id, name, email, party_size, status)
     VALUES (?, ?, ?, ?, 'confirmed')
     ON CONFLICT(event_id, email) DO UPDATE SET name=excluded.name, party_size=excluded.party_size, status='confirmed'`,
  ).bind(id, name, email, partySize).run();

  return json({ ok: true });
}
