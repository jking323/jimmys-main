import {
  buildSessionCookie,
  destroySession,
  getSessionTokenFromRequest,
  isSecureRequest,
} from '../../_shared/auth.js';
import { json } from '../../_shared/response.js';

export async function onRequestPost({ request, env }) {
  const token = getSessionTokenFromRequest(request, env);
  await destroySession(env, token);
  const cookie = buildSessionCookie(env, '', null, { clear: true, secure: isSecureRequest(request) });
  return json({ ok: true }, { headers: { 'Set-Cookie': cookie } });
}
