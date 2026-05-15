export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function badRequest(message, extra = {}) {
  return json({ error: message, ...extra }, { status: 400 });
}

export function unauthorized(message = 'Not signed in') {
  return json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Not allowed') {
  return json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found') {
  return json({ error: message }, { status: 404 });
}

export function serverError(message = 'Something went wrong') {
  return json({ error: message }, { status: 500 });
}

export function methodNotAllowed(allowed = []) {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: allowed.join(', ') },
  });
}
