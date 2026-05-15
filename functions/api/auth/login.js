import { buildSessionCookie, createSession, isSecureRequest } from '../../_shared/auth.js';
import { verifyPassword } from '../../_shared/crypto.js';
import { badRequest, json, unauthorized } from '../../_shared/response.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON');
  }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return badRequest('Email and password required');

  const user = await env.DB.prepare(
    'SELECT id, email, name, role, password_hash, password_salt FROM users WHERE email = ?',
  ).bind(email).first();

  if (!user) return unauthorized('Wrong email or password');
  const ok = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) return unauthorized('Wrong email or password');

  const { token, expires } = await createSession(env, user.id);
  await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();

  const cookie = buildSessionCookie(env, token, expires, { secure: isSecureRequest(request) });
  return json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { headers: { 'Set-Cookie': cookie } },
  );
}
