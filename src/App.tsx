import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyRegistrationPage from './pages/VerifyRegistrationPage';
import Layout from './components/layout/Layout';
import NotFoundPage from './pages/NotFoundPage';
import { isAuthenticated } from './utils/auth';
import ArsipPage from './pages/ArsipPage';
import DetailArsipPage from './pages/DetailArsipPage';
import ProfilePage from './pages/ProfilePage';
import BuatArsipPage from './pages/BuatArsipPage';

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-registration" element={<VerifyRegistrationPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/arsip/:id" element={<DetailArsipPage />} />
          <Route path="/arsip" element={<ArsipPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/buat-arsip" element={<ProtectedRoute><BuatArsipPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
