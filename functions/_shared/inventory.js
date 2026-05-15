// POS column mapping. Default targets Square's catalog export.
//
// When you switch POS systems, override these via the INVENTORY_CSV_MAPPING env
// var (a JSON object with the same keys). The qty column is matched by prefix
// because Square names it per-location, e.g. "Current Quantity Jimmy's Cigar
// Lounge".

export const DEFAULT_MAPPING = {
  pos_id: 'Token',
  sku: 'SKU',
  pos_name: 'Item Name',
  display_name_hint: 'Customer-facing Name',
  pos_category: 'Categories',
  pos_vendor: 'Default Vendor Name',
  price: 'Price',
  cost: 'Default Unit Cost',
  qty_prefix: 'Current Quantity',
  archived: 'Archived',
  visibility: 'Square Online Item Visibility',
};

export function resolveMapping(env) {
  if (env?.INVENTORY_CSV_MAPPING) {
    try {
      return { ...DEFAULT_MAPPING, ...JSON.parse(env.INVENTORY_CSV_MAPPING) };
    } catch {
      // fall through to default
    }
  }
  return { ...DEFAULT_MAPPING };
}

export function pickColumns(headers, mapping) {
  const found = {};
  for (const [field, header] of Object.entries(mapping)) {
    if (!header) continue;
    if (field.endsWith('_prefix')) {
      const real = headers.find((h) => h.startsWith(header));
      found[field.replace('_prefix', '')] = real || null;
    } else {
      found[field] = headers.includes(header) ? header : null;
    }
  }
  return found;
}

export function parseInt0(v) {
  if (v == null || v === '') return 0;
  const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseFloatOrNull(v) {
  if (v == null || v === '') return null;
  const n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function isTruthyFlag(v) {
  const s = String(v || '').trim().toUpperCase();
  return s === 'Y' || s === 'YES' || s === 'TRUE' || s === '1';
}

export function makeSlug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
