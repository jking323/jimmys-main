import { json } from '../../../_shared/response.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format');

  const { results } = await env.DB.prepare(
    `SELECT id, email, status, source, created_at, unsubscribed_at
     FROM newsletter_subscribers
     ORDER BY created_at DESC`,
  ).all();
  const rows = results || [];

  const active = rows.filter((r) => r.status === 'active').length;
  const unsubscribed = rows.filter((r) => r.status !== 'active').length;

  if (format === 'csv') {
    const lines = ['email,status,source,created_at,unsubscribed_at'];
    for (const r of rows) {
      const cells = [r.email, r.status, r.source || '', r.created_at, r.unsubscribed_at || ''];
      lines.push(cells.map((s) => (/[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : s)).join(','));
    }
    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    });
  }

  return json({ subscribers: rows, active_count: active, unsubscribed_count: unsubscribed });
}
