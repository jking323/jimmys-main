import { makeSlug } from '../../../_shared/inventory.js';
import { badRequest, json, notFound } from '../../../_shared/response.js';

async function fetchCigar(env, id) {
  return env.DB.prepare('SELECT * FROM cigars WHERE id = ?').bind(id).first();
}

export async function onRequestGet({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await fetchCigar(env, id);
  if (!row) return notFound();
  return json({ cigar: row });
}

export async function onRequestPut({ request, params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');

  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  const current = await fetchCigar(env, id);
  if (!current) return notFound();

  // Only staff-owned fields are accepted here. Import-owned columns stay
  // untouched so the next cron run can't accidentally clobber them.
  const allowed = [
    'display_name', 'brand', 'vitola', 'origin', 'wrapper',
    'strength', 'tasting_notes', 'show_on_site', 'featured', 'sort_order',
  ];
  const sets = [];
  const args = [];
  for (const f of allowed) {
    if (!(f in body)) continue;
    let v = body[f];
    if (f === 'show_on_site' || f === 'featured') v = v ? 1 : 0;
    if (f === 'sort_order' && v === '') v = null;
    sets.push(`${f} = ?`);
    args.push(v ?? null);
  }

  // Slug — derive if missing, prefer staff override.
  if (body.slug != null) {
    const slug = body.slug ? makeSlug(body.slug) : null;
    sets.push('slug = ?');
    args.push(slug);
  } else if (!current.slug && body.display_name) {
    const slug = await uniqueSlug(env, makeSlug(body.display_name), id);
    sets.push('slug = ?');
    args.push(slug);
  }

  if (sets.length === 0) return badRequest('No fields to update');
  sets.push("updated_at = datetime('now')");
  args.push(id);

  await env.DB.prepare(`UPDATE cigars SET ${sets.join(', ')} WHERE id = ?`).bind(...args).run();
  const row = await fetchCigar(env, id);
  return json({ cigar: row });
}

async function uniqueSlug(env, base, excludeId) {
  if (!base) return null;
  let candidate = base;
  let suffix = 1;
  while (true) {
    const hit = await env.DB.prepare(
      'SELECT id FROM cigars WHERE slug = ? AND id != ?',
    ).bind(candidate, excludeId).first();
    if (!hit) return candidate;
    suffix++;
    candidate = `${base}-${suffix}`;
  }
}
