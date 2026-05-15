import { csvToObjects } from '../../_shared/csv.js';
import {
  isTruthyFlag,
  parseFloatOrNull,
  parseInt0,
  pickColumns,
  resolveMapping,
} from '../../_shared/inventory.js';
import { badRequest, json, unauthorized } from '../../_shared/response.js';

const UPSERT_BATCH_SIZE = 25;

function timestamp() {
  return new Date().toISOString().slice(0, 19);
}

export async function onRequestPost({ request, env }) {
  const expected = env.INVENTORY_IMPORT_TOKEN;
  if (!expected) {
    return json({ error: 'INVENTORY_IMPORT_TOKEN is not configured on the server' }, { status: 500 });
  }
  const authz = request.headers.get('Authorization') || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : '';
  if (!token || token !== expected) return unauthorized('Invalid import token');

  const filename = request.headers.get('X-Inventory-Filename') || null;
  const source = (request.headers.get('X-Inventory-Source') || 'cron').slice(0, 20);

  const text = await request.text();
  if (!text || text.length < 10) return badRequest('Empty or unreadable CSV body');

  const { headers, items } = csvToObjects(text);
  if (items.length === 0) return badRequest('CSV contained no data rows');

  const mapping = resolveMapping(env);
  const cols = pickColumns(headers, mapping);
  if (!cols.pos_id) {
    return badRequest(`CSV is missing the "${mapping.pos_id}" column. Use the INVENTORY_CSV_MAPPING env var to override column names.`);
  }
  if (!cols.qty) {
    return badRequest(`CSV is missing a quantity column (looked for "${mapping.qty_prefix}…"). Use INVENTORY_CSV_MAPPING to override.`);
  }

  // Open the import log row first so partial failures are still visible.
  const startRes = await env.DB.prepare(
    `INSERT INTO inventory_imports (source, filename, rows_total, status) VALUES (?, ?, ?, 'pending')`,
  ).bind(source, filename, items.length).run();
  const importId = startRes.meta?.last_row_id;

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let zeroed = 0;
  let lastError = null;

  try {
    // First pass: find which pos_ids already exist (in chunks) so we can split
    // inserts vs updates and report counts accurately.
    const allPosIds = items
      .map((row) => String(row[cols.pos_id] || '').trim())
      .filter(Boolean);
    const existing = new Set();
    for (let i = 0; i < allPosIds.length; i += 50) {
      const chunk = allPosIds.slice(i, i + 50);
      const placeholders = chunk.map(() => '?').join(',');
      const res = await env.DB.prepare(
        `SELECT pos_id FROM cigars WHERE pos_id IN (${placeholders})`,
      ).bind(...chunk).all();
      for (const r of res.results || []) existing.add(r.pos_id);
    }

    // Build upsert statements in batches.
    const now = timestamp();
    let batch = [];

    async function flush() {
      if (!batch.length) return;
      await env.DB.batch(batch);
      batch = [];
    }

    for (const row of items) {
      const posId = String(row[cols.pos_id] || '').trim();
      if (!posId) { skipped++; continue; }

      const sku = cols.sku ? String(row[cols.sku] || '').trim() || null : null;
      const posName = cols.pos_name ? String(row[cols.pos_name] || '').trim() || null : null;
      const posCategory = cols.pos_category ? String(row[cols.pos_category] || '').trim() || null : null;
      const posVendor = cols.pos_vendor ? String(row[cols.pos_vendor] || '').trim() || null : null;
      const price = cols.price ? parseFloatOrNull(row[cols.price]) : null;
      const cost = cols.cost ? parseFloatOrNull(row[cols.cost]) : null;
      const qty = parseInt0(row[cols.qty]);
      const archived = cols.archived ? isTruthyFlag(row[cols.archived]) : false;

      // Square archived rows: keep them tracked but force qty=0.
      const effectiveQty = archived ? 0 : qty;

      if (existing.has(posId)) {
        updated++;
        batch.push(
          env.DB.prepare(
            `UPDATE cigars SET
               sku=?, pos_name=?, pos_category=?, pos_vendor=?,
               qty=?, price=?, cost=?,
               last_seen_import_id=?, last_synced_at=?,
               removed_at=NULL,
               updated_at=datetime('now')
             WHERE pos_id=?`,
          ).bind(sku, posName, posCategory, posVendor, effectiveQty, price, cost, importId, now, posId),
        );
      } else {
        inserted++;
        batch.push(
          env.DB.prepare(
            `INSERT INTO cigars
               (pos_id, sku, pos_name, pos_category, pos_vendor,
                qty, price, cost, last_seen_import_id, last_synced_at, first_seen_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          ).bind(posId, sku, posName, posCategory, posVendor, effectiveQty, price, cost, importId, now),
        );
      }

      if (batch.length >= UPSERT_BATCH_SIZE) await flush();
    }
    await flush();

    // Anything we didn't touch in this import → zero out + mark removed.
    // Skip rows already removed so we don't keep moving removed_at.
    const zeroRes = await env.DB.prepare(
      `UPDATE cigars
         SET qty = 0,
             removed_at = COALESCE(removed_at, datetime('now')),
             updated_at = datetime('now')
       WHERE (last_seen_import_id IS NULL OR last_seen_import_id != ?)
         AND qty > 0`,
    ).bind(importId).run();
    zeroed = zeroRes.meta?.changes ?? 0;

    await env.DB.prepare(
      `UPDATE inventory_imports
         SET status='ok', rows_inserted=?, rows_updated=?, rows_zeroed=?, rows_skipped=?,
             finished_at=datetime('now')
       WHERE id=?`,
    ).bind(inserted, updated, zeroed, skipped, importId).run();
  } catch (err) {
    lastError = err?.message || String(err);
    await env.DB.prepare(
      `UPDATE inventory_imports
         SET status='error', error_text=?, rows_inserted=?, rows_updated=?, rows_zeroed=?, rows_skipped=?,
             finished_at=datetime('now')
       WHERE id=?`,
    ).bind(lastError, inserted, updated, zeroed, skipped, importId).run();
    return json({
      error: 'Import failed mid-way; partial changes were rolled forward, not back.',
      detail: lastError,
      import_id: importId,
      inserted, updated, zeroed, skipped,
    }, { status: 500 });
  }

  return json({
    ok: true,
    import_id: importId,
    rows_total: items.length,
    inserted, updated, zeroed, skipped,
    columns_used: cols,
  });
}
