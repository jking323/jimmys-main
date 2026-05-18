// R2 helpers + path validation.

const ALLOWED_PREFIXES = ['cigars/', 'events/', 'cotm/', 'site/'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export const MEDIA_LIMITS = { MAX_BYTES };

// Reject anything traversal-ish; require one of our prefixes; require a known
// image extension. Returns the cleaned path or throws.
export function validateMediaPath(path) {
  const p = String(path || '').replace(/^\/+/, '');
  if (!p) throw new Error('Path is required');
  if (p.includes('..') || p.includes('//') || p.includes('\\')) throw new Error('Invalid path');
  if (!/^[\w./-]+$/.test(p)) throw new Error('Path may only contain letters, numbers, dot, slash, hyphen, underscore');
  if (!ALLOWED_PREFIXES.some((pre) => p.startsWith(pre))) {
    throw new Error(`Path must start with one of: ${ALLOWED_PREFIXES.join(', ')}`);
  }
  const dot = p.lastIndexOf('.');
  if (dot < 0) throw new Error('Path must have a file extension');
  const ext = p.slice(dot).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error(`Extension must be one of: ${ALLOWED_EXT.join(', ')}`);
  }
  return p;
}

const CONTENT_TYPE_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

export function contentTypeForPath(path) {
  const dot = path.lastIndexOf('.');
  if (dot < 0) return 'application/octet-stream';
  return CONTENT_TYPE_BY_EXT[path.slice(dot).toLowerCase()] || 'application/octet-stream';
}
