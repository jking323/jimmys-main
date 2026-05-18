import { contentTypeForPath, MEDIA_LIMITS, validateMediaPath } from '../../_shared/media.js';
import { badRequest, json } from '../../_shared/response.js';

// POST /api/admin/upload?path=cigars/abc123/main.jpg
// Body = raw image bytes. Content-Type can be sent but isn't trusted —
// the path's extension drives the stored Content-Type.
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get('path');
  let path;
  try {
    path = validateMediaPath(rawPath);
  } catch (err) {
    return badRequest(err.message);
  }

  const lengthHeader = request.headers.get('Content-Length');
  if (lengthHeader && Number(lengthHeader) > MEDIA_LIMITS.MAX_BYTES) {
    return badRequest(`Image is too big — max ${(MEDIA_LIMITS.MAX_BYTES / 1024 / 1024).toFixed(0)} MB`);
  }

  const buf = await request.arrayBuffer();
  if (buf.byteLength === 0) return badRequest('Empty body');
  if (buf.byteLength > MEDIA_LIMITS.MAX_BYTES) {
    return badRequest(`Image is too big — max ${(MEDIA_LIMITS.MAX_BYTES / 1024 / 1024).toFixed(0)} MB`);
  }

  const contentType = contentTypeForPath(path);
  await env.MEDIA.put(path, buf, { httpMetadata: { contentType } });

  return json({
    ok: true,
    path,
    url: `/api/media/${path}`,
    bytes: buf.byteLength,
  });
}

// DELETE /api/admin/upload?path=cigars/abc123/main.jpg
export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get('path');
  let path;
  try {
    path = validateMediaPath(rawPath);
  } catch (err) {
    return badRequest(err.message);
  }
  await env.MEDIA.delete(path);
  return json({ ok: true });
}
