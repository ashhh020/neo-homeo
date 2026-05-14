import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isAdminEmail } from "./lib/env";
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

function SessionGate({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-800">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PatientOnboardingGate({ children }: { children: ReactNode }) {
  const { loading, profile, user } = useAuth();
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-teal-800">Loading…</div>;
  if (profile?.role !== "patient") return <>{children}</>;
  if (!profile.onboarding_completed) {
    return <Navigate to="/onboarding/patient" replace />;
  }
  return <>{children}</>;
}

function AdminGate({ children }: { children: ReactNode }) {
  const { loading, profile, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-800">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  const admin = profile?.role === "admin" || isAdminEmail(user.email ?? "");
  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-[#F2F4F7]">
        <p className="text-teal-900 max-w-md">
          This account is not an operations admin. Add your Google email to{" "}
          <code className="bg-white/80 px-2 py-1 rounded">VITE_ADMIN_EMAILS</code> in{" "}
          <code className="bg-white/80 px-2 py-1 rounded">.env</code>, sign out and sign in again, or set{" "}
          <code className="bg-white/80 px-2 py-1 rounded">role = admin</code> on your row in Supabase{" "}
          <code className="bg-white/80 px-2 py-1 rounded">profiles</code>.
        </p>
        <a className="text-teal-600 underline" href="/">
          Back home
        </a>
      </div>
    );
  }
  return <>{children}</>;
}

function DoctorGate({ children }: { children: ReactNode }) {
  const { loading, profile, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-800">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== "doctor") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-teal-900 max-w-md">This area is for verified clinicians. Use the same Google email as your approved directory listing.</p>
        <a className="text-teal-600 underline" href="/">
          Home
        </a>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={<PatientLogin />} />
      <Route path="/signup" element={<PatientSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/onboarding/patient"
        element={
          <SessionGate>
            <PatientOnboarding />
          </SessionGate>
        }
      />
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
      <Route path="/apply" element={<DoctorApply />} />
      <Route path="/doctor-signup" element={<Navigate to="/apply" replace />} />
      <Route path="/dr-neo" element={<Navigate to="/assessment" replace />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
