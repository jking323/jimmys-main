import { getCurrentUser } from '../../_shared/auth.js';
import { json, unauthorized } from '../../_shared/response.js';

export async function onRequestGet({ request, env }) {
  const user = await getCurrentUser(request, env);
  if (!user) return unauthorized();
  return json({ user });
}
