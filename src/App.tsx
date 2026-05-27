import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Eagerly load tiny/auth pages
import Landing from "./pages/Landing";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import AdminLogin from "./pages/AdminLogin";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";

// Lazy load heavy pages
const PatientDashboard  = lazy(() => import("./pages/PatientDashboard"));
const PatientOnboarding = lazy(() => import("./pages/PatientOnboarding"));
const DoctorApply       = lazy(() => import("./pages/DoctorApply"));
const AdminDashboard    = lazy(() => import("./pages/AdminDashboard"));
const DrNeo             = lazy(() => import("./pages/DrNeo"));
const DoctorDashboard   = lazy(() => import("./pages/DoctorDashboard"));
const DoctorProfile     = lazy(() => import("./pages/DoctorProfile"));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function LazyBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </ErrorBoundary>
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

const PAGE_TITLES: Record<string, string> = {
  "/":                    "NeoHomeo — AI-Powered Homeopathic Care",
  "/login":               "Login — NeoHomeo",
  "/signup":              "Sign Up — NeoHomeo",
  "/forgot-password":     "Reset Password — NeoHomeo",
  "/dashboard":           "My Dashboard — NeoHomeo",
  "/assessment":          "Dr. Neo Assessment — NeoHomeo",
  "/onboarding/patient":  "Complete Your Profile — NeoHomeo",
  "/apply":               "Apply as a Doctor — NeoHomeo",
  "/doctor":              "Doctor Dashboard — NeoHomeo",
  "/admin":               "Admin Dashboard — NeoHomeo",
  "/admin/login":         "Admin Login — NeoHomeo",
};

function PageTitleSetter() {
  const { pathname } = useLocation();
  useEffect(() => {
    const exact = PAGE_TITLES[pathname];
    if (exact) {
      document.title = exact;
      return;
    }
    // dynamic routes like /doctors/:id
    if (pathname.startsWith("/doctors/")) {
      document.title = "Doctor Profile — NeoHomeo";
    } else {
      document.title = "NeoHomeo — AI-Powered Homeopathic Care";
    }
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<PageTitleSetter />} />
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Guest-only auth pages */}
      <Route path="/login" element={<GuestOnly><PatientLogin /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><PatientSignup /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<GuestOnly><AdminLogin /></GuestOnly>} />

      {/* Patient onboarding */}
      <Route
        path="/onboarding/patient"
        element={
          <SessionGate>
            <LazyBoundary><PatientOnboarding /></LazyBoundary>
          </SessionGate>
        }
      />

      {/* Patient dashboard + assessment */}
      <Route
        path="/dashboard"
        element={
          <SessionGate>
            <PatientOnboardingGate>
              <LazyBoundary><PatientDashboard /></LazyBoundary>
            </PatientOnboardingGate>
          </SessionGate>
        }
      />
      <Route
        path="/assessment"
        element={
          <SessionGate>
            <PatientOnboardingGate>
              <LazyBoundary><DrNeo /></LazyBoundary>
            </PatientOnboardingGate>
          </SessionGate>
        }
      />

      {/* Public doctor pages */}
      <Route path="/apply" element={<LazyBoundary><DoctorApply /></LazyBoundary>} />
      <Route path="/doctors/:id" element={<LazyBoundary><DoctorProfile /></LazyBoundary>} />
      <Route path="/doctor-signup" element={<Navigate to="/apply" replace />} />
      <Route path="/dr-neo" element={<Navigate to="/assessment" replace />} />

      {/* Doctor dashboard */}
      <Route
        path="/doctor"
        element={
          <SessionGate>
            <DoctorGate>
              <LazyBoundary><DoctorDashboard /></LazyBoundary>
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
              <LazyBoundary><AdminDashboard /></LazyBoundary>
            </AdminGate>
          </SessionGate>
        }
      />

      {/* Legal pages */}
      <Route path="/legal/:slug" element={<Legal />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
