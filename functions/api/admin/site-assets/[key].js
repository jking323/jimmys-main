import { validateMediaPath } from '../../../_shared/media.js';
import { badRequest, json, notFound } from '../../../_shared/response.js';

const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,40}$/;

export async function onRequestPut({ request, params, env }) {
  const key = String(params.key || '').trim();
  if (!KEY_PATTERN.test(key)) return badRequest('Invalid slot key');

  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  if (!body.photo_path) return badRequest('photo_path is required');
  let path;
  try {
    path = validateMediaPath(body.photo_path);
  } catch (err) {
    return badRequest(err.message);
  }

  const alt = body.alt_text ? String(body.alt_text).trim().slice(0, 200) : null;

  await env.DB.prepare(
    `INSERT INTO site_assets (key, photo_path, alt_text)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       photo_path = excluded.photo_path,
       alt_text = excluded.alt_text,
       updated_at = datetime('now')`,
  ).bind(key, path, alt).run();

  const row = await env.DB.prepare(
    'SELECT key, photo_path, alt_text, updated_at FROM site_assets WHERE key = ?',
  ).bind(key).first();
  return json({ asset: row });
}

export async function onRequestDelete({ params, env }) {
  const key = String(params.key || '').trim();
  if (!KEY_PATTERN.test(key)) return badRequest('Invalid slot key');

  const row = await env.DB.prepare('SELECT photo_path FROM site_assets WHERE key = ?').bind(key).first();
  if (!row) return notFound();

  await env.DB.prepare('DELETE FROM site_assets WHERE key = ?').bind(key).run();
  // Best-effort R2 cleanup. If a different slot reuses the same file, that's
  // unusual but the next upload would re-store it.
  if (row.photo_path) {
    await env.MEDIA.delete(row.photo_path).catch(() => {});
  }
  return json({ ok: true });
}
