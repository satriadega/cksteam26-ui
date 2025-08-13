import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyRegistrationPage from "./pages/VerifyRegistrationPage";
import Layout from "./components/layout/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import { isAuthenticated } from "./utils/auth";
import ArsipPage from "./pages/ArsipPage";
import DetailArsipPage from "./pages/DetailArsipPage";
import ProfilePage from "./pages/ProfilePage";
import BuatArsipPage from "./pages/BuatArsipPage";
import TambahPengetahuanPage from "./pages/TambahPengetahuanPage";
import BuatOrganisasiPage from "./pages/BuatOrganisasiPage";
import UpdateOrganisasiPage from "./pages/UpdateOrganisasiPage";
import ListAppliancePage from "./pages/ListAppliancePage";
import ListVerifierPage from "./pages/ListVerifierPage";
import VerifyPengetahuanPage from "./pages/VerifyPengetahuanPage";
import Modal from "./components/Modal";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProfile } from "./store/userSlice";
import type { AppDispatch } from "./store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (isAuthenticated()) {
      dispatch(getProfile());
    }
  }, [dispatch]);
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Modal />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/verify-registration"
            element={<VerifyRegistrationPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/arsip/:id" element={<DetailArsipPage />} />
          <Route path="/arsip" element={<ArsipPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buat-arsip"
            element={
              <ProtectedRoute>
                <BuatArsipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tambah-pengetahuan"
            element={
              <ProtectedRoute>
                <TambahPengetahuanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buat-organisasi"
            element={
              <ProtectedRoute>
                <BuatOrganisasiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perbarui-organisasi"
            element={
              <ProtectedRoute>
                <UpdateOrganisasiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list-appliance"
            element={
              <ProtectedRoute>
                <ListAppliancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list-verifier"
            element={
              <ProtectedRoute>
                <ListVerifierPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-pengetahuan/:annotationId"
            element={
              <ProtectedRoute>
                <VerifyPengetahuanPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
