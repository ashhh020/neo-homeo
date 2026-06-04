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
const StudentPortal     = lazy(() => import("./pages/StudentPortal"));

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

type PageMeta = { title: string; description: string };

const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "NeoHomeo — AI-Powered Homeopathy Consultations Online",
    description: "Connect with verified homeopathic doctors through AI-assisted assessments. NeoHomeo matches your symptoms to the right physician for personalised care.",
  },
  "/login": {
    title: "Login — NeoHomeo",
    description: "Log in to your NeoHomeo patient account to view your consultations, prescriptions, and health records.",
  },
  "/signup": {
    title: "Create Account — NeoHomeo",
    description: "Sign up for NeoHomeo and start your AI-assisted homeopathic assessment today. Free to join.",
  },
  "/forgot-password": {
    title: "Reset Password — NeoHomeo",
    description: "Reset your NeoHomeo account password.",
  },
  "/dashboard": {
    title: "My Dashboard — NeoHomeo",
    description: "View your appointments, prescriptions, and health history on your NeoHomeo dashboard.",
  },
  "/assessment": {
    title: "AI Health Assessment — NeoHomeo",
    description: "Start a guided AI assessment with Dr. Neo. Your symptom history is prepared for your homeopathic doctor before the consultation.",
  },
  "/onboarding/patient": {
    title: "Complete Your Profile — NeoHomeo",
    description: "Set up your NeoHomeo patient profile to get matched with the right homeopathic doctor.",
  },
  "/apply": {
    title: "Join NeoHomeo as a Doctor — Apply Now",
    description: "Are you a licensed homeopathic practitioner? Apply to join NeoHomeo and consult patients online. Verified, flexible, and fully digital.",
  },
  "/doctor": {
    title: "Doctor Dashboard — NeoHomeo",
    description: "Manage your appointments, patient cases, and prescriptions on the NeoHomeo doctor dashboard.",
  },
  "/admin": {
    title: "Admin Dashboard — NeoHomeo",
    description: "NeoHomeo operations panel.",
  },
  "/admin/login": {
    title: "Admin Login — NeoHomeo",
    description: "NeoHomeo operations login.",
  },
  "/legal/privacy": {
    title: "Privacy Policy — NeoHomeo",
    description: "Read NeoHomeo's privacy policy — how we collect, use, and protect your personal and health data.",
  },
  "/legal/terms": {
    title: "Terms of Use — NeoHomeo",
    description: "Read the terms and conditions for using the NeoHomeo platform.",
  },
  "/legal/disclaimer": {
    title: "Medical Disclaimer — NeoHomeo",
    description: "Important information about the limitations of AI-assisted intake and homeopathic care on NeoHomeo.",
  },
  "/legal/refund": {
    title: "Refund Policy — NeoHomeo",
    description: "NeoHomeo's refund and cancellation policy for consultations and medicine orders.",
  },
};

function setMetaDescription(content: string) {
  let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.name = "description";
    document.head.appendChild(el);
  }
  el.content = content;
}

function PageTitleSetter() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = PAGE_META[pathname];
    if (meta) {
      document.title = meta.title;
      setMetaDescription(meta.description);
      return;
    }
    if (pathname.startsWith("/doctors/")) {
      document.title = "Doctor Profile — NeoHomeo";
      setMetaDescription("View this verified homeopathic doctor's profile, specialisations, and book a consultation on NeoHomeo.");
    } else if (pathname.startsWith("/legal/")) {
      document.title = "Legal — NeoHomeo";
      setMetaDescription("NeoHomeo legal information.");
    } else {
      document.title = "NeoHomeo — AI-Powered Homeopathy Consultations Online";
      setMetaDescription("Connect with verified homeopathic doctors through AI-assisted assessments on NeoHomeo.");
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

      {/* Public pages */}
      <Route path="/student" element={<LazyBoundary><StudentPortal /></LazyBoundary>} />
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
