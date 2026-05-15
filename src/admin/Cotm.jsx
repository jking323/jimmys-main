import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

const EMPTY = {
  month: currentMonth(),
  name: '',
  italic_word: '',
  blurb: '',
  quote: '',
  quote_by: 'Jimmy',
  origin: '',
  strength: '',
  smoke_time: '',
  price_regular: '',
  price_special: '',
  stock: '',
  set_current: true,
};

export default function Cotm() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { cotm } = await adminApi.cotmList();
      setList(cotm || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function bind(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  function edit(row) {
    setForm({
      month: row.month,
      name: row.name || '',
      italic_word: row.italic_word || '',
      blurb: row.blurb || '',
      quote: row.quote || '',
      quote_by: row.quote_by || 'Jimmy',
      origin: row.origin || '',
      strength: row.strength || '',
      smoke_time: row.smoke_time || '',
      price_regular: row.price_regular ?? '',
      price_special: row.price_special ?? '',
      stock: row.stock ?? '',
      set_current: !!row.is_current,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      await adminApi.upsertCotm({
        ...form,
        price_regular: form.price_regular === '' ? null : Number(form.price_regular),
        price_special: form.price_special === '' ? null : Number(form.price_special),
        stock: form.stock === '' ? null : Number(form.stock),
      });
      setSuccess('Saved.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function setCurrent(id) {
    await adminApi.setCurrentCotm(id);
    load();
  }
  async function remove(id) {
    if (!confirm('Delete this pick from the archive?')) return;
    await adminApi.deleteCotm(id);
    load();
  }

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Pick of the month</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Cigar of the Month</h1>
        </div>
        <button type="button" onClick={() => setForm(EMPTY)} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>
          Clear form
        </button>
      </div>

      <form onSubmit={save} className="card" style={{ padding: 28, marginBottom: 36 }}>
        <h2 className="h3" style={{ marginBottom: 18 }}>Add or update a pick</h2>
        {error && <div style={{ color: 'var(--ember)', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'var(--leaf)', marginBottom: 12 }}>{success}</div>}
        <div className="form-grid">
          <div className="field-block">
            <label>Month (YYYY-MM)</label>
            <input required pattern="\d{4}-\d{2}" value={form.month} onChange={bind('month')} placeholder="2026-05" />
          </div>
          <div className="field-block">
            <label>Cigar name</label>
            <input required value={form.name} onChange={bind('name')} placeholder="Oliva Serie V Melanio" />
          </div>
          <div className="field-block">
            <label>Italic word in title (optional)</label>
            <input value={form.italic_word} onChange={bind('italic_word')} placeholder="Melanio" />
          </div>
          <div className="field-block">
            <label>Origin</label>
            <input value={form.origin} onChange={bind('origin')} placeholder="Nicaragua" />
          </div>
          <div className="field-block full">
            <label>Blurb</label>
            <textarea required rows={4} value={form.blurb} onChange={bind('blurb')} />
          </div>
          <div className="field-block">
            <label>Quote (optional)</label>
            <input value={form.quote} onChange={bind('quote')} placeholder="The one I keep on the shelf above the register." />
          </div>
          <div className="field-block">
            <label>Quote attribution</label>
            <input value={form.quote_by} onChange={bind('quote_by')} placeholder="Jimmy" />
          </div>
          <div className="field-block">
            <label>Strength</label>
            <input value={form.strength} onChange={bind('strength')} placeholder="Full" />
          </div>
          <div className="field-block">
            <label>Smoke time</label>
            <input value={form.smoke_time} onChange={bind('smoke_time')} placeholder="~75 min" />
          </div>
          <div className="field-block">
            <label>Regular price ($)</label>
            <input type="number" step="0.5" value={form.price_regular} onChange={bind('price_regular')} />
          </div>
          <div className="field-block">
            <label>Special price ($)</label>
            <input type="number" step="0.5" value={form.price_special} onChange={bind('price_special')} />
          </div>
          <div className="field-block">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={bind('stock')} />
          </div>
          <label className="full" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 6 }}>
            <input type="checkbox" checked={form.set_current} onChange={bind('set_current')} />
            <span>Make this the current pick on the homepage</span>
          </label>
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 20px' }}>
            {saving ? 'Saving…' : 'Save pick →'}
          </button>
        </div>
      </form>

      <h2 className="h3" style={{ marginBottom: 14 }}>Archive</h2>
      {loading && <div className="mute">Loading…</div>}
      {!loading && list.length === 0 && <p className="mute">No picks yet.</p>}
      {!loading && list.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Month</th>
                <th>Cigar</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="mono">{c.month}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div className="mute" style={{ fontSize: 12 }}>{c.origin || ''}{c.strength ? ' · ' + c.strength : ''}</div>
                  </td>
                  <td>
                    {c.price_special != null ? <span className="serif brass">${c.price_special}</span> : ''}
                    {c.price_regular != null ? <span className="mute" style={{ marginLeft: 6, fontSize: 12 }}>was ${c.price_regular}</span> : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>{c.stock ?? <span className="mute">—</span>}</td>
                  <td>
                    {c.is_current ? <span className="chip chip-leaf" style={{ fontSize: 10 }}>Current</span> : <span className="chip" style={{ fontSize: 10 }}>Archived</span>}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {!c.is_current && (
                      <button type="button" onClick={() => setCurrent(c.id)} style={{ background: 'transparent', border: 0, color: 'var(--brass)', cursor: 'pointer', fontSize: 13, marginRight: 12 }}>Make current</button>
                    )}
                    <button type="button" onClick={() => edit(c)} style={{ background: 'transparent', border: 0, color: 'var(--ink-mute)', cursor: 'pointer', fontSize: 13, marginRight: 12 }}>Edit</button>
                    <button type="button" onClick={() => remove(c.id)} style={{ background: 'transparent', border: 0, color: 'var(--ember)', cursor: 'pointer', fontSize: 13 }}>Delete</button>
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
