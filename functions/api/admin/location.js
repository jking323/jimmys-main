import { badRequest, json } from '../../_shared/response.js';

const ALLOWED_STYLES = new Set([
  'stamen_toner_lite',
  'stamen_toner',
  'stamen_terrain',
  'stamen_watercolor',
  'alidade_smooth',
  'alidade_smooth_dark',
  'outdoors',
  'osm_bright',
]);

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    `SELECT lat, lng, zoom, label, map_style, stadia_api_key, updated_at
     FROM business_location WHERE id = 1`,
  ).first();
  return json({ location: row || null });
}

export async function onRequestPut({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const zoom = Number(body.zoom);
  const label = body.label ? String(body.label).trim().slice(0, 120) : null;
  const style = body.map_style ? String(body.map_style).trim() : 'stamen_toner_lite';
  const key = body.stadia_api_key === '' ? null
            : body.stadia_api_key == null ? undefined
            : String(body.stadia_api_key).trim();

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return badRequest('lat must be between -90 and 90');
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return badRequest('lng must be between -180 and 180');
  if (!Number.isInteger(zoom) || zoom < 1 || zoom > 20) return badRequest('zoom must be an integer 1–20');
  if (!ALLOWED_STYLES.has(style)) return badRequest('Unknown map_style');

  // Only touch stadia_api_key if it was sent in the body.
  const existing = await env.DB.prepare('SELECT stadia_api_key FROM business_location WHERE id = 1').first();
  const nextKey = key === undefined ? (existing?.stadia_api_key ?? null) : key;

  await env.DB.prepare(
    `INSERT INTO business_location (id, lat, lng, zoom, label, map_style, stadia_api_key, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       lat=excluded.lat, lng=excluded.lng, zoom=excluded.zoom,
       label=excluded.label, map_style=excluded.map_style,
       stadia_api_key=excluded.stadia_api_key, updated_at=datetime('now')`,
  ).bind(lat, lng, zoom, label, style, nextKey).run();

  const row = await env.DB.prepare(
    `SELECT lat, lng, zoom, label, map_style, stadia_api_key, updated_at
     FROM business_location WHERE id = 1`,
  ).first();
  return json({ location: row });
}
