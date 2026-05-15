import { useEffect, useState } from 'react';
import { Photo, SectionHead, Stamp } from './primitives.jsx';
import { publicApi } from '../lib/api.js';

function statusFor(qty) {
  return qty <= 3 ? 'last' : qty <= 8 ? 'low' : qty <= 20 ? 'fresh' : 'plenty';
}

function StockCard({ cigar }) {
  const name = cigar.display_name || cigar.pos_name || 'Cigar';
  const origin = cigar.origin || cigar.brand || cigar.pos_vendor || '';
  const size = cigar.vitola || '';
  const strength = cigar.strength || '';
  const notes = cigar.tasting_notes || '';
  const qty = Number(cigar.qty || 0);
  const status = statusFor(qty);
  const badgeText = {
    last: `Only ${qty} left!`,
    low: `${qty} left in humidor`,
    fresh: `${qty} in stock`,
    plenty: `${qty} in stock`,
  }[status];
  const badgeKind = { last: 'chip-ember', low: 'chip-brass', fresh: 'chip-leaf', plenty: 'chip' }[status];

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}>
      {status === 'last' && (
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }}>
          <Stamp rot={6} color="var(--ember)">Last few</Stamp>
        </div>
      )}
      <Photo label="cigar" sub={name.split(' ').slice(0, 2).join(' ').toLowerCase()} style={{ height: 120 }} />

      <div style={{ flex: 1 }}>
        {origin && <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>{origin}</div>}
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.15 }}>{name}</div>
        {size && <div className="mute" style={{ fontSize: 13, marginTop: 4 }}>{size}</div>}
        {(strength || notes) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--ink-dim)' }}>
            {strength && <span className="mono">{strength.toUpperCase()}</span>}
            {strength && notes && <span style={{ opacity: 0.4 }}>·</span>}
            {notes && <span style={{ fontStyle: 'italic' }}>{notes}</span>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <span className={`chip ${badgeKind}`}>
          <span className="dot" style={{ background: 'currentColor' }}></span>
          {badgeText}
        </span>
        {cigar.price != null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="serif brass" style={{ fontSize: 24, lineHeight: 1 }}>${Number(cigar.price).toFixed(Number(cigar.price) % 1 === 0 ? 0 : 2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatSyncedAt(iso) {
  if (!iso) return null;
  const d = new Date(iso.includes('Z') ? iso : iso + 'Z');
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Humidor() {
  const [data, setData] = useState({ cigars: [], totals: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    publicApi.humidor()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = (data.cigars || []).slice(0, 6);
  const totalStock = data.totals?.total_stock || 0;
  const lastSynced = formatSyncedAt(data.totals?.last_synced_at);

  return (
    <section id="humidor" className="section section-divider" style={{ position: 'relative' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="The humidor"
          title="What's on the shelves"
          scribble="counted by hand"
          lead="Live count, restocked weekly. Looking for something specific? Just ask — we keep more in the back than we put online."
          right={
            lastSynced && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg-elev)' }}>
                <span className="dot live"></span>
                <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Counted {lastSynced}</span>
              </div>
            )
          }
        />

        {loading && <p className="mute">Counting…</p>}
        {error && <p style={{ color: 'var(--ember)' }}>Couldn't load the humidor: {error}</p>}
        {!loading && !error && shown.length === 0 && (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <p className="mute" style={{ marginBottom: 6 }}>The shelves aren't published yet.</p>
            <p className="mute" style={{ fontSize: 13 }}>Once we sync from the POS and flag a few favorites, they'll show up here.</p>
          </div>
        )}

        {shown.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="stock-grid">
            {shown.map((c) => <StockCard key={c.id} cigar={c} />)}
          </div>
        )}

        <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span className="chip chip-ember"><span className="dot" style={{ background: 'var(--ember)' }}></span>Last few</span>
            <span className="chip chip-brass"><span className="dot" style={{ background: 'var(--brass)' }}></span>Running low</span>
            <span className="chip chip-leaf"><span className="dot" style={{ background: 'var(--leaf)' }}></span>Fresh stock</span>
          </div>
          {totalStock > 0 && (
            <span className="mute" style={{ fontSize: 14 }}>
              <span className="serif brass" style={{ fontSize: 22, marginRight: 8 }}>{totalStock.toLocaleString()}</span>
              cigars on the shelves right now
            </span>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) { .stock-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 620px) { .stock-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
