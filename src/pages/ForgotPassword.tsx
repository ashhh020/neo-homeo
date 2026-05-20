import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel p-8 space-y-6 text-center">
            <Link to="/" className="inline-block"><NeoLogo /></Link>
            <div className="text-6xl">📬</div>
            <h1 className="text-2xl font-semibold text-teal-950">Check your email</h1>
            <p className="text-sm text-teal-900/70">
              We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
            </p>
            <Link to="/login" className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-2xl text-center transition">
              Back to sign in
            </Link>
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
            <Link to="/" className="inline-block mb-4"><NeoLogo /></Link>
            <h1 className="text-2xl font-semibold text-teal-950">Reset your password</h1>
            <p className="text-sm text-teal-900/65 mt-2">Enter your email and we'll send you a reset link.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-teal-900">
              Email
              <input
                type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                placeholder="you@example.com"
              />
            </label>
            {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">{err}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl shadow transition">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="text-center text-sm text-teal-800/70">
            Remember it? <Link to="/login" className="font-semibold text-teal-700 underline">Sign in</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
