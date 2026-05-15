import { json } from '../../../_shared/response.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, source, filename, rows_total, rows_inserted, rows_updated,
            rows_zeroed, rows_skipped, status, error_text, started_at, finished_at
       FROM inventory_imports
      ORDER BY started_at DESC
      LIMIT 50`,
  ).all();
  return json({ imports: results || [] });
}
