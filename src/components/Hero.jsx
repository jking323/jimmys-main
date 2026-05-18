import { useEffect, useState } from 'react';
import { Photo, SmokeCurl, Stamp } from './primitives.jsx';
import { publicApi } from '../lib/api.js';

function formatTime12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ampm}` : `${h12} ${ampm}`;
}

function OpenIndicator() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    publicApi.hours().then((d) => setStatus(d.status)).catch(() => {});
  }, []);
  if (!status) return null;
  if (status.is_open) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)', fontSize: 14 }}>
        <span className="dot live"></span>
        Open now — until {formatTime12(status.closes_at)}
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)', fontSize: 14 }}>
      <span className="dot" style={{ background: 'var(--ember)' }}></span>
      Closed right now
    </span>
  );
}

export default function Hero() {
  return (
    <section id="top" style={{ position: 'relative', padding: '72px 0 88px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 80, right: -40, opacity: 0.5 }}>
        <SmokeCurl width={260} height={300} opacity={0.55} />
      </div>
      <div className="wrap" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center' }} className="hero-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span className="hand brass" style={{ fontSize: 22, transform: 'rotate(-2deg)', display: 'inline-block' }}>hey, neighbor —</span>
              <span style={{ width: 34, height: 1, background: 'var(--brass)', opacity: 0.5 }}></span>
              <span className="eyebrow">west melbourne, fl</span>
            </div>
            <h1 className="h-display">
              Pull up a chair.<br />
              Stay a <span className="hand brass" style={{ fontStyle: 'italic', fontWeight: 600 }}>couple hours</span>.
            </h1>
            <p style={{ marginTop: 28, fontSize: 19, color: 'var(--ink-mute)', maxWidth: 520, lineHeight: 1.55 }}>
              A friendly cigar lounge on Florida's Space Coast since 2014. Big leather chairs, a humidor we restock by hand, and conversation that goes wherever it goes. First-timers always welcome.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
              <a href="#visit" className="btn btn-primary">Visit us tonight <span style={{ fontSize: 18 }}>→</span></a>
              <a href="#events" className="btn btn-ghost">See what's on</a>
              <OpenIndicator />
            </div>
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div className="serif brass" style={{ fontSize: 28, lineHeight: 1 }}>240</div>
                <div className="eyebrow" style={{ fontSize: 10, marginTop: 4 }}>cigars in stock</div>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--line)' }}></div>
              <div>
                <div className="serif brass" style={{ fontSize: 28, lineHeight: 1 }}>2,400+</div>
                <div className="eyebrow" style={{ fontSize: 10, marginTop: 4 }}>on the monthly letter</div>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--line)' }}></div>
              <div>
                <div className="serif brass" style={{ fontSize: 28, lineHeight: 1 }}>12<span style={{ fontSize: 18 }}>th</span></div>
                <div className="eyebrow" style={{ fontSize: 10, marginTop: 4 }}>year on the coast</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 14, position: 'relative' }}>
            <Photo label="The Lounge" sub="wide shot · leather chairs, low light" style={{ gridColumn: '1 / -1', height: 280 }} />
            <Photo label="The Humidor" sub="walk-in shelves" style={{ height: 200 }} />
            <Photo label="A regular" sub="candid, low key" style={{ height: 200 }} />
            <div style={{ position: 'absolute', top: -12, left: -22, transform: 'rotate(-8deg)' }}>
              <Stamp rot={0}>Photos · drop in</Stamp>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
