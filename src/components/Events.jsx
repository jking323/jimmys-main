import { useEffect, useState } from 'react';
import { HandArrow, Photo, SectionHead } from './primitives.jsx';
import { mediaUrl, publicApi } from '../lib/api.js';

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(d) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m === 0 ? '' : ':' + m.toString().padStart(2, '0');
  return `${h12}${mm} ${ampm}`;
}

function asUtcDate(s) {
  if (!s) return null;
  return new Date(s.includes('Z') ? s : s + 'Z');
}

function eventTimeLabel(event) {
  const start = asUtcDate(event.start_at);
  if (!start) return '';
  if (event.end_at) {
    const end = asUtcDate(event.end_at);
    return `${formatTime(start)} — ${formatTime(end)}`;
  }
  return `${formatTime(start)} — late`;
}

function eventDateParts(event) {
  const d = asUtcDate(event.start_at);
  if (!d) return { m: '', d: '', day: '' };
  return { m: MONTH_ABBR[d.getMonth()], d: d.getDate(), day: DAY_NAME[d.getDay()] };
}

function RsvpForm({ event, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.includes('@')) return;
    setBusy(true);
    setError(null);
    try {
      await publicApi.rsvp(event.id, { name: name.trim(), email: email.trim(), party_size: Number(partySize) || 1, note: note.trim() || null });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Could not save your RSVP. Try again or call us.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: 24, background: 'var(--bg-elev)', borderRadius: 14, border: '1px solid var(--line)', marginTop: 16 }}>
        <div className="hand brass" style={{ fontSize: 30, lineHeight: 1 }}>You're on the list.</div>
        <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>We'll save you a seat. See you {eventDateParts(event).day}.</p>
        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ marginTop: 12, padding: '8px 14px', fontSize: 13 }}>Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ padding: 18, background: 'var(--bg-elev)', borderRadius: 14, border: '1px solid var(--line)', marginTop: 16, display: 'grid', gap: 10 }}>
      <div className="eyebrow brass">RSVP — {event.title}</div>
      <div className="field"><input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <div className="field"><input type="number" min={1} max={12} value={partySize} onChange={(e) => setPartySize(e.target.value)} /></div>
        <div className="field"><input placeholder="Anything we should know? (optional)" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
      {error && <div style={{ color: 'var(--ember)', fontSize: 13 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>Cancel</button>
        <button type="submit" disabled={busy} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
          {busy ? 'Saving…' : 'Save my seat →'}
        </button>
      </div>
    </form>
  );
}

function EventCard({ event, featured = false }) {
  const [showRsvp, setShowRsvp] = useState(false);
  const date = eventDateParts(event);
  const time = eventTimeLabel(event);
  const chipClass = { brass: 'chip-brass', leaf: 'chip-leaf', ember: 'chip-ember' }[event.tag_kind] || 'chip';

  if (featured) {
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0 }}>
        <div style={{ position: 'relative', minHeight: 380, borderRight: '1px solid var(--line)' }}>
          {event.photo_path ? (
            <img
              src={mediaUrl(event.photo_path)}
              alt={event.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
            />
          ) : (
            <Photo label="Featured event photo" sub={event.title} style={{ height: '100%', minHeight: 380, borderRadius: 0, border: 'none' }} />
          )}
          {event.tag && (
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
              <span className={`chip ${chipClass}`} style={{ background: 'var(--bg)', fontSize: 11, padding: '6px 13px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                {event.tag}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: '36px 36px 32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="eyebrow brass" style={{ fontSize: 10 }}>{date.m}</div>
              <div className="serif" style={{ fontSize: 64, lineHeight: 0.9 }}>{date.d}</div>
            </div>
            <div style={{ paddingBottom: 8 }}>
              <div className="mute" style={{ fontSize: 14 }}>{date.day}</div>
              <div className="mute" style={{ fontSize: 14 }}>{time}</div>
            </div>
          </div>
          <h3 className="h2" style={{ fontSize: 42, lineHeight: 1, marginBottom: 14 }}>{event.title}</h3>
          <p style={{ color: 'var(--ink-mute)', fontSize: 16, lineHeight: 1.55, margin: 0 }}>{event.blurb}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto', paddingTop: 28, flexWrap: 'wrap' }}>
            <span className="serif brass" style={{ fontSize: 24 }}>{event.price_text}</span>
            {event.seats_left != null && (
              <span className="chip chip-ember" style={{ fontSize: 11 }}>
                <span className="dot" style={{ background: 'var(--ember)' }}></span>
                {event.seats_left} seats left
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button type="button" onClick={() => setShowRsvp((v) => !v)} className="btn btn-primary" style={{ padding: '12px 22px' }}>
              {showRsvp ? 'Hide form' : 'RSVP'} <span>→</span>
            </button>
          </div>
          {showRsvp && <RsvpForm event={event} onClose={() => setShowRsvp(false)} />}
        </div>
      </div>
    );
  }
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div>
            <div className="eyebrow brass" style={{ fontSize: 10 }}>{date.m}</div>
            <div className="serif" style={{ fontSize: 40, lineHeight: 0.9 }}>{date.d}</div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div className="mute" style={{ fontSize: 12 }}>{date.day}</div>
            <div className="mute" style={{ fontSize: 12 }}>{time}</div>
          </div>
        </div>
        {event.tag && <span className={`chip ${chipClass}`} style={{ fontSize: 10 }}>{event.tag}</span>}
      </div>
      <div>
        <h3 className="h3">{event.title}</h3>
        <p style={{ color: 'var(--ink-mute)', fontSize: 14, lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>{event.blurb}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--line)', marginTop: 'auto' }}>
        <span className="serif brass" style={{ fontSize: 20 }}>{event.price_text}</span>
        <button type="button" onClick={() => setShowRsvp((v) => !v)} style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--ink)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {showRsvp ? 'Hide' : 'RSVP'} <HandArrow width={36} />
        </button>
      </div>
      {showRsvp && <RsvpForm event={event} onClose={() => setShowRsvp(false)} />}
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.events()
      .then((data) => setEvents(data.events || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const featured = events.find((e) => e.featured) || events[0];
  const rest = events.filter((e) => e.id !== featured?.id);

  return (
    <section id="events" className="section section-divider" style={{ background: 'var(--bg-elev)' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="On the calendar"
          title="What's coming up"
          scribble="grab a seat early"
          lead="Pairing nights, open mics, the occasional rep visit. Most are free; RSVPs help us pour enough."
        />

        {loading && <p className="mute">Loading the calendar…</p>}
        {error && <p style={{ color: 'var(--ember)' }}>Couldn't load events: {error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="mute">Nothing on the books just yet. Check back soon.</p>
        )}

        {featured && <EventCard event={featured} featured={true} />}

        {rest.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginTop: 18 }} className="event-grid">
            {rest.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 880px) {
          .event-grid { grid-template-columns: 1fr !important; }
          #events .card[style*="gridTemplateColumns: 1.1fr 1fr"], #events .card[style*="grid-template-columns: 1.1fr"] {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
