import { generateToken } from '../../_shared/crypto.js';
import { badRequest, json } from '../../_shared/response.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return badRequest('A valid email is required');

  const token = generateToken(16);
  await env.DB.prepare(
    `INSERT INTO newsletter_subscribers (email, status, unsubscribe_token, source)
     VALUES (?, 'active', ?, 'site')
     ON CONFLICT(email) DO UPDATE SET
       status = 'active',
       unsubscribed_at = NULL`,
  ).bind(email, token).run();

  return json({ ok: true });
}
