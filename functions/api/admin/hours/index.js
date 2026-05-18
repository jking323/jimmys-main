import { evaluateHours, validateHHMM } from '../../../_shared/hours.js';
import { badRequest, json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const hours = await env.DB.prepare(
    `SELECT day_of_week, open_at, close_at, closed FROM business_hours ORDER BY day_of_week`,
  ).all();
  const overrides = await env.DB.prepare(
    `SELECT date, open_at, close_at, closed, note FROM hours_overrides
      WHERE date >= date('now', '-30 day')
      ORDER BY date ASC`,
  ).all();
  const status = evaluateHours(hours.results || [], overrides.results || []);
  return json({ hours: hours.results || [], overrides: overrides.results || [], status });
}

export async function onRequestPut({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }
  if (!Array.isArray(body.hours)) return badRequest('Expected { hours: [...] }');

  const errors = [];
  const cleaned = [];
  for (const row of body.hours) {
    const dow = Number(row.day_of_week);
    if (!Number.isInteger(dow) || dow < 0 || dow > 6) {
      errors.push(`Invalid day_of_week: ${row.day_of_week}`);
      continue;
    }
    const closed = row.closed ? 1 : 0;
    let openAt = null, closeAt = null;
    if (!closed) {
      const o = validateHHMM(row.open_at);
      const c = validateHHMM(row.close_at);
      if (o === false) { errors.push(`Day ${dow}: open_at must be HH:MM`); continue; }
      if (c === false) { errors.push(`Day ${dow}: close_at must be HH:MM`); continue; }
      if (!o || !c) { errors.push(`Day ${dow}: open and close required when not closed`); continue; }
      openAt = o; closeAt = c;
    }
    cleaned.push({ dow, openAt, closeAt, closed });
  }
  if (errors.length) return badRequest(errors.join('; '));

  await env.DB.batch(
    cleaned.map((r) =>
      env.DB.prepare(
        `INSERT INTO business_hours (day_of_week, open_at, close_at, closed, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(day_of_week) DO UPDATE SET
           open_at=excluded.open_at, close_at=excluded.close_at, closed=excluded.closed,
           updated_at=datetime('now')`,
      ).bind(r.dow, r.openAt, r.closeAt, r.closed),
    ),
  );

  const hours = await env.DB.prepare(
    `SELECT day_of_week, open_at, close_at, closed FROM business_hours ORDER BY day_of_week`,
  ).all();
  return json({ hours: hours.results || [] });
}
