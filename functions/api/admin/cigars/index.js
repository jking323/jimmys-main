import { json } from '../../../_shared/response.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const filter = url.searchParams.get('filter') || 'all'; // all | shown | hidden | curated_pending | removed

  const where = [];
  const args = [];

  if (filter === 'shown') where.push('show_on_site = 1');
  else if (filter === 'hidden') where.push('show_on_site = 0 AND removed_at IS NULL');
  else if (filter === 'curated_pending') where.push('show_on_site = 0 AND removed_at IS NULL AND qty > 0');
  else if (filter === 'removed') where.push('removed_at IS NOT NULL');
  else where.push('1 = 1');

  if (q) {
    where.push('(pos_name LIKE ? OR display_name LIKE ? OR sku LIKE ? OR brand LIKE ? OR pos_vendor LIKE ?)');
    const like = `%${q}%`;
    args.push(like, like, like, like, like);
  }

  const sql = `SELECT id, pos_id, sku, pos_name, display_name, brand, pos_vendor, pos_category,
                      vitola, origin, wrapper, strength, tasting_notes,
                      qty, price, cost, show_on_site, featured, sort_order,
                      slug, last_synced_at, removed_at, first_seen_at, updated_at
                 FROM cigars
                WHERE ${where.join(' AND ')}
                ORDER BY show_on_site DESC, featured DESC, qty DESC
                LIMIT 500`;

  const result = await env.DB.prepare(sql).bind(...args).all();
  const summary = await env.DB.prepare(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(qty), 0) AS total_stock,
       SUM(CASE WHEN show_on_site = 1 THEN 1 ELSE 0 END) AS shown,
       SUM(CASE WHEN show_on_site = 0 AND removed_at IS NULL THEN 1 ELSE 0 END) AS hidden,
       SUM(CASE WHEN removed_at IS NOT NULL THEN 1 ELSE 0 END) AS removed,
       MAX(last_synced_at) AS last_synced_at
     FROM cigars`,
  ).first();

  return json({ cigars: result.results || [], summary });
}
