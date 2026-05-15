import { HUMIDOR } from '../data/humidor.js';
import { Photo, SectionHead, Stamp } from './primitives.jsx';

function StockCard({ cigar }) {
  const { name, size, strength, price, qty, origin, notes } = cigar;
  const status = qty <= 3 ? 'last' : qty <= 8 ? 'low' : qty <= 20 ? 'fresh' : 'plenty';
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
        <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>{origin}</div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.15 }}>{name}</div>
        <div className="mute" style={{ fontSize: 13, marginTop: 4 }}>{size}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--ink-dim)' }}>
          <span className="mono">{strength.toUpperCase()}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontStyle: 'italic' }}>{notes}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <span className={`chip ${badgeKind}`}>
          <span className="dot" style={{ background: 'currentColor' }}></span>
          {badgeText}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="serif brass" style={{ fontSize: 24, lineHeight: 1 }}>${price}</span>
        </div>
      </div>
    </div>
  );
}

export default function Humidor() {
  const shown = [...HUMIDOR].sort((a, b) => a.qty - b.qty).slice(0, 6);
  const lastUpdated = '8:14 this morning';

  return (
    <section id="humidor" className="section section-divider" style={{ position: 'relative' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="The humidor"
          title="What's on the shelves"
          scribble="counted by hand"
          lead="Live count, restocked weekly. Looking for something specific? Just ask — we keep more in the back than we put online."
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg-elev)' }}>
              <span className="dot live"></span>
              <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Counted {lastUpdated}</span>
            </div>
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="stock-grid">
          {shown.map((c) => <StockCard key={c.id} cigar={c} />)}
        </div>

        <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span className="chip chip-ember"><span className="dot" style={{ background: 'var(--ember)' }}></span>Last few</span>
            <span className="chip chip-brass"><span className="dot" style={{ background: 'var(--brass)' }}></span>Running low</span>
            <span className="chip chip-leaf"><span className="dot" style={{ background: 'var(--leaf)' }}></span>Fresh stock</span>
          </div>
          <a href="#" className="btn btn-ghost">
            Browse all 240 cigars <span>→</span>
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) { .stock-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 620px) { .stock-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
