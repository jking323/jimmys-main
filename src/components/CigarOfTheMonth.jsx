import { useEffect, useState } from 'react';
import { Photo, Squiggle, Stamp } from './primitives.jsx';
import { mediaUrl, publicApi } from '../lib/api.js';

function formatMonthLabel(monthIso) {
  if (!monthIso) return '';
  const [y, m] = monthIso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function renderName(name, italicWord) {
  if (!italicWord) return name;
  const idx = name.indexOf(italicWord);
  if (idx < 0) return name;
  const before = name.slice(0, idx);
  const after = name.slice(idx + italicWord.length);
  return (
    <>
      {before}
      <span style={{ fontStyle: 'italic', color: 'var(--brass)' }}>{italicWord}</span>
      {after}
    </>
  );
}

export default function CigarOfTheMonth() {
  const [cotm, setCotm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.cotmCurrent()
      .then((data) => setCotm(data.cotm))
      .catch(() => setCotm(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!cotm) return null;

  const monthLabel = formatMonthLabel(cotm.month);
  const eyebrow = monthLabel ? `Jimmy's pick · ${monthLabel}` : "Jimmy's pick";

  return (
    <section className="section">
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 64, alignItems: 'center' }} className="cotm-grid">
          <div style={{ position: 'relative' }}>
            {cotm.photo_path ? (
              <div style={{ height: 480, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <img
                  src={mediaUrl(cotm.photo_path)}
                  alt={cotm.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : (
              <Photo label="Cigar of the Month" sub={cotm.name} style={{ height: 480 }} />
            )}
            <div style={{ position: 'absolute', top: -14, left: -14 }}>
              <Stamp rot={-10}>{monthLabel ? `${monthLabel} Pick` : 'Pick of the month'}</Stamp>
            </div>
            {cotm.price_special && (
              <div style={{ position: 'absolute', bottom: -14, right: -14, background: 'var(--bg)', border: '1px solid var(--brass)', borderRadius: 12, padding: '14px 20px' }}>
                <div className="eyebrow brass" style={{ fontSize: 9 }}>This month</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  {cotm.price_regular && (
                    <span className="serif" style={{ fontSize: 18, textDecoration: 'line-through', color: 'var(--ink-dim)' }}>
                      ${cotm.price_regular}
                    </span>
                  )}
                  <span className="serif brass" style={{ fontSize: 36, lineHeight: 1 }}>${cotm.price_special}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="eyebrow brass">{eyebrow}</div>
            <h2 className="h-display" style={{ fontSize: 'clamp(48px, 6vw, 88px)', marginTop: 12 }}>
              {renderName(cotm.name, cotm.italic_word)}
            </h2>
            <Squiggle width={120} />
            <p style={{ fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.55, marginTop: 18, maxWidth: 520 }}>
              {cotm.blurb}
            </p>
            {cotm.quote && (
              <div style={{ marginTop: 22, padding: '22px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <div className="hand brass" style={{ fontSize: 24, lineHeight: 1.3, fontStyle: 'italic' }}>
                  "{cotm.quote}"
                </div>
                <div className="eyebrow" style={{ marginTop: 8 }}>— {cotm.quote_by || 'Jimmy'}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 24 }}>
              {[
                ['Origin', cotm.origin],
                ['Strength', cotm.strength],
                ['Smoke time', cotm.smoke_time],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{k}</div>
                  <div className="serif" style={{ fontSize: 22 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#visit" className="btn btn-primary">Reserve one to try <span>→</span></a>
              {cotm.stock != null && (
                <span className="mute" style={{ fontSize: 13 }}>{cotm.stock} in stock · while supplies last</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .cotm-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
