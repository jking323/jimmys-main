import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Setup from './Setup.jsx';
import Dashboard from './Dashboard.jsx';
import EventsList from './EventsList.jsx';
import EventEditor from './EventEditor.jsx';
import EventRsvps from './EventRsvps.jsx';
import Cotm from './Cotm.jsx';
import Newsletter from './Newsletter.jsx';
import Cigars from './Cigars.jsx';
import CigarEditor from './CigarEditor.jsx';
import Imports from './Imports.jsx';
import Hours from './Hours.jsx';
import Photos from './Photos.jsx';

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await adminApi.me();
        setUser(me.user);
      } catch {
        // Not signed in — check whether anyone exists yet.
        try {
          const status = await adminApi.setupStatus();
          setNeedsSetup(!!status.needs_setup);
        } catch {
          // If setup-status fails too, fall through to the login page.
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div style={{ padding: 48, color: 'var(--ink-mute)' }}>Checking your badge…</div>;
  }

  if (!user) {
    if (needsSetup) {
      return <Setup onComplete={(u) => { setUser(u); setNeedsSetup(false); }} />;
    }
    return (
      <Routes>
        <Route path="login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout user={user} onLogout={() => setUser(null)} />}>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventEditor />} />
        <Route path="events/:id" element={<EventEditor />} />
        <Route path="events/:id/rsvps" element={<EventRsvps />} />
        <Route path="cigars" element={<Cigars />} />
        <Route path="cigars/:id" element={<CigarEditor />} />
        <Route path="inventory" element={<Imports />} />
        <Route path="cotm" element={<Cotm />} />
        <Route path="hours" element={<Hours />} />
        <Route path="photos" element={<Photos />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="login" element={<Navigate to=".." replace />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
