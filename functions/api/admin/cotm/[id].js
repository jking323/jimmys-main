import { badRequest, json, notFound } from '../../../_shared/response.js';

export async function onRequestDelete({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await env.DB.prepare('SELECT id FROM cotm WHERE id = ?').bind(id).first();
  if (!row) return notFound();
  await env.DB.prepare('DELETE FROM cotm WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
