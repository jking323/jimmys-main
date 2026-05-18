import { badRequest, json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, month, name, italic_word, blurb, quote, quote_by,
            origin, strength, smoke_time, price_regular, price_special, stock,
            is_current, photo_path, created_at, updated_at
     FROM cotm ORDER BY month DESC`,
  ).all();
  return json({ cotm: results || [] });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  const month = String(body.month || '').trim();
  const name = String(body.name || '').trim();
  const blurb = String(body.blurb || '').trim();
  if (!/^\d{4}-\d{2}$/.test(month)) return badRequest('month must be in YYYY-MM format');
  if (!name) return badRequest('name is required');
  if (!blurb) return badRequest('blurb is required');

  const setCurrent = body.set_current ? 1 : 0;
  if (setCurrent) {
    await env.DB.prepare('UPDATE cotm SET is_current = 0').run();
  }

  await env.DB.prepare(
    `INSERT INTO cotm (month, name, italic_word, blurb, quote, quote_by,
                       origin, strength, smoke_time, price_regular, price_special,
                       stock, is_current, photo_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(month) DO UPDATE SET
       name=excluded.name, italic_word=excluded.italic_word, blurb=excluded.blurb,
       quote=excluded.quote, quote_by=excluded.quote_by, origin=excluded.origin,
       strength=excluded.strength, smoke_time=excluded.smoke_time,
       price_regular=excluded.price_regular, price_special=excluded.price_special,
       stock=excluded.stock, photo_path=excluded.photo_path,
       is_current=CASE WHEN ?>0 THEN 1 ELSE cotm.is_current END,
       updated_at=datetime('now')`,
  ).bind(
    month,
    name,
    body.italic_word?.trim() || null,
    blurb,
    body.quote?.trim() || null,
    body.quote_by?.trim() || 'Jimmy',
    body.origin?.trim() || null,
    body.strength?.trim() || null,
    body.smoke_time?.trim() || null,
    body.price_regular == null ? null : Number(body.price_regular),
    body.price_special == null ? null : Number(body.price_special),
    body.stock == null ? null : Number(body.stock),
    setCurrent,
    body.photo_path?.trim() || null,
    setCurrent,
  ).run();

  const row = await env.DB.prepare('SELECT * FROM cotm WHERE month = ?').bind(month).first();
  return json({ cotm: row });
}
