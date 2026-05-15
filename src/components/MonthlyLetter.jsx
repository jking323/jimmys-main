import { useState } from 'react';
import { Stamp } from './primitives.jsx';
import { publicApi } from '../lib/api.js';

export default function MonthlyLetter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setBusy(true);
    setError(null);
    try {
      await publicApi.newsletterSubscribe(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Couldn't sign you up. Try again or stop by the bar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section section-divider">
      <div className="wrap" style={{ maxWidth: 920 }}>
        <div
          style={{
            position: 'relative',
            padding: '56px 56px',
            border: '1px solid var(--line)',
            borderRadius: 18,
            background: 'var(--bg-elev)',
          }}
          className="letter-card"
        >
          <div style={{ position: 'absolute', top: -16, right: 24 }}>
            <Stamp rot={8}>1¢ Postage</Stamp>
          </div>
          <div style={{ position: 'absolute', top: 14, left: 24, display: 'flex', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)', opacity: 0.6 }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brass)', opacity: 0.6 }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--leaf)', opacity: 0.6 }}></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }} className="letter-grid">
            <div>
              <div className="hand brass" style={{ fontSize: 22, transform: 'rotate(-2deg)', display: 'inline-block' }}>once a month —</div>
              <h2 className="h1" style={{ marginTop: 8 }}>The monthly letter.</h2>
              <p style={{ marginTop: 18, color: 'var(--ink-mute)', fontSize: 17, lineHeight: 1.55 }}>
                New cigars in the humidor. Member nights. The occasional excuse to drop by. Jimmy writes it himself — no spam, no fluff, no upsell.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 13, color: 'var(--ink-mute)' }}>
                <span className="dot live"></span>
                2,400+ neighbors on the list
              </div>
            </div>
            <div>
              {!sent ? (
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="field" style={{ padding: '14px 22px', borderRadius: 14 }}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontSize: 16 }}
                      required
                    />
                  </div>
                  {error && <span style={{ color: 'var(--ember)', fontSize: 13, textAlign: 'center' }}>{error}</span>}
                  <button type="submit" disabled={busy} className="btn btn-primary" style={{ padding: '14px 24px', fontSize: 15, width: '100%', justifyContent: 'center' }}>
                    {busy ? 'Sending…' : <>Send it my way <span style={{ fontSize: 18 }}>→</span></>}
                  </button>
                  <span className="mute" style={{ fontSize: 12, textAlign: 'center' }}>
                    Unsubscribe in one click. Never sold, never shared.
                  </span>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="hand brass" style={{ fontSize: 36, lineHeight: 1 }}>You're in.</div>
                  <p className="mute" style={{ marginTop: 10, fontSize: 14 }}>
                    First letter heads out the first Tuesday of next month. Welcome to the porch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .letter-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .letter-card { padding: 40px 28px !important; }
        }
      `}</style>
    </section>
  );
}
