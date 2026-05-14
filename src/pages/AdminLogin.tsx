import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";

export default function AdminLogin() {
  const { signInWithGoogle } = useAuth();

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 space-y-6 text-center">
          <Link to="/" className="inline-block">
            <NeoLogo />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-teal-950">NeoHomeo operations</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              Sign in with the Google account that appears in <code className="bg-white/70 px-1 rounded">VITE_ADMIN_EMAILS</code>.
            </p>
          </div>
          {!isSupabaseConfigured() && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-2xl p-3">
              Configure Supabase in <code className="font-mono">.env</code> first.
            </p>
          )}
          <button
            type="button"
            disabled={!isSupabaseConfigured()}
            onClick={() => void signInWithGoogle().catch(console.error)}
            className="w-full flex items-center justify-center gap-3 bg-teal-600 text-white rounded-2xl py-3 font-semibold shadow hover:bg-teal-700 disabled:opacity-50"
          >
            Sign in with Google
          </button>
          <Link to="/login" className="text-sm text-teal-700 underline">
            Patient sign-in
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
