import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { changes } from '../data/seed';
import { daysUntil } from '../lib/dates';
import { useCanon } from '../store/useCanon';

const links = [
  { to: '/', label: 'Brain' },
  { to: '/publications', label: 'Publications' },
  { to: '/watch', label: 'Horizon' },
];

export function AppShell() {
  const selectedChangeId = useCanon((s) => s.selectedChangeId);
  const resetDemo = useCanon((s) => s.resetDemo);
  const navigate = useNavigate();
  const change = changes.find((c) => c.id === selectedChangeId) ?? changes[0];
  const days = daysUntil(change.in_force_at);
  const count =
    days > 1 ? `${days} days to commencement` : days === 1 ? '1 day to commencement' : 'In force';

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Jarvis</span>
        </div>
        <nav className="top-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          <div className="countdown">
            <strong>{count}</strong>
          </div>
          <button
            onClick={() => {
              resetDemo();
              navigate('/');
            }}
          >
            Reset demo
          </button>
        </div>
      </header>
      <Outlet />
      <nav className="tabbar" aria-label="Primary mobile">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
