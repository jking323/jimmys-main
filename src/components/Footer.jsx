import { Monogram, Squiggle } from './primitives.jsx';

export default function Footer() {
  return (
    <footer style={{ padding: '48px 0 32px', borderTop: '1px solid var(--line)', background: 'var(--bg-elev)' }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }} className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Monogram size={44} />
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>Jimmy's Cigar Lounge</div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 4 }}>· est 2014 · west melbourne, fl ·</div>
              </div>
            </div>
            <p style={{ color: 'var(--ink-mute)', fontSize: 14, marginTop: 18, lineHeight: 1.55, maxWidth: 340 }}>
              A neighborhood cigar lounge on Florida's Space Coast. Pull up a chair.
            </p>
          </div>
          <div>
            <div className="eyebrow brass" style={{ marginBottom: 14 }}>The Shop</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Humidor', 'Cigar of the month', 'Lockers & memberships', 'Gift cards'].map((x) => (
                <li key={x}><a href="#" style={{ color: 'var(--ink-mute)', textDecoration: 'none', fontSize: 14 }}>{x}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow brass" style={{ marginBottom: 14 }}>The Lounge</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Events', 'Newcomer Night', 'Pairing quiz', 'Reserve a seat'].map((x) => (
                <li key={x}><a href="#" style={{ color: 'var(--ink-mute)', textDecoration: 'none', fontSize: 14 }}>{x}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow brass" style={{ marginBottom: 14 }}>Stay in touch</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Monthly letter', 'Instagram', 'Facebook', 'Call (321) 555-0144'].map((x) => (
                <li key={x}><a href="#" style={{ color: 'var(--ink-mute)', textDecoration: 'none', fontSize: 14 }}>{x}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <Squiggle width={'100%'} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, fontSize: 12, color: 'var(--ink-dim)', gap: 14, flexWrap: 'wrap' }}>
          <span>© 2026 Jimmy's Cigar Lounge · 1220 W New Haven Ave · West Melbourne, FL 32904</span>
          <span className="hand brass" style={{ fontSize: 18 }}>see you tonight ✦</span>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
