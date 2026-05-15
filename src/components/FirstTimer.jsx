import { HandArrow } from './primitives.jsx';

export default function FirstTimer() {
  return (
    <section style={{ padding: '48px 0' }}>
      <div className="wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr',
            gap: 48,
            alignItems: 'center',
            padding: '40px 44px',
            border: '1px dashed var(--line)',
            borderRadius: 18,
            background: 'var(--paper-tint)',
          }}
          className="ft-grid"
        >
          <div>
            <div className="hand brass" style={{ fontSize: 22, transform: 'rotate(-3deg)', display: 'inline-block' }}>never had one?</div>
            <h3 className="h2" style={{ marginTop: 8 }}>You're in the right place.</h3>
          </div>
          <div>
            <p style={{ fontSize: 17, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.55 }}>
              We get it. The wall of boxes is intimidating. Just tell whoever's behind the counter what you usually drink and how much time you have — we'll hand you something good. No upsell, no eye-rolls.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 20, flexWrap: 'wrap' }}>
              <a href="#pairing" className="btn btn-primary" style={{ padding: '12px 22px', fontSize: 14 }}>
                Take the 30-second quiz <HandArrow width={28} color="#1a1410" />
              </a>
              <a href="#events" className="btn btn-ghost" style={{ padding: '12px 22px', fontSize: 14 }}>
                Or come to Newcomer Night
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .ft-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 32px 28px !important; }
        }
      `}</style>
    </section>
  );
}
