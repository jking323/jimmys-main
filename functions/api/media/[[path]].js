import { contentTypeForPath, validateMediaPath } from '../../_shared/media.js';
import { badRequest, notFound } from '../../_shared/response.js';

export async function onRequestGet({ params, env, request }) {
  let path;
  try {
    path = validateMediaPath(Array.isArray(params.path) ? params.path.join('/') : params.path);
  } catch (err) {
    return badRequest(err.message);
  }

  const obj = await env.MEDIA.get(path);
  if (!obj) return notFound('No such file');

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', contentTypeForPath(path));
  headers.set('etag', obj.httpEtag);
  // Cache aggressively at the edge — invalidate by changing the path/version.
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400');

  // Honor If-None-Match for cheap revalidation.
  const ifNone = request.headers.get('If-None-Match');
  if (ifNone && ifNone === obj.httpEtag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(obj.body, { headers });
}
