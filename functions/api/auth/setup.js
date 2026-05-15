// One-time first-staff-account bootstrap. Only works while the users table is
// empty — after that, every subsequent call returns 403. Lets the operator
// create the very first admin via the browser instead of fighting wrangler
// d1 execute on Windows.

import {
  buildSessionCookie,
  createSession,
  isSecureRequest,
} from '../../_shared/auth.js';
import { generateSalt, hashPassword } from '../../_shared/crypto.js';
import { badRequest, forbidden, json } from '../../_shared/response.js';

async function userCount(env) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  return Number(row?.n || 0);
}

export async function onRequestGet({ env }) {
  const n = await userCount(env);
  return json({ needs_setup: n === 0, user_count: n });
}

export async function onRequestPost({ request, env }) {
  if ((await userCount(env)) > 0) {
    return forbidden('Setup is already complete. Sign in instead.');
  }

  let body;
  try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }

  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const password = String(body.password || '');

  if (!email || !email.includes('@')) return badRequest('A valid email is required.');
  if (!name) return badRequest('A display name is required.');
  if (!password || password.length < 6) return badRequest('Password must be at least 6 characters.');

  // Re-check after validation in case two browsers raced.
  if ((await userCount(env)) > 0) {
    return forbidden('Another browser created the first account a moment ago. Sign in instead.');
  }

  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  const res = await env.DB.prepare(
    `INSERT INTO users (email, password_hash, password_salt, name, role)
     VALUES (?, ?, ?, ?, 'admin')`,
  ).bind(email, hash, salt, name).run();

  const userId = res.meta?.last_row_id;
  const { token, expires } = await createSession(env, userId);
  const cookie = buildSessionCookie(env, token, expires, { secure: isSecureRequest(request) });

  return json(
    { user: { id: userId, email, name, role: 'admin' } },
    { headers: { 'Set-Cookie': cookie } },
  );
}
