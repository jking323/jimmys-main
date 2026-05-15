import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api.js';

const EMPTY = {
  title: '',
  blurb: '',
  start_at: '',
  end_at: '',
  price_text: 'Free',
  seats_total: '',
  tag: '',
  tag_kind: '',
  featured: false,
  published: true,
};

function toLocalDatetimeInput(iso) {
  if (!iso) return '';
  // D1 stores 'YYYY-MM-DD HH:MM:SS' — treat as UTC.
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInput(local) {
  if (!local) return null;
  return new Date(local).toISOString();
}

export default function EventEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) return;
    adminApi.event(id)
      .then(({ event }) => {
        setForm({
          title: event.title || '',
          blurb: event.blurb || '',
          start_at: toLocalDatetimeInput(event.start_at),
          end_at: toLocalDatetimeInput(event.end_at),
          price_text: event.price_text || 'Free',
          seats_total: event.seats_total ?? '',
          tag: event.tag || '',
          tag_kind: event.tag_kind || '',
          featured: !!event.featured,
          published: !!event.published,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function bind(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = {
      title: form.title,
      blurb: form.blurb,
      start_at: fromLocalDatetimeInput(form.start_at),
      end_at: form.end_at ? fromLocalDatetimeInput(form.end_at) : null,
      price_text: form.price_text || 'Free',
      seats_total: form.seats_total === '' ? null : Number(form.seats_total),
      tag: form.tag || null,
      tag_kind: form.tag_kind || null,
      featured: form.featured,
      published: form.published,
    };
    try {
      if (isNew) {
        await adminApi.createEvent(payload);
      } else {
        await adminApi.updateEvent(id, payload);
      }
      navigate('/admin/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mute">Loading event…</div>;

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">{isNew ? 'New event' : 'Edit event'}</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>
            {isNew ? 'On the calendar' : form.title || 'Untitled event'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/events" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>Cancel</Link>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            {saving ? 'Saving…' : 'Save event →'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--ember)', marginBottom: 14 }}>{error}</div>}

      <div className="card" style={{ padding: 28 }}>
        <div className="form-grid">
          <div className="field-block full">
            <label>Title</label>
            <input required value={form.title} onChange={bind('title')} placeholder="Padrón Pairing Night" />
          </div>
          <div className="field-block full">
            <label>Blurb</label>
            <textarea required rows={4} value={form.blurb} onChange={bind('blurb')} placeholder="What's happening — keep it warm and short." />
          </div>
          <div className="field-block">
            <label>Starts</label>
            <input required type="datetime-local" value={form.start_at} onChange={bind('start_at')} />
          </div>
          <div className="field-block">
            <label>Ends (optional)</label>
            <input type="datetime-local" value={form.end_at} onChange={bind('end_at')} />
          </div>
          <div className="field-block">
            <label>Price text</label>
            <input value={form.price_text} onChange={bind('price_text')} placeholder="$35 or Free" />
          </div>
          <div className="field-block">
            <label>Seats total (blank = unlimited)</label>
            <input type="number" min="0" value={form.seats_total} onChange={bind('seats_total')} placeholder="" />
          </div>
          <div className="field-block">
            <label>Tag (chip text)</label>
            <input value={form.tag} onChange={bind('tag')} placeholder="Featured / Weekly favorite" />
          </div>
          <div className="field-block">
            <label>Tag style</label>
            <select value={form.tag_kind} onChange={bind('tag_kind')}>
              <option value="">— none —</option>
              <option value="brass">Brass</option>
              <option value="leaf">Leaf (green)</option>
              <option value="ember">Ember (urgency)</option>
            </select>
          </div>
          <div className="full" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.featured} onChange={bind('featured')} />
              <span>Feature this event (replaces current featured)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={bind('published')} />
              <span>Publish to the public site</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
