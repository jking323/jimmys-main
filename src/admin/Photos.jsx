import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { SITE_SLOTS } from '../lib/siteSlots.js';

export default function Photos() {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await adminApi.siteAssets();
      setAssets(d.assets || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onSlotUploaded(slot, path) {
    const altCurrent = assets[slot.key]?.alt_text || '';
    await adminApi.setSiteAsset(slot.key, { photo_path: path, alt_text: altCurrent });
    await load();
  }

  async function onSlotCleared(slot) {
    await adminApi.clearSiteAsset(slot.key);
    await load();
  }

  async function saveAlt(slot, altText) {
    const current = assets[slot.key];
    if (!current) return;
    await adminApi.setSiteAsset(slot.key, { photo_path: current.photo_path, alt_text: altText });
    await load();
  }

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Storefront</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Site photos</h1>
          <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>
            The big photos on the homepage — hero collage, the Visit section map. Cigar / event / Cigar of the Month photos live with their entities.
          </p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--ember)' }}>{error}</div>}
      {loading && <div className="mute">Loading…</div>}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="photos-grid">
          {SITE_SLOTS.map((slot) => {
            const asset = assets[slot.key];
            return (
              <div key={slot.key} className="card" style={{ padding: 22 }}>
                <div className="eyebrow brass" style={{ marginBottom: 6 }}>{slot.label}</div>
                <p className="mute" style={{ fontSize: 12, marginTop: 0, marginBottom: 14 }}>{slot.hint}</p>
                <PhotoUpload
                  pathPrefix={slot.storagePrefix}
                  currentPath={asset?.photo_path}
                  version={asset?.updated_at}
                  onUploaded={(path) => onSlotUploaded(slot, path)}
                  onCleared={() => onSlotCleared(slot)}
                />
                {asset && (
                  <AltTextRow
                    initial={asset.alt_text || ''}
                    onSave={(t) => saveAlt(slot, t)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          .photos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function AltTextRow({ initial, onSave }) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = value !== initial;

  async function save() {
    setBusy(true);
    try { await onSave(value.trim() || null); }
    finally { setBusy(false); }
  }

  return (
    <div className="field-block" style={{ marginTop: 14 }}>
      <label>Alt text (for screen readers + SEO)</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. The lounge at dusk — leather chairs, warm light"
        onBlur={() => { if (dirty) save(); }}
        disabled={busy}
      />
    </div>
  );
}
