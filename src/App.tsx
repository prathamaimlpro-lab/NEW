import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Curriculum from './pages/Curriculum';
import LevelPage from './pages/Level';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import ProblemDetail from './pages/ProblemDetail';
import Explore from './pages/Explore';
import VisualizationPage from './pages/VisualizationPage';
import ProgressPage from './pages/Progress';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentAdmin from './pages/admin/ContentAdmin';
import CollectionAdmin from './pages/admin/CollectionAdmin';
import ContentStudio from './pages/admin/ContentStudio';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import ThemeAdmin from './pages/admin/ThemeAdmin';
import { getSession, signOut } from './services/authService';

/* Admin shell: completely separate from the learner AppLayout.
   Uses its own header + Outlet, so learner layout never wraps admin pages. */
function AdminShell() {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  if (!session) return <Navigate to="/admin" replace />;
  const allowed = session.role === 'super_admin' || session.role === 'content_admin' || session.role === 'reviewer';
  if (!allowed) return <Navigate to="/" replace />;

  const links: [string, string][] = [
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/content', 'Content'],
    ['/admin/collections', 'Collections'],
    ['/admin/studio', 'Studio'],
    ['/admin/settings', 'Settings'],
    ['/admin/theme', 'Theme'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'var(--color-primary)',
          borderBottom: '2px solid var(--border-strong)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <span
            style={{
              background: 'var(--danger)', color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '.05em',
            }}
          >
            ADMIN
          </span>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ color: '#fff' }}>← Site</Link>
          <span className="label-mono" style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            PIXEL · {session.role.toUpperCase()}
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Admin navigation">
          {links.map(([to, label]) => (
            <Link key={to} to={to} className={`btn btn-sm ${location.pathname === to ? 'btn-secondary' : 'btn-ghost'}`}>
              {label}
            </Link>
          ))}
          <button type="button" className="btn btn-sm btn-ghost" onClick={async () => { await signOut(); navigate('/admin'); }}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="page">
        <div className="page-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Learner app */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Curriculum />} />
        <Route path="learn/level/:levelId" element={<LevelPage />} />
        <Route path="learn/lesson/:lessonId" element={<Lesson />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/problems/:problemId" element={<ProblemDetail />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/viz/:vizId" element={<VisualizationPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="achievements" element={<Achievements />} />
      </Route>

      {/* Admin app — completely separate from learner shell */}
      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route element={<AdminShell />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="content" element={<ContentAdmin />} />
          <Route path="collections" element={<CollectionAdmin />} />
          <Route path="studio" element={<ContentStudio />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="theme" element={<ThemeAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
