import { Link, useSearchParams } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";

export default function PatientLogin() {
  const { signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const err = params.get("error");

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 space-y-6 text-center">
          <Link to="/" className="inline-block">
            <NeoLogo />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-teal-950">Sign in to NeoHomeo</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              Continue with Google. After first sign-in you will complete your health profile before the dashboard and
              Dr. Neo unlock.
            </p>
          </div>
          {!isSupabaseConfigured() && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-2xl p-3 text-left space-y-2">
              <span className="block">
                Supabase env is missing or still has <strong>template placeholders</strong>. In{" "}
                <code className="font-mono">.env</code> use exactly{" "}
                <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>{" "}
                (must start with <code className="font-mono">VITE_</code>), then <strong>save the file</strong> and restart{" "}
                <code className="font-mono">npm run dev</code>.
              </span>
              <span className="block text-xs text-amber-900/80">
                Tip: run <code className="font-mono">grep &apos;^VITE_SUPABASE&apos; .env</code> in the project folder — if you still see{" "}
                <code className="font-mono">YOUR_SUPABASE_…</code>, the real keys are not saved to disk yet.
              </span>
            </p>
          )}
          {err === "supabase" && (
            <p className="text-sm text-red-600">Supabase is not configured. Check your environment file.</p>
          )}
          <button
            type="button"
            disabled={!isSupabaseConfigured()}
            onClick={() => void signInWithGoogle().catch(console.error)}
            className="w-full flex items-center justify-center gap-3 bg-white border border-teal-100 rounded-2xl py-3 font-semibold text-teal-950 shadow hover:bg-teal-50 disabled:opacity-50"
          >
            <span className="text-lg">G</span>
            Continue with Google
          </button>
          <p className="text-xs text-teal-800/60">
            Clinicians applying to the network use the public <Link className="underline text-teal-700" to="/apply">doctor application</Link>.
          </p>
          <p className="text-xs text-teal-800/60">
            Operations team: use the same Google button if your email is listed in{" "}
            <code className="bg-white/70 px-1 rounded">VITE_ADMIN_EMAILS</code> — you will be routed to the admin console.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
