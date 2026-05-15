import { generateToken } from './crypto.js';

const COOKIE_NAME = 'jimmys_session';
const SESSION_DAYS = 14;

export function getSessionCookieName(env) {
  return env?.SESSION_COOKIE_NAME || COOKIE_NAME;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(v.join('='));
  }
  return out;
}

export function getSessionTokenFromRequest(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  return cookies[getSessionCookieName(env)] || null;
}

export async function getCurrentUser(request, env) {
  const token = getSessionTokenFromRequest(request, env);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT users.id, users.email, users.name, users.role, sessions.expires_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = ?`,
  ).bind(token).first();
  if (!row) return null;
  if (new Date(row.expires_at + 'Z') < new Date()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function createSession(env, userId) {
  const token = generateToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
  ).bind(token, userId, expires.toISOString().slice(0, 19).replace('T', ' ')).run();
  return { token, expires };
}

export async function destroySession(env, token) {
  if (!token) return;
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
}

export function buildSessionCookie(env, token, expires, { clear = false, secure = true } = {}) {
  const name = getSessionCookieName(env);
  const parts = [
    `${name}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (clear) {
    parts.push('Max-Age=0');
  } else if (expires) {
    parts.push(`Expires=${expires.toUTCString()}`);
  }
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function isSecureRequest(request) {
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export async function requireStaff(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) return { error: 'unauthorized', user: null };
  return { user, error: null };
}
