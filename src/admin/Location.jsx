import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';
import LoungeMap from '../components/LoungeMap.jsx';

const STYLES = [
  { id: 'stamen_toner_lite', label: 'Etched / vintage (Toner Lite)', hint: 'Black-on-cream engraved look — recommended.' },
  { id: 'stamen_toner', label: 'High-contrast etched (Toner)', hint: 'Sharper black & white version.' },
  { id: 'stamen_watercolor', label: 'Watercolor postcard', hint: 'Hand-painted texture.' },
  { id: 'stamen_terrain', label: 'Terrain', hint: 'Topographic, muted.' },
  { id: 'alidade_smooth', label: 'Alidade Smooth (light)', hint: 'Clean modern minimal.' },
  { id: 'alidade_smooth_dark', label: 'Alidade Smooth (dark)', hint: 'Same but dark.' },
  { id: 'outdoors', label: 'Outdoors', hint: 'Trails and terrain.' },
  { id: 'osm_bright', label: 'OSM Bright', hint: 'Standard OpenStreetMap colors.' },
];

export default function Location() {
  const [loc, setLoc] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await adminApi.location();
      setLoc(d.location);
      setForm({
        lat: d.location?.lat ?? 28.0668,
        lng: d.location?.lng ?? -80.6520,
        zoom: d.location?.zoom ?? 16,
        label: d.location?.label ?? '',
        map_style: d.location?.map_style ?? 'stamen_toner_lite',
        stadia_api_key: d.location?.stadia_api_key ?? '',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function bind(field, parse) {
    return (e) => {
      const raw = e.target.value;
      setForm((f) => ({ ...f, [field]: parse ? parse(raw) : raw }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      const { location } = await adminApi.saveLocation({
        lat: Number(form.lat),
        lng: Number(form.lng),
        zoom: Number(form.zoom),
        label: form.label || null,
        map_style: form.map_style,
        stadia_api_key: form.stadia_api_key, // empty string clears it
      });
      setLoc(location);
      setSuccess('Saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <div className="mute">Loading…</div>;

  // Live preview of the map with the current form values (re-mounts on change).
  const previewLocation = {
    lat: Number(form.lat),
    lng: Number(form.lng),
    zoom: Number(form.zoom),
    label: form.label,
    map_style: form.map_style,
    stadia_api_key: form.stadia_api_key,
  };

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Out front</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Map &amp; location</h1>
          <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>
            The pin and styled map that shows up on the homepage Visit section.
          </p>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          {saving ? 'Saving…' : 'Save changes →'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--ember)', marginBottom: 14 }}>{error}</div>}
      {success && <div style={{ color: 'var(--leaf)', marginBottom: 14 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="location-grid">
        <div className="card" style={{ padding: 24 }}>
          <h2 className="h3" style={{ marginBottom: 18 }}>Pin position</h2>
          <div className="form-grid">
            <div className="field-block">
              <label>Latitude</label>
              <input type="number" step="0.0001" required value={form.lat} onChange={bind('lat')} />
            </div>
            <div className="field-block">
              <label>Longitude</label>
              <input type="number" step="0.0001" required value={form.lng} onChange={bind('lng')} />
            </div>
            <div className="field-block">
              <label>Zoom (1–20)</label>
              <input type="number" min="1" max="20" required value={form.zoom} onChange={bind('zoom')} />
            </div>
            <div className="field-block">
              <label>Marker label</label>
              <input value={form.label} onChange={bind('label')} placeholder="Jimmy's Cigar Lounge" />
            </div>
            <div className="field-block full">
              <label>Map style</label>
              <select value={form.map_style} onChange={bind('map_style')}>
                {STYLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <p className="mute" style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                {STYLES.find((s) => s.id === form.map_style)?.hint}
              </p>
            </div>
            <div className="field-block full">
              <label>Stadia Maps API key</label>
              <input
                value={form.stadia_api_key}
                onChange={bind('stadia_api_key')}
                placeholder="Get one free at stadiamaps.com → API Keys"
                autoComplete="off"
                spellCheck="false"
              />
              <p className="mute" style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                Required for production traffic (Stadia rate-limits unauthenticated tile loads). Sign up at <a href="https://client.stadiamaps.com/signup/" target="_blank" rel="noreferrer" style={{ color: 'var(--brass)' }}>stadiamaps.com</a> — free tier covers up to 200,000 tile loads / month. Add your site's domain to the key's allow-list. Leave blank to clear.
              </p>
            </div>
          </div>

          <details style={{ marginTop: 18 }}>
            <summary className="mute" style={{ cursor: 'pointer', fontSize: 13 }}>How do I get latitude / longitude?</summary>
            <p className="mute" style={{ fontSize: 13, marginTop: 8 }}>
              Open Google Maps, right-click the spot you want, click the coordinates that appear at the top of the menu — that copies them. Paste here.
            </p>
          </details>
        </div>

        <div>
          <div className="eyebrow brass" style={{ marginBottom: 10 }}>Live preview</div>
          <LoungeMap location={previewLocation} height={420} />
          <p className="mute" style={{ fontSize: 12, marginTop: 8 }}>
            Reflects the form above. Click "Save changes" to push to the public site.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .location-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}
