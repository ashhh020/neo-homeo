import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/PatientDashboard";
import PatientOnboarding from "./pages/PatientOnboarding";
import DoctorApply from "./pages/DoctorApply";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DrNeo from "./pages/DrNeo";
import AuthCallback from "./pages/AuthCallback";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Redirect logged-in users who land on /login or /signup to their dashboard */
function GuestOnly({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user && profile) {
    if (profile.role === "admin") return <Navigate to="/admin" replace />;
    if (profile.role === "doctor") return <Navigate to="/doctor" replace />;
    if (!profile.onboarding_completed) return <Navigate to="/onboarding/patient" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/** Any authenticated user */
function SessionGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Authenticated patient who has completed onboarding */
function PatientOnboardingGate({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (profile?.role !== "patient") return <Navigate to="/login" replace />;
  if (!profile.onboarding_completed) return <Navigate to="/onboarding/patient" replace />;
  return <>{children}</>;
}

/** Admin only */
function AdminGate({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (profile?.role !== "admin") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

/** Doctor only */
function DoctorGate({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (profile?.role !== "doctor") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Guest-only auth pages */}
      <Route path="/login" element={<GuestOnly><PatientLogin /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><PatientSignup /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<GuestOnly><AdminLogin /></GuestOnly>} />

      {/* Patient onboarding (logged in, not yet done) */}
      <Route
        path="/onboarding/patient"
        element={
          <SessionGate>
            <PatientOnboarding />
          </SessionGate>
        }
      />

      {/* Patient dashboard + assessment */}
      <Route
        path="/dashboard"
        element={
          <SessionGate>
            <PatientOnboardingGate>
              <PatientDashboard />
            </PatientOnboardingGate>
          </SessionGate>
        }
      />
      <Route
        path="/assessment"
        element={
          <SessionGate>
            <PatientOnboardingGate>
              <DrNeo />
            </PatientOnboardingGate>
          </SessionGate>
        }
      />

      {/* Public doctor pages */}
      <Route path="/apply" element={<DoctorApply />} />
      <Route path="/doctors/:id" element={<DoctorProfile />} />
      <Route path="/doctor-signup" element={<Navigate to="/apply" replace />} />
      <Route path="/dr-neo" element={<Navigate to="/assessment" replace />} />

      {/* Doctor dashboard */}
      <Route
        path="/doctor"
        element={
          <SessionGate>
            <DoctorGate>
              <DoctorDashboard />
            </DoctorGate>
          </SessionGate>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <SessionGate>
            <AdminGate>
              <AdminDashboard />
            </AdminGate>
          </SessionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
