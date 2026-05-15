import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../lib/api.js';

export default function Newsletter() {
  const [data, setData] = useState({ subscribers: [], active_count: 0, unsubscribed_count: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await adminApi.subscribers();
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('Mark this email as unsubscribed?')) return;
    await adminApi.removeSubscriber(id);
    load();
  }

  const filtered = useMemo(() => {
    let rows = data.subscribers || [];
    if (!showAll) rows = rows.filter((r) => r.status === 'active');
    if (filter) {
      const f = filter.toLowerCase();
      rows = rows.filter((r) => r.email.toLowerCase().includes(f));
    }
    return rows;
  }, [data, filter, showAll]);

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">The list</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Newsletter</h1>
          <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>
            {data.active_count} active · {data.unsubscribed_count} unsubscribed
          </p>
        </div>
        <a href="/api/admin/newsletter/subscribers?format=csv" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          Export CSV <span>↓</span>
        </a>
      </div>

      {error && <div style={{ color: 'var(--ember)' }}>{error}</div>}
      {loading && <div className="mute">Loading…</div>}

      {!loading && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="field" style={{ flex: 1, minWidth: 240 }}>
              <input placeholder="Filter by email…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              <span>Show unsubscribed too</span>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <p className="mute">No subscribers match.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Subscribed</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.email}</td>
                      <td className="mute">{r.source || '—'}</td>
                      <td className="mute" style={{ fontSize: 13 }}>
                        {new Date(r.created_at + 'Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span className={`chip ${r.status === 'active' ? 'chip-leaf' : 'chip-ember'}`} style={{ fontSize: 10 }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {r.status === 'active' && (
                          <button type="button" onClick={() => remove(r.id)} style={{ background: 'transparent', border: 0, color: 'var(--ember)', cursor: 'pointer', fontSize: 13 }}>
                            Unsubscribe
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
