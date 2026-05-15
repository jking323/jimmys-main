import { useState } from 'react';
import { Monogram } from '../components/primitives.jsx';
import { adminApi } from '../lib/api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { user } = await adminApi.login(email.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 380, padding: '36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Monogram size={44} />
          <div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1 }}>Jimmy's</div>
            <div className="eyebrow" style={{ marginTop: 4, fontSize: 9.5 }}>Back of house</div>
          </div>
        </div>
        <h1 className="h2" style={{ fontSize: 32, marginBottom: 6 }}>Sign in</h1>
        <p className="mute" style={{ fontSize: 14, marginBottom: 22 }}>
          Use your staff email and password. Lost it? Ask Jimmy.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field-block">
            <label>Email</label>
            <input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field-block">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--ember)', fontSize: 13, marginTop: 14 }}>{error}</div>}

        <button type="submit" disabled={busy} className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', padding: '14px 18px', fontSize: 15 }}>
          {busy ? 'Signing in…' : <>Sign in <span>→</span></>}
        </button>
      </form>
    </div>
  );
}
