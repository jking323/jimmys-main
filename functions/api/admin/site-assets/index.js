import { json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT key, photo_path, alt_text, updated_at FROM site_assets',
  ).all();
  const assets = {};
  for (const row of results || []) {
    assets[row.key] = {
      photo_path: row.photo_path,
      alt_text: row.alt_text,
      updated_at: row.updated_at,
    };
  }
  return json({ assets });
}
