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
import Profile from './pages/Profile';
import ProgressPage from './pages/Progress';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Curriculum />} />
        <Route path="learn/level/:levelId" element={<Level />} />
        <Route path="learn/lesson/:lessonId" element={<Lesson />} />
        <Route path="practice" element={<Practice />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="explore" element={<Explore />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
