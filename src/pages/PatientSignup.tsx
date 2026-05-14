import { Navigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";

export default function PatientSignup() {
  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel p-8 max-w-md text-center space-y-4">
          <NeoLogo />
          <p className="text-teal-900/80">NeoHomeo uses Google sign-in for patients.</p>
          <Navigate to="/login" replace />
        </div>
      </div>
    </PageShell>
  );
}
