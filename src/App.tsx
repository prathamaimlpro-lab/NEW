import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Achievements from './pages/Achievements';
import Curriculum from './pages/Curriculum';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Level from './pages/Level';
import Lesson from './pages/Lesson';
import NotFound from './pages/NotFound';
import Practice from './pages/Practice';
import ProblemDetail from './pages/ProblemDetail';
import Profile from './pages/Profile';
import ProgressPage from './pages/Progress';
import VisualizationPage from './pages/VisualizationPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContentAdmin from './pages/admin/ContentAdmin';
import LessonEditor from './pages/admin/LessonEditor';
import CollectionAdmin from './pages/admin/CollectionAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import ThemeAdmin from './pages/admin/ThemeAdmin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Curriculum />} />
        <Route path="learn/level/:levelId" element={<Level />} />
        <Route path="learn/lesson/:lessonId" element={<Lesson />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/problems/:problemId" element={<ProblemDetail />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/viz/:vizId" element={<VisualizationPage />} />
      </Route>
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="content/lesson/:lessonId" element={<LessonEditor />} />
        <Route path="collections" element={<CollectionAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="theme" element={<ThemeAdmin />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
