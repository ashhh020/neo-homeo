import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";

export default function PatientLogin() {
  const { signInWithEmail } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const errParam = params.get("error");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      // refreshProfile is called inside signInWithEmail; profile state updates async.
      // Navigate to callback to let role-routing decide the right page.
      nav("/auth/callback", { replace: true });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Sign-in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-block mb-4">
              <NeoLogo />
            </Link>
            <h1 className="text-2xl font-semibold text-teal-950">Sign in to NeoHomeo</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              Enter your email and password to continue.
            </p>
          </div>

          {errParam === "supabase" && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">
              Supabase is not configured. Check your environment file.
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-teal-900">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="you@example.com"
              />
            </label>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-teal-900">Password</span>
              <Link to="/forgot-password" className="text-xs text-teal-600 hover:text-teal-800 underline">
                Forgot password?
              </Link>
            </div>
            <label className="block text-sm font-medium text-teal-900">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="••••••••"
              />
            </label>

            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl shadow transition"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="text-center space-y-2 text-sm text-teal-800/70">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-teal-700 underline">
                Sign up
              </Link>
            </p>
            <p>
              Admin?{" "}
              <Link to="/admin/login" className="text-teal-600 underline">
                Admin login
              </Link>
            </p>
            <p>
              Clinician?{" "}
              <Link to="/apply" className="text-teal-600 underline">
                Apply to join
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
