import { json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    `SELECT * FROM cotm WHERE is_current = 1 ORDER BY month DESC LIMIT 1`,
  ).first();
  return json({ cotm: row || null });
}
