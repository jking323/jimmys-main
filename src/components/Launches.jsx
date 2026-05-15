import { LAUNCHES } from '../data/launches.js';

function LaunchRow({ launch }) {
  const { date, time, vehicle, mission, pad, visible, countdown, status } = launch;
  const dotColor = status === 'go' ? 'var(--leaf)' : 'var(--brass)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 20, alignItems: 'center',
      padding: '20px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div>
        <div className="eyebrow brass" style={{ fontSize: 9.5 }}>{date.split(' ')[0]}</div>
        <div className="serif" style={{ fontSize: 32, lineHeight: 0.9 }}>{date.split(' ')[1]}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 2 }}>{time}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
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

export default function Launches() {
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div className="eyebrow brass">Next from the Space Coast</div>
              <span className="chip" style={{ fontSize: 10 }}>
                <span className="dot live"></span>
                Source: launchschedule.com
              </span>
            </div>
            <div>
              {LAUNCHES.map((l) => <LaunchRow key={l.id} launch={l} />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 14, flexWrap: 'wrap' }}>
              <span className="mute" style={{ fontSize: 13 }}>Schedule slips. We update at the bar.</span>
              <a href="#" style={{ color: 'var(--brass)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
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
