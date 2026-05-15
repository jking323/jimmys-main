import { Photo, SectionHead } from './primitives.jsx';

function Hours() {
  const today = 'Friday';
  const sched = [
    ['Monday', '10:00 AM – 11:00 PM'],
    ['Tuesday', '10:00 AM – 11:00 PM'],
    ['Wednesday', '10:00 AM – 11:00 PM'],
    ['Thursday', '10:00 AM – 11:00 PM'],
    ['Friday', '10:00 AM – 1:00 AM'],
    ['Saturday', '10:00 AM – 1:00 AM'],
    ['Sunday', '12:00 PM – 10:00 PM'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sched.map(([d, h], i) => (
        <div
          key={d}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0',
            borderBottom: i < sched.length - 1 ? '1px solid var(--line)' : 'none',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: d === today ? 600 : 400, color: d === today ? 'var(--ink)' : 'var(--ink-mute)' }}>
            {d}
            {d === today && <span className="hand brass" style={{ fontSize: 18, marginLeft: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>today</span>}
          </span>
          <span className="mono" style={{ fontSize: 13, color: d === today ? 'var(--brass)' : 'var(--ink-mute)' }}>{h}</span>
        </div>
      ))}
    </div>
  );
}

export default function Visit() {
  return (
    <section id="visit" className="section section-divider">
      <div className="wrap">
        <SectionHead
          eyebrow="Come say hi"
          title="Find us, friend."
          scribble="we're easy to spot"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }} className="visit-grid">
          <Photo label="Map · West New Haven Ave" sub="static map · driving directions · pin Jimmy's" style={{ height: 480 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div className="eyebrow brass">Address</div>
              <div className="serif" style={{ fontSize: 30, lineHeight: 1.15, marginTop: 10 }}>
                1220 West New Haven Ave<br />
                West Melbourne, FL 32904
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <a href="https://maps.google.com/?q=1220+West+New+Haven+Ave+West+Melbourne+FL+32904" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
                  Get directions <span>→</span>
                </a>
                <a href="tel:3215550144" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>(321) 555-0144</a>
              </div>
            </div>

            <div>
              <div className="eyebrow brass">Hours</div>
              <div style={{ marginTop: 10 }}>
                <Hours />
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 10 }}>
                <span className="dot live"></span>
                <span style={{ fontSize: 14, color: 'var(--ink)' }}>Open right now — until 1 AM</span>
              </div>
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
