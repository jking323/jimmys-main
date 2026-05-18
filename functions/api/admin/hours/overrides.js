import { validateHHMM } from '../../../_shared/hours.js';
import { badRequest, json, notFound } from '../../../_shared/response.js';

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  const date = String(body.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return badRequest('date must be YYYY-MM-DD');

  const closed = body.closed ? 1 : 0;
  let openAt = null, closeAt = null;
  if (!closed) {
    const o = validateHHMM(body.open_at);
    const c = validateHHMM(body.close_at);
    if (o === false || c === false) return badRequest('open_at / close_at must be HH:MM');
    if (!o || !c) return badRequest('open_at and close_at required when not closed');
    openAt = o; closeAt = c;
  }
  const note = body.note ? String(body.note).trim().slice(0, 200) : null;

  await env.DB.prepare(
    `INSERT INTO hours_overrides (date, open_at, close_at, closed, note)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       open_at=excluded.open_at, close_at=excluded.close_at, closed=excluded.closed, note=excluded.note`,
  ).bind(date, openAt, closeAt, closed, note).run();

  const row = await env.DB.prepare('SELECT * FROM hours_overrides WHERE date = ?').bind(date).first();
  return json({ override: row });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  if (!date) return badRequest('?date= required');
  const existing = await env.DB.prepare('SELECT date FROM hours_overrides WHERE date = ?').bind(date).first();
  if (!existing) return notFound();
  await env.DB.prepare('DELETE FROM hours_overrides WHERE date = ?').bind(date).run();
  return json({ ok: true });
}
