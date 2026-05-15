import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api.js';

function Stat({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="eyebrow brass">{label}</div>
      <div className="serif" style={{ fontSize: 44, lineHeight: 1, marginTop: 8 }}>{value}</div>
      {sub && <div className="mute" style={{ fontSize: 13, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [subs, setSubs] = useState({ active_count: 0, unsubscribed_count: 0 });
  const [cotm, setCotm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.events().catch(() => ({ events: [] })),
      adminApi.subscribers().catch(() => ({ active_count: 0, unsubscribed_count: 0 })),
      adminApi.cotmCurrent().catch(() => ({ cotm: null })),
    ]).then(([e, s, c]) => {
      setEvents(e.events || []);
      setSubs(s);
      setCotm(c.cotm);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mute">Loading…</div>;

  const upcoming = events.filter((e) => new Date(e.start_at + 'Z') >= new Date()).slice(0, 5);
  const nextEvent = upcoming[0];

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="eyebrow brass">Today</div>
          <h1 className="h1" style={{ fontSize: 44, marginTop: 8 }}>Hi there.</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/events/new" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            New event <span>→</span>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Stat label="Upcoming events" value={upcoming.length} sub={nextEvent ? `Next: ${nextEvent.title}` : 'Calendar empty'} />
        <Stat label="Newsletter subs" value={subs.active_count} sub={`${subs.unsubscribed_count} unsubscribed`} />
        <Stat label="Cigar of the Month" value={cotm ? cotm.name.split(' ').slice(0, 2).join(' ') : '—'} sub={cotm ? `Month: ${cotm.month}` : 'Not set'} />
      </div>

      <div style={{ marginTop: 36 }}>
        <h2 className="h3" style={{ marginBottom: 14 }}>Next on the calendar</h2>
        {upcoming.length === 0 && <p className="mute">Nothing scheduled. <Link to="/admin/events/new" style={{ color: 'var(--brass)' }}>Add an event →</Link></p>}
        {upcoming.length > 0 && (
          <div className="card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>When</th>
                  <th>Title</th>
                  <th>Tag</th>
                  <th style={{ textAlign: 'right' }}>Seats</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="serif" style={{ fontSize: 18 }}>
                        {new Date(e.start_at + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="mute" style={{ fontSize: 12 }}>
                        {new Date(e.start_at + 'Z').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <Link to={`/admin/events/${e.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                        <div style={{ fontWeight: 500 }}>{e.title}</div>
                        <div className="mute" style={{ fontSize: 13 }}>{e.price_text}</div>
                      </Link>
                    </td>
                    <td>{e.tag ? <span className="chip" style={{ fontSize: 11 }}>{e.tag}</span> : <span className="mute">—</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      {e.seats_total == null ? <span className="mute">∞</span> : <span>{e.seats_left}/{e.seats_total}</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/events/${e.id}/rsvps`} style={{ color: 'var(--brass)', fontSize: 13, textDecoration: 'none' }}>RSVPs →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
