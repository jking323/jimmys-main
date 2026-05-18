import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import PhotoUpload from '../components/PhotoUpload.jsx';

function fmtPrice(p) {
  if (p == null) return '—';
  return Number(p) % 1 === 0 ? `$${Number(p).toFixed(0)}` : `$${Number(p).toFixed(2)}`;
}

function fmtSyncedAt(iso) {
  if (!iso) return 'never';
  const d = new Date(iso.includes('Z') ? iso : iso + 'Z');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const STAFF_FIELDS = ['display_name', 'brand', 'vitola', 'origin', 'wrapper', 'strength', 'tasting_notes', 'sort_order', 'slug', 'show_on_site', 'featured'];

export default function CigarEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cigar, setCigar] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.cigar(id)
      .then(({ cigar }) => {
        setCigar(cigar);
        const initial = {};
        STAFF_FIELDS.forEach((f) => {
          initial[f] = cigar[f] ?? (f === 'show_on_site' || f === 'featured' ? false : '');
        });
        initial.show_on_site = !!cigar.show_on_site;
        initial.featured = !!cigar.featured;
        setForm(initial);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function bind(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = { ...form };
    if (payload.sort_order === '') payload.sort_order = null;
    else if (payload.sort_order != null) payload.sort_order = Number(payload.sort_order);
    try {
      const { cigar } = await adminApi.updateCigar(id, payload);
      setCigar(cigar);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mute">Loading…</div>;
  if (error && !cigar) return <div style={{ color: 'var(--ember)' }}>{error}</div>;
  if (!cigar) return null;

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">{cigar.brand || cigar.pos_vendor || 'Cigar'}</div>
          <h1 className="h1" style={{ fontSize: 36, marginTop: 8 }}>
            {cigar.display_name || cigar.pos_name || '— untitled —'}
          </h1>
          <p className="mute" style={{ marginTop: 6, fontSize: 13 }}>
            SKU {cigar.sku || cigar.pos_id} · synced {fmtSyncedAt(cigar.last_synced_at)}
            {cigar.removed_at ? ' · removed from POS' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/cigars" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>← Back</Link>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            {saving ? 'Saving…' : 'Save →'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--ember)', marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="cigar-edit-grid">
        <div className="card" style={{ padding: 28 }}>
          <h2 className="h3" style={{ marginBottom: 18 }}>How it shows on the site</h2>
          <div className="form-grid">
            <div className="field-block full">
              <label>Display name</label>
              <input value={form.display_name || ''} onChange={bind('display_name')} placeholder={cigar.pos_name || ''} />
            </div>
            <div className="field-block">
              <label>Brand</label>
              <input value={form.brand || ''} onChange={bind('brand')} placeholder={cigar.pos_vendor || ''} />
            </div>
            <div className="field-block">
              <label>Vitola / size</label>
              <input value={form.vitola || ''} onChange={bind('vitola')} placeholder="Robusto · 5×52" />
            </div>
            <div className="field-block">
              <label>Origin</label>
              <input value={form.origin || ''} onChange={bind('origin')} placeholder="Nicaragua" />
            </div>
            <div className="field-block">
              <label>Wrapper</label>
              <input value={form.wrapper || ''} onChange={bind('wrapper')} placeholder="Habano" />
            </div>
            <div className="field-block">
              <label>Strength</label>
              <select value={form.strength || ''} onChange={bind('strength')}>
                <option value="">— pick —</option>
                <option>Mild</option>
                <option>Medium</option>
                <option>Full</option>
              </select>
            </div>
            <div className="field-block">
              <label>Slug (URL)</label>
              <input value={form.slug || ''} onChange={bind('slug')} placeholder="auto from display name" />
            </div>
            <div className="field-block full">
              <label>Tasting notes</label>
              <input value={form.tasting_notes || ''} onChange={bind('tasting_notes')} placeholder="Leather · Cocoa · Honey" />
            </div>
            <div className="field-block">
              <label>Sort order (lower = first)</label>
              <input type="number" value={form.sort_order ?? ''} onChange={bind('sort_order')} />
            </div>
            <div className="full" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.show_on_site} onChange={bind('show_on_site')} />
                <span>Show on the public humidor</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.featured} onChange={bind('featured')} />
                <span>Feature it (pin to the top)</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow brass" style={{ marginBottom: 12 }}>Photo</div>
          <PhotoUpload
            pathPrefix={`cigars/${cigar.pos_id}/main`}
            currentPath={cigar.photo_path}
            version={cigar.updated_at}
            hint="Square / box shot, 1600px wide JPEG works well."
            onUploaded={async (path) => {
              const res = await adminApi.updateCigar(id, { photo_path: path });
              setCigar(res.cigar);
            }}
            onCleared={async () => {
              if (cigar.photo_path) await adminApi.deleteMedia(cigar.photo_path).catch(() => {});
              const res = await adminApi.updateCigar(id, { photo_path: null });
              setCigar(res.cigar);
            }}
          />
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow brass">Live from the POS</div>
          <p className="mute" style={{ fontSize: 12, marginTop: 6 }}>Read-only — overwritten on every sync.</p>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>POS name</div>
              <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>{cigar.pos_name || '—'}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>POS ID / SKU</div>
              <div className="mono" style={{ fontSize: 13 }}>{cigar.pos_id}</div>
              <div className="mono mute" style={{ fontSize: 12, marginTop: 2 }}>{cigar.sku || ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>On hand</div>
                <div className="serif brass" style={{ fontSize: 28, lineHeight: 1 }}>{cigar.qty}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Price</div>
                <div className="serif" style={{ fontSize: 22 }}>{fmtPrice(cigar.price)}</div>
              </div>
            </div>
            {cigar.cost != null && (
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Unit cost</div>
                <div className="serif" style={{ fontSize: 18 }}>{fmtPrice(cigar.cost)}</div>
              </div>
            )}
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>POS category / vendor</div>
              <div style={{ fontSize: 14 }}>{cigar.pos_category || '—'}</div>
              <div className="mute" style={{ fontSize: 13 }}>{cigar.pos_vendor || ''}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>Last sync</div>
              <div style={{ fontSize: 13 }}>{fmtSyncedAt(cigar.last_synced_at)}</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .cigar-edit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}
