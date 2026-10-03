import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Curriculum from './pages/Curriculum';
import LevelPage from './pages/Level';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import ProblemDetail from './pages/ProblemDetail';
import ProgressPage from './pages/Progress';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentAdmin from './pages/admin/ContentAdmin';
import CollectionAdmin from './pages/admin/CollectionAdmin';
import ContentStudio from './pages/admin/ContentStudio';

const Explore = lazy(() => import('./pages/Explore'));
const VisualizationPage = lazy(() => import('./pages/VisualizationPage'));
const GraphPage = lazy(() => import('./pages/Graph'));
const ProjectsPage = lazy(() => import('./pages/Projects'));
const BooksPage = lazy(() => import('./pages/Books'));
const CommunityPage = lazy(() => import('./pages/Community'));
const CodingPage = lazy(() => import('./pages/Coding'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true" aria-label="Loading page">
      <div className="skel" style={{ height: 34, width: '45%' }} />
      <div className="skel" style={{ height: 220 }} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="learn" element={<Curriculum />} />
        <Route path="learn/level/:levelId" element={<LevelPage />} />
        <Route path="learn/lesson/:lessonId" element={<Lesson />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/problems/:problemId" element={<ProblemDetail />} />
        <Route path="coding" element={<Suspense fallback={<PageFallback />}><CodingPage /></Suspense>} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="explore" element={<Suspense fallback={<PageFallback />}><Explore /></Suspense>} />
        <Route path="explore/viz/:vizId" element={<Suspense fallback={<PageFallback />}><VisualizationPage /></Suspense>} />
        <Route path="graph" element={<Suspense fallback={<PageFallback />}><GraphPage /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<PageFallback />}><ProjectsPage /></Suspense>} />
        <Route path="books" element={<Suspense fallback={<PageFallback />}><BooksPage /></Suspense>} />
        <Route path="community" element={<Suspense fallback={<PageFallback />}><CommunityPage /></Suspense>} />
      </Route>

      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="content" element={<ContentAdmin />} />
          <Route path="collections" element={<CollectionAdmin />} />
          <Route path="studio" element={<ContentStudio />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
