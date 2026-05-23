import { useState, type FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { getSupabase } from "../lib/supabase";

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase handles the hash fragment automatically on load
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
      else setErr("Invalid or expired reset link. Please request a new one.");
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => nav("/login", { replace: true }), 2500);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md glass-panel p-8 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <h1 className="text-2xl font-semibold text-teal-950">Password updated!</h1>
            <p className="text-sm text-teal-900/70">Redirecting you to sign in…</p>
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
            <h1 className="text-2xl font-semibold text-teal-950">Set new password</h1>
            <p className="text-sm text-teal-900/65 mt-2">Choose a strong password for your account.</p>
          </div>
          {err && !sessionReady ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">{err}</p>
              <Link to="/forgot-password" className="text-teal-700 underline text-sm">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-teal-900">
                New password
                <input type="password" required autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="At least 6 characters" />
              </label>
              <label className="block text-sm font-medium text-teal-900">
                Confirm password
                <input type="password" required autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="Re-enter password" />
              </label>
              {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">{err}</p>}
              <button type="submit" disabled={loading || !sessionReady}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl shadow transition">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
