export default function Chalkboard() {
  return (
    <section style={{ padding: '24px 0 16px' }}>
      <div className="wrap">
        <div
          style={{
            padding: '24px 32px',
            background: 'var(--bg-elev)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            position: 'relative',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dot live"></span>
              <span className="eyebrow brass">On the chalkboard tonight</span>
            </div>
            <div style={{ height: 24, width: 1, background: 'var(--line)' }} className="cb-divider"></div>
            <div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>Open Mic & Cigars</div>
              <div className="mute" style={{ fontSize: 14, marginTop: 4 }}>Saturday · 8 PM · Free · sign-up at the bar</div>
            </div>
          </div>
          <a href="#events" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
            I'll be there <span>→</span>
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .cb-divider { display: none; }
        }
      `}</style>
    </section>
  );
}
