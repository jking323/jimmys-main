import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso.includes('Z') ? iso : iso + 'Z');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function duration(start, end) {
  if (!start || !end) return '—';
  const s = new Date(start.includes('Z') ? start : start + 'Z');
  const e = new Date(end.includes('Z') ? end : end + 'Z');
  const ms = e.getTime() - s.getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

export default function Imports() {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.imports()
      .then((d) => setImports(d.imports || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Behind the counter</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>POS sync history</h1>
          <p className="mute" style={{ marginTop: 6, fontSize: 14 }}>The 50 most recent runs. Useful when the stock count looks off.</p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--ember)' }}>{error}</div>}
      {loading && <div className="mute">Loading…</div>}

      {!loading && imports.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <p className="mute">No imports yet. Once your cron job POSTs a CSV, runs will show up here.</p>
        </div>
      )}

      {!loading && imports.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Source</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>New</th>
                <th style={{ textAlign: 'right' }}>Updated</th>
                <th style={{ textAlign: 'right' }}>Zeroed</th>
                <th style={{ textAlign: 'right' }}>Skipped</th>
                <th style={{ textAlign: 'right' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((r) => (
                <tr key={r.id} title={r.error_text || ''}>
                  <td className="mono" style={{ fontSize: 12 }}>{fmtDateTime(r.started_at)}</td>
                  <td>{r.source}</td>
                  <td>
                    <span className={`chip ${r.status === 'ok' ? 'chip-leaf' : r.status === 'error' ? 'chip-ember' : ''}`} style={{ fontSize: 10 }}>
                      {r.status}
                    </span>
                    {r.error_text && (
                      <div className="mute" style={{ fontSize: 12, marginTop: 4, maxWidth: 320, whiteSpace: 'normal' }}>{r.error_text}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>{r.rows_total ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{r.rows_inserted ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{r.rows_updated ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{r.rows_zeroed ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{r.rows_skipped ?? '—'}</td>
                  <td style={{ textAlign: 'right' }} className="mute">{duration(r.started_at, r.finished_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
