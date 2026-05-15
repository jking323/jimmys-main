import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import EventsList from './EventsList.jsx';
import EventEditor from './EventEditor.jsx';
import EventRsvps from './EventRsvps.jsx';
import Cotm from './Cotm.jsx';
import Newsletter from './Newsletter.jsx';

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 48, color: 'var(--ink-mute)' }}>Checking your badge…</div>;
  }

  if (!user) {
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
        <Route path="cotm" element={<Cotm />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="login" element={<Navigate to=".." replace />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
}
