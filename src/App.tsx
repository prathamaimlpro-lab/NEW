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
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentAdmin from './pages/admin/ContentAdmin';
import CollectionAdmin from './pages/admin/CollectionAdmin';
import ContentStudio from './pages/admin/ContentStudio';
import { getSession, signOut } from './services/authService';

/* Self-contained admin shell: role guard + nav + outlet.
   Does not depend on AdminLayout internals, so admin routes always render. */
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
  ];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <header className="topbar">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <Link to="/" className="btn btn-ghost btn-sm">← Site</Link>
          <span className="label-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            PIXEL // CONTROL PLANE · {session.role}
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
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Curriculum />} />
        <Route path="/learn/level/:levelId" element={<LevelPage />} />
        <Route path="/learn/lesson/:lessonId" element={<Lesson />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/problems/:problemId" element={<ProblemDetail />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/viz/:vizId" element={<VisualizationPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="collections" element={<CollectionAdmin />} />
        <Route path="studio" element={<ContentStudio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
