import { useEffect, useState } from 'react';
import { publicApi } from '../lib/api.js';

// Computed client-side from the ISO timestamp so it stays fresh between
// edge-cached API responses.
function countdownTo(iso) {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs < -10 * 60 * 1000) return 'past';
  if (diffMs < 60 * 1000) return 'liftoff';
  const diffMin = diffMs / 60000;
  if (diffMin < 60) return `T-${Math.round(diffMin)} min`;
  const diffHr = diffMin / 60;
  if (diffHr < 24) return `T-${Math.round(diffHr)} hr`;
  const diffDays = Math.round(diffHr / 24);
  if (diffDays === 1) return 'tomorrow';
  return `${diffDays} days`;
}

function LaunchRow({ launch }) {
  const { date, time, vehicle, mission, pad, visible, status, net } = launch;
  const dotColor = status === 'go' ? 'var(--leaf)' : 'var(--brass)';
  const [, month, day] = date.match(/^(\w+)\s+(\d+)$/) || [null, date, ''];
  const countdown = countdownTo(net);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 20, alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div>
        <div className="eyebrow brass" style={{ fontSize: 9.5 }}>{month}</div>
        <div className="serif" style={{ fontSize: 32, lineHeight: 0.9 }}>{day}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 }}>{time}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span className="serif" style={{ fontSize: 20, lineHeight: 1.1 }}>{mission}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: dotColor }}>
            <span className="dot" style={{ background: dotColor, width: 6, height: 6 }}></span>
            {status === 'go' ? 'GO' : 'TENTATIVE'}
          </span>
        </div>
        <div className="mute" style={{ fontSize: 13 }}>
          <span className="mono" style={{ color: 'var(--brass)' }}>{vehicle}</span> · {pad} · <span style={{ fontStyle: 'italic' }}>{visible}</span>
        </div>
      </div>
      <div className="eyebrow" style={{ fontSize: 10, textAlign: 'right' }}>
        {countdown}
      </div>
    </div>
  );
}

function LoadingRow() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '70px 1fr', gap: 20, alignItems: 'center',
      padding: '20px 0', borderBottom: '1px solid var(--line)', opacity: 0.45,
    }}>
      <div>
        <div style={{ height: 10, width: 36, background: 'var(--line)', borderRadius: 2, marginBottom: 8 }} />
        <div style={{ height: 28, width: 52, background: 'var(--line)', borderRadius: 4 }} />
      </div>
      <div>
        <div style={{ height: 18, width: '60%', background: 'var(--line)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, width: '40%', background: 'var(--line)', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function Launches() {
  const [launches, setLaunches] = useState(null); // null = loading, [] = empty/error
  // Tick every minute so countdowns stay fresh.
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    publicApi.launches()
      .then((d) => { if (alive) setLaunches(d.launches || []); })
      .catch(() => { if (alive) setLaunches([]); });
    const interval = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const isLoading = launches === null;
  const isEmpty = !isLoading && launches.length === 0;

  return (
    <section className="section section-divider" style={{ background: 'var(--bg-elev)' }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 56, alignItems: 'start' }} className="launch-grid">
          <div>
            <div className="eyebrow brass">From the patio</div>
            <h2 className="h1" style={{ marginTop: 14 }}>
              The rockets <br />
              <span className="hand brass" style={{ fontSize: '0.65em', fontStyle: 'italic' }}>are basically</span> our skyline.
            </h2>
            <p style={{ marginTop: 20, color: 'var(--ink-mute)', fontSize: 17, lineHeight: 1.6, maxWidth: 480 }}>
              We're 35 minutes south of the Cape. On clear nights, you can watch a Falcon 9 climb from the back patio with a cigar in hand. We pull the live schedule so you know when to step outside.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
              <div>
                <div className="serif brass" style={{ fontSize: 42, lineHeight: 1 }}>35</div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 6 }}>min from LC-39A</div>
              </div>
              <div style={{ width: 1, height: 48, background: 'var(--line)' }}></div>
              <div>
                <div className="serif brass" style={{ fontSize: 42, lineHeight: 1 }}>96</div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 6 }}>launches we've watched</div>
              </div>
              <div style={{ width: 1, height: 48, background: 'var(--line)' }}></div>
              <div>
                <div className="serif brass" style={{ fontSize: 42, lineHeight: 1 }}>0</div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 6 }}>missed when it counts</div>
              </div>
            </div>
            <div style={{ marginTop: 32, padding: '18px 22px', border: '1px dashed var(--brass)', borderRadius: 12, background: 'var(--paper-tint)' }}>
              <div className="hand brass" style={{ fontSize: 19, lineHeight: 1.3 }}>
                Tip: we ring the brass bell over the bar when the countdown hits T-2:00. Step outside.
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
              <div className="eyebrow brass">Next from the Space Coast</div>
              <span className="chip" style={{ fontSize: 10 }}>
                <span className="dot live"></span>
                Live · The Space Devs
              </span>
            </div>
            <div>
              {isLoading && [0, 1, 2, 3].map((i) => <LoadingRow key={i} />)}
              {isEmpty && (
                <div className="mute" style={{ padding: '32px 0', textAlign: 'center', fontSize: 14 }}>
                  Schedule is loading from the Cape — check back in a minute.
                </div>
              )}
              {!isLoading && !isEmpty && launches.map((l) => <LaunchRow key={l.id} launch={l} />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 14, flexWrap: 'wrap' }}>
              <span className="mute" style={{ fontSize: 13 }}>Schedule slips. We update at the bar.</span>
              <a href="https://nextspaceflight.com/launches/" target="_blank" rel="noreferrer" style={{ color: 'var(--brass)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                Full launch calendar →
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) {
          .launch-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
