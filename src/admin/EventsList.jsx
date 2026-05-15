import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api.js';

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'Z');
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.events();
      setEvents(data.events || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('Delete this event? RSVPs will be removed too.')) return;
    await adminApi.deleteEvent(id);
    load();
  }

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Calendar</div>
          <h1 className="h1" style={{ fontSize: 40, marginTop: 8 }}>Events</h1>
        </div>
        <Link to="/admin/events/new" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          New event <span>→</span>
        </Link>
      </div>

      {error && <div style={{ color: 'var(--ember)' }}>{error}</div>}
      {loading && <div className="mute">Loading…</div>}

      {!loading && events.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <p className="mute" style={{ marginBottom: 14 }}>No events yet.</p>
          <Link to="/admin/events/new" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>Add your first one</Link>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>When</th>
                <th>Price</th>
                <th style={{ textAlign: 'right' }}>Seats</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link to={`/admin/events/${e.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                      <div style={{ fontWeight: 500 }}>
                        {e.title}
                        {e.featured ? <span className="chip chip-brass" style={{ marginLeft: 8, fontSize: 10 }}>Featured</span> : null}
                      </div>
                      <div className="mute" style={{ fontSize: 12 }}>{e.tag || ''}</div>
                    </Link>
                  </td>
                  <td>{formatWhen(e.start_at)}</td>
                  <td>{e.price_text}</td>
                  <td style={{ textAlign: 'right' }}>
                    {e.seats_total == null ? <span className="mute">∞</span> : <span>{e.seats_left}/{e.seats_total}</span>}
                  </td>
                  <td>
                    <span className={`chip ${e.published ? 'chip-leaf' : 'chip-ember'}`} style={{ fontSize: 10 }}>
                      {e.published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/events/${e.id}/rsvps`} style={{ color: 'var(--brass)', fontSize: 13, textDecoration: 'none', marginRight: 14 }}>RSVPs</Link>
                    <Link to={`/admin/events/${e.id}`} style={{ color: 'var(--ink-mute)', fontSize: 13, textDecoration: 'none', marginRight: 14 }}>Edit</Link>
                    <button type="button" onClick={() => remove(e.id)} style={{ background: 'transparent', border: 0, color: 'var(--ember)', cursor: 'pointer', fontSize: 13 }}>Delete</button>
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
