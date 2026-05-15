import { json } from '../_shared/response.js';

export async function onRequestGet({ env }) {
  const featured = await env.DB.prepare(
    `SELECT id, sku, pos_name, display_name, brand, vitola, origin, wrapper,
            strength, tasting_notes, qty, price, slug, featured, last_synced_at
       FROM cigars
      WHERE show_on_site = 1 AND qty > 0
      ORDER BY featured DESC, COALESCE(sort_order, 999999) ASC, qty ASC
      LIMIT 12`,
  ).all();

  const totals = await env.DB.prepare(
    `SELECT
        COALESCE(SUM(qty), 0)            AS total_stock,
        COUNT(*)                          AS sku_count,
        COUNT(CASE WHEN qty > 0 THEN 1 END) AS in_stock_count,
        MAX(last_synced_at)               AS last_synced_at
       FROM cigars
      WHERE removed_at IS NULL`,
  ).first();

  return json({
    cigars: featured.results || [],
    totals: totals || { total_stock: 0, sku_count: 0, in_stock_count: 0, last_synced_at: null },
  });
}
