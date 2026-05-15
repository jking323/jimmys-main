import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api.js';

export default function EventRsvps() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.rsvps(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mute">Loading RSVPs…</div>;
  if (error) return <div style={{ color: 'var(--ember)' }}>{error}</div>;

  const { event, rsvps, confirmed_count } = data;

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">RSVPs</div>
          <h1 className="h1" style={{ fontSize: 36, marginTop: 8 }}>{event.title}</h1>
          <p className="mute" style={{ marginTop: 6, fontSize: 14 }}>
            {confirmed_count} confirmed{event.seats_total ? ` of ${event.seats_total} seats` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/admin/events/${id}`} className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 14 }}>Edit event</Link>
          <a href={`/api/admin/events/${id}/rsvps?format=csv`} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            Export CSV <span>↓</span>
          </a>
        </div>
      </div>

      {rsvps.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <p className="mute">No RSVPs yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: 'right' }}>Party</th>
                <th>Note</th>
                <th>Status</th>
                <th>RSVP'd</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><a href={`mailto:${r.email}`} style={{ color: 'var(--brass)', textDecoration: 'none' }}>{r.email}</a></td>
                  <td>{r.phone || <span className="mute">—</span>}</td>
                  <td style={{ textAlign: 'right' }}>{r.party_size}</td>
                  <td style={{ maxWidth: 240, color: 'var(--ink-mute)' }}>{r.note || ''}</td>
                  <td>
                    <span className={`chip ${r.status === 'confirmed' ? 'chip-leaf' : 'chip-ember'}`} style={{ fontSize: 10 }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="mute" style={{ fontSize: 12 }}>
                    {new Date(r.created_at + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
