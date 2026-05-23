import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";

export default function PatientSignup() {
  const { signUpWithEmail } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(email.trim(), password, fullName.trim());
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
      } else {
        nav("/auth/callback", { replace: true });
      }
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel p-8 space-y-6 text-center">
            <Link to="/" className="inline-block">
              <NeoLogo />
            </Link>
            <div className="text-6xl">📬</div>
            <h1 className="text-2xl font-semibold text-teal-950">Check your email</h1>
            <p className="text-sm text-teal-900/70">
              We sent a confirmation link to <strong>{email}</strong>. Click the link in that email
              to activate your account, then sign in here.
            </p>
            <Link
              to="/login"
              className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-2xl shadow text-center transition"
            >
              Go to sign in
            </Link>
            <p className="text-xs text-teal-800/50">
              Tip: ask your admin to disable email confirmation in Supabase Dashboard → Authentication → Settings for instant access.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md glass-panel p-8 space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-block mb-4">
              <NeoLogo />
            </Link>
            <h1 className="text-2xl font-semibold text-teal-950">Create your account</h1>
            <p className="text-sm text-teal-900/65 mt-2">
              Join NeoHomeo and start your healing journey.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-teal-900">
              Full name
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="Your full name"
              />
            </label>

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

            <label className="block text-sm font-medium text-teal-900">
              Password
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="At least 6 characters"
              />
            </label>

            <label className="block text-sm font-medium text-teal-900">
              Confirm password
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="Re-enter password"
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-teal-800/70">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-teal-700 underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-teal-800/50">
            Clinicians joining the network use the{" "}
            <Link to="/apply" className="underline text-teal-600">
              doctor application
            </Link>{" "}
            form.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
