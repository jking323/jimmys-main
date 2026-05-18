import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function fmtTime12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ampm}` : `${h12} ${ampm}`;
}

const blankRow = (dow) => ({ day_of_week: dow, open_at: '', close_at: '', closed: 0 });

export default function Hours() {
  const [hours, setHours] = useState(DAY_ORDER.map(blankRow));
  const [overrides, setOverrides] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [overrideDate, setOverrideDate] = useState('');
  const [overrideClosed, setOverrideClosed] = useState(true);
  const [overrideOpen, setOverrideOpen] = useState('');
  const [overrideClose, setOverrideClose] = useState('');
  const [overrideNote, setOverrideNote] = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await adminApi.hours();
      // Ensure every dow has a row even if DB is missing one.
      const map = new Map((d.hours || []).map((r) => [r.day_of_week, r]));
      const filled = DAY_ORDER.map((dow) => map.get(dow) || blankRow(dow));
      setHours(filled);
      setOverrides(d.overrides || []);
      setStatus(d.status || null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function updateRow(dow, patch) {
    setHours((rows) => rows.map((r) => (r.day_of_week === dow ? { ...r, ...patch } : r)));
  }

  async function save() {
    setSaving(true); setError(null); setSuccess(null);
    try {
      await adminApi.saveHours(hours);
      setSuccess('Saved.');
      await load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function addOverride(e) {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      await adminApi.upsertOverride({
        date: overrideDate,
        closed: overrideClosed,
        open_at: overrideClosed ? null : overrideOpen,
        close_at: overrideClosed ? null : overrideClose,
        note: overrideNote || null,
      });
      setOverrideDate(''); setOverrideClosed(true); setOverrideOpen(''); setOverrideClose(''); setOverrideNote('');
      await load();
    } catch (err) { setError(err.message); }
  }

  async function removeOverride(date) {
    if (!confirm(`Remove the override for ${date}?`)) return;
    await adminApi.deleteOverride(date);
    await load();
  }

  if (loading) return <div className="mute">Loading…</div>;

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Out front</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Hours</h1>
          {status && (
            <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>
              {status.is_open
                ? <>Open right now <span className="dot live" style={{ marginLeft: 6 }}></span> — until {fmtTime12(status.closes_at)}</>
                : <>Closed right now</>}
            </p>
          )}
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          {saving ? 'Saving…' : 'Save weekly hours →'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--ember)', marginBottom: 14 }}>{error}</div>}
      {success && <div style={{ color: 'var(--leaf)', marginBottom: 14 }}>{success}</div>}

      <div className="card" style={{ padding: 0, marginBottom: 36 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th style={{ width: 130 }}>Opens</th>
              <th style={{ width: 130 }}>Closes</th>
              <th style={{ width: 110 }}>Closed?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hours.map((row) => (
              <tr key={row.day_of_week}>
                <td style={{ fontWeight: 500 }}>{DAY_NAMES[row.day_of_week]}</td>
                <td>
                  <input
                    type="time"
                    value={row.open_at || ''}
                    onChange={(e) => updateRow(row.day_of_week, { open_at: e.target.value })}
                    disabled={!!row.closed}
                    style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', padding: '6px 10px', font: 'inherit' }}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={row.close_at || ''}
                    onChange={(e) => updateRow(row.day_of_week, { close_at: e.target.value })}
                    disabled={!!row.closed}
                    style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', padding: '6px 10px', font: 'inherit' }}
                  />
                </td>
                <td>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!row.closed}
                      onChange={(e) => updateRow(row.day_of_week, { closed: e.target.checked ? 1 : 0 })}
                    />
                    <span style={{ fontSize: 13 }}>Closed</span>
                  </label>
                </td>
                <td className="mute" style={{ fontSize: 12 }}>
                  {!row.closed && row.open_at && row.close_at && `${fmtTime12(row.open_at)} – ${fmtTime12(row.close_at)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="h3" style={{ marginBottom: 6 }}>One-off overrides</h2>
      <p className="mute" style={{ fontSize: 13, marginBottom: 14 }}>
        Holidays, special closures, weather days. An override beats the weekly schedule for that date.
      </p>

      <form onSubmit={addOverride} className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div className="form-grid">
          <div className="field-block">
            <label>Date</label>
            <input type="date" required value={overrideDate} onChange={(e) => setOverrideDate(e.target.value)} />
          </div>
          <div className="field-block">
            <label>Closed?</label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <input type="checkbox" checked={overrideClosed} onChange={(e) => setOverrideClosed(e.target.checked)} />
              <span style={{ fontSize: 14 }}>Yes — closed all day</span>
            </label>
          </div>
          {!overrideClosed && (
            <>
              <div className="field-block">
                <label>Opens</label>
                <input type="time" required value={overrideOpen} onChange={(e) => setOverrideOpen(e.target.value)} />
              </div>
              <div className="field-block">
                <label>Closes</label>
                <input type="time" required value={overrideClose} onChange={(e) => setOverrideClose(e.target.value)} />
              </div>
            </>
          )}
          <div className="field-block full">
            <label>Note (shown internally only)</label>
            <input value={overrideNote} onChange={(e) => setOverrideNote(e.target.value)} placeholder="Thanksgiving / hurricane / private event" />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>Save override →</button>
        </div>
      </form>

      {overrides.length === 0 ? (
        <p className="mute" style={{ fontSize: 14 }}>No overrides set.</p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.date}>
                  <td className="mono">{o.date}</td>
                  <td>
                    {o.closed
                      ? <span className="chip chip-ember" style={{ fontSize: 10 }}>Closed</span>
                      : <span className="serif">{fmtTime12(o.open_at)} – {fmtTime12(o.close_at)}</span>}
                  </td>
                  <td className="mute" style={{ fontSize: 13 }}>{o.note || ''}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" onClick={() => removeOverride(o.date)} style={{ background: 'transparent', border: 0, color: 'var(--ember)', cursor: 'pointer', fontSize: 13 }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
