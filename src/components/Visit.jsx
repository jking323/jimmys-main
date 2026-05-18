import { useEffect, useState } from 'react';
import { Photo, SectionHead } from './primitives.jsx';
import { mediaUrl, publicApi } from '../lib/api.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ampm}` : `${h12} ${ampm}`;
}

function rangeLabel(row) {
  if (!row || row.closed) return 'Closed';
  return `${formatTime12(row.open_at)} – ${formatTime12(row.close_at)}`;
}

function Hours({ hours, today }) {
  // Order Mon, Tue, ..., Sun. business_hours rows are keyed 0=Sun..6=Sat.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {order.map((dow, i) => {
        const row = hours.find((r) => r.day_of_week === dow);
        const isToday = today === dow;
        return (
          <div
            key={dow}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < order.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--ink)' : 'var(--ink-mute)' }}>
              {DAY_NAMES[dow]}
              {isToday && (
                <span className="hand brass" style={{ fontSize: 18, marginLeft: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>today</span>
              )}
            </span>
            <span className="mono" style={{ fontSize: 13, color: isToday ? 'var(--brass)' : 'var(--ink-mute)' }}>
              {rangeLabel(row)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Visit() {
  const [data, setData] = useState(null);
  const [assets, setAssets] = useState({});

  useEffect(() => {
    publicApi.hours()
      .then(setData)
      .catch(() => setData({ hours: [], status: { is_open: false, today_dow: new Date().getDay() } }));
    publicApi.siteAssets().then((d) => setAssets(d.assets || {})).catch(() => {});
  }, []);

  const hours = data?.hours || [];
  const status = data?.status || { is_open: false, today_dow: new Date().getDay() };
  const map = assets['visit-map'];

  return (
    <section id="visit" className="section section-divider">
      <div className="wrap">
        <SectionHead
          eyebrow="Come say hi"
          title="Find us, friend."
          scribble="we're easy to spot"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }} className="visit-grid">
          {map ? (
            <div style={{ height: 480, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <img
                src={mediaUrl(map.photo_path)}
                alt={map.alt_text || 'Jimmy\'s Cigar Lounge — West New Haven Ave'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ) : (
            <Photo label="Map · West New Haven Ave" sub="static map · driving directions · pin Jimmy's" style={{ height: 480 }} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div className="eyebrow brass">Address</div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1.15, marginTop: 10 }}>
                1220 West New Haven Ave<br />
                West Melbourne, FL 32904
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <a
                  href="https://maps.google.com/?q=1220+West+New+Haven+Ave+West+Melbourne+FL+32904"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: 14 }}
                >
                  Get directions <span>→</span>
                </a>
                <a href="tel:3215550144" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
                  (321) 555-0144
                </a>
              </div>
            </div>

            <div>
              <div className="eyebrow brass">Hours</div>
              <div style={{ marginTop: 10 }}>
                {hours.length > 0
                  ? <Hours hours={hours} today={status.today_dow} />
                  : <p className="mute" style={{ fontSize: 14 }}>Loading hours…</p>}
              </div>
              {status.is_open && status.closes_at && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                  }}
                >
                  <span className="dot live"></span>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                    Open right now — until {formatTime12(status.closes_at)}
                  </span>
                </div>
              )}
              {!status.is_open && hours.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                  }}
                >
                  <span className="dot" style={{ background: 'var(--ember)' }}></span>
                  <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
                    Closed right now
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .visit-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
