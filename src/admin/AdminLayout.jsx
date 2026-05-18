import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Monogram } from '../components/primitives.jsx';
import { adminApi } from '../lib/api.js';

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  async function logout() {
    try { await adminApi.logout(); } catch {}
    onLogout?.();
    navigate('/admin/login', { replace: true });
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Monogram size={36} />
          <div style={{ lineHeight: 1.1 }}>
            <div className="serif" style={{ fontSize: 20 }}>Jimmy's</div>
            <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 3 }}>Back of house</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          <NavLink to="/admin/events" className={({ isActive }) => (isActive ? 'active' : '')}>Events</NavLink>
          <NavLink to="/admin/cigars" className={({ isActive }) => (isActive ? 'active' : '')}>Humidor</NavLink>
          <NavLink to="/admin/cotm" className={({ isActive }) => (isActive ? 'active' : '')}>Cigar of the Month</NavLink>
          <NavLink to="/admin/hours" className={({ isActive }) => (isActive ? 'active' : '')}>Hours</NavLink>
          <NavLink to="/admin/photos" className={({ isActive }) => (isActive ? 'active' : '')}>Site photos</NavLink>
          <NavLink to="/admin/location" className={({ isActive }) => (isActive ? 'active' : '')}>Map &amp; location</NavLink>
          <NavLink to="/admin/newsletter" className={({ isActive }) => (isActive ? 'active' : '')}>Newsletter</NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>POS sync</NavLink>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--ink)' }}>{user.name}</div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginTop: 2 }}>{user.role}</div>
          <button type="button" onClick={logout} className="btn btn-ghost" style={{ marginTop: 12, padding: '8px 14px', fontSize: 13, width: '100%', justifyContent: 'center' }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
