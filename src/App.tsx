import { Navigate, Route, Routes } from 'react-router-dom';
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
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentAdmin from './pages/admin/ContentAdmin';
import CollectionAdmin from './pages/admin/CollectionAdmin';
import ContentStudio from './pages/admin/ContentStudio';

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
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="collections" element={<CollectionAdmin />} />
        <Route path="studio" element={<ContentStudio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
