import { badRequest, json, notFound } from '../../../../_shared/response.js';

export async function onRequestPost({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await env.DB.prepare('SELECT id FROM cotm WHERE id = ?').bind(id).first();
  if (!row) return notFound();
  await env.DB.batch([
    env.DB.prepare('UPDATE cotm SET is_current = 0'),
    env.DB.prepare('UPDATE cotm SET is_current = 1 WHERE id = ?').bind(id),
  ]);
  return json({ ok: true });
}
