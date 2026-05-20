import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { signInWithEmail } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      nav("/auth/callback", { replace: true });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Sign-in failed.");
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
            <h1 className="text-2xl font-semibold text-teal-950">NeoHomeo Operations</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              Sign in with your admin account email and password.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-teal-900">
              Admin email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="admin@yourdomain.com"
              />
            </label>

            <label className="block text-sm font-medium text-teal-900">
              Password
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
              className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl shadow transition"
            >
              {loading ? "Signing in…" : "Sign in as admin"}
            </button>
          </form>

          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-xs text-teal-800/70 space-y-1">
            <p className="font-semibold text-teal-900">Admin access note</p>
            <p>
              Your email must be listed in{" "}
              <code className="bg-white/70 px-1 rounded">VITE_ADMIN_EMAILS</code> in the{" "}
              <code className="bg-white/70 px-1 rounded">.env</code> file, or your account must have
              the admin role in the database.
            </p>
          </div>

          <Link to="/login" className="block text-center text-sm text-teal-700 underline">
            Patient sign-in
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
