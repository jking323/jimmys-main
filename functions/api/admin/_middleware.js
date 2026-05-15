import { getCurrentUser } from '../../_shared/auth.js';
import { unauthorized } from '../../_shared/response.js';

export async function onRequest(context) {
  const user = await getCurrentUser(context.request, context.env);
  if (!user) return unauthorized();
  context.data.user = user;
  return context.next();
}
