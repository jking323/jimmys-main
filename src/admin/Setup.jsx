import { useState } from 'react';
import { Monogram } from '../components/primitives.jsx';
import { adminApi } from '../lib/api.js';

export default function Setup({ onComplete }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const { user } = await adminApi.setup({ email: email.trim(), name: name.trim(), password });
      onComplete(user);
    } catch (err) {
      setError(err.message || 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 460, padding: '36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Monogram size={44} />
          <div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1 }}>Jimmy's</div>
            <div className="eyebrow" style={{ marginTop: 4, fontSize: 9.5 }}>First time here</div>
          </div>
        </div>
        <h1 className="h2" style={{ fontSize: 32, marginBottom: 6 }}>Set up your account</h1>
        <p className="mute" style={{ fontSize: 14, marginBottom: 22 }}>
          No staff accounts exist yet. The first one you create will be the owner. After that, this page locks itself.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field-block">
            <label>Email</label>
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field-block">
            <label>Display name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jimmy" />
          </div>
          <div className="field-block">
            <label>Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field-block">
            <label>Confirm password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--ember)', fontSize: 13, marginTop: 14 }}>{error}</div>}

        <button type="submit" disabled={busy} className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center', padding: '14px 18px', fontSize: 15 }}>
          {busy ? 'Creating…' : <>Create my account <span>→</span></>}
        </button>
      </form>
    </div>
  );
}
