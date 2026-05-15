import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'shown', label: 'On the site' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'curated_pending', label: 'Needs review' },
  { id: 'removed', label: 'Removed from POS' },
];

function fmtPrice(p) {
  if (p == null) return '—';
  return Number(p) % 1 === 0 ? `$${Number(p).toFixed(0)}` : `$${Number(p).toFixed(2)}`;
}

export default function Cigars() {
  const [data, setData] = useState({ cigars: [], summary: null });
  const [filter, setFilter] = useState('curated_pending');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await adminApi.cigars({ filter, q });
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const onSearchSubmit = (e) => { e.preventDefault(); load(); };
  const s = data.summary;

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">From the POS</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>The humidor</h1>
          {s && (
            <p className="mute" style={{ marginTop: 6, fontSize: 14 }}>
              {s.shown ?? 0} on the site · {s.hidden ?? 0} hidden · {Number(s.total_stock ?? 0).toLocaleString()} cigars in stock
            </p>
          )}
        </div>
        <Link to="/admin/inventory" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          Import history →
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`chip ${filter === f.id ? 'chip-fill' : ''}`}
            style={{ cursor: 'pointer', padding: '8px 14px', fontSize: 13 }}
          >
            {f.label}
          </button>
        ))}
        <form onSubmit={onSearchSubmit} className="field" style={{ flex: 1, minWidth: 240, marginLeft: 'auto' }}>
          <input placeholder="Search name, SKU, brand…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>

      {error && <div style={{ color: 'var(--ember)' }}>{error}</div>}
      {loading && <div className="mute">Loading…</div>}

      {!loading && data.cigars.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <p className="mute" style={{ marginBottom: 6 }}>No cigars match this filter.</p>
          <p className="mute" style={{ fontSize: 13 }}>Run the POS sync, then come back.</p>
        </div>
      )}

      {!loading && data.cigars.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Cigar</th>
                <th>Brand / Vendor</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th>On site</th>
                <th>SKU</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.cigars.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin/cigars/${c.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                      <div style={{ fontWeight: 500 }}>
                        {c.display_name || c.pos_name || <span className="mute">— untitled —</span>}
                        {c.featured ? <span className="chip chip-brass" style={{ marginLeft: 8, fontSize: 10 }}>Featured</span> : null}
                      </div>
                      {c.display_name && c.pos_name && c.display_name !== c.pos_name && (
                        <div className="mute" style={{ fontSize: 12 }}>POS: {c.pos_name}</div>
                      )}
                    </Link>
                  </td>
                  <td className="mute" style={{ fontSize: 13 }}>{c.brand || c.pos_vendor || c.pos_category || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={c.qty <= 3 ? 'ember' : c.qty <= 8 ? 'brass' : ''}>{c.qty}</span>
                    {c.removed_at && <div className="mute" style={{ fontSize: 11 }}>removed</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmtPrice(c.price)}</td>
                  <td>
                    <span className={`chip ${c.show_on_site ? 'chip-leaf' : ''}`} style={{ fontSize: 10 }}>
                      {c.show_on_site ? 'Shown' : 'Hidden'}
                    </span>
                  </td>
                  <td className="mono mute" style={{ fontSize: 12 }}>{c.sku || c.pos_id}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/cigars/${c.id}`} style={{ color: 'var(--brass)', fontSize: 13, textDecoration: 'none' }}>Edit →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
