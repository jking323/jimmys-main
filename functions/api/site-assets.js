import { json } from '../_shared/response.js';

// Public — returns { assets: { 'hero-lounge': { photo_path, alt_text }, ... } }
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT key, photo_path, alt_text FROM site_assets',
  ).all();
  const assets = {};
  for (const row of results || []) {
    assets[row.key] = { photo_path: row.photo_path, alt_text: row.alt_text };
  }
  return new Response(JSON.stringify({ assets }), {
    headers: {
      'Content-Type': 'application/json',
      // Photos change rarely; let browsers + edge cache for a minute.
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}
