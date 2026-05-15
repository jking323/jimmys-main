import { badRequest, json, notFound } from '../../../../_shared/response.js';

export async function onRequestDelete({ params, env }) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return badRequest('Invalid id');
  const row = await env.DB.prepare(
    'SELECT id FROM newsletter_subscribers WHERE id = ?',
  ).bind(id).first();
  if (!row) return notFound();
  await env.DB.prepare(
    "UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?",
  ).bind(id).run();
  return json({ ok: true });
}
