import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { fetchDoctorByEmail, updateDoctorCalendly, type DoctorRow } from "../lib/api";

function calEmbedUrl(url: string) {
  const sep = url.includes("?") ? "&" : "?";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${url}${sep}embed_type=Inline&embed_domain=${encodeURIComponent(host)}`;
}

export default function DoctorDashboard() {
  const { user, signOut } = useAuth();
  const [doc, setDoc] = useState<DoctorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [calUrl, setCalUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    void fetchDoctorByEmail(user.email)
      .then((d) => {
        setDoc(d);
        setCalUrl(d?.calendly_url ?? "");
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  async function saveCal() {
    if (!doc) return;
    setSaving(true);
    setMsg(null);
    try {
      await updateDoctorCalendly(doc.id, calUrl.trim());
      setDoc({ ...doc, calendly_url: calUrl.trim() });
      setMsg("Calendly link saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center text-teal-800">Loading practice…</div>
      </PageShell>
    );
  }

  if (!doc) {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto px-4 py-20 text-center glass-panel space-y-4">
          <NeoLogo />
          <p className="text-teal-900/80">
            No approved NeoHomeo directory profile is linked to <strong>{user?.email}</strong> yet. Complete the{" "}
            <Link className="text-teal-700 underline" to="/apply">
              physician application
            </Link>{" "}
            using this email, then wait for operations approval.
          </p>
          <Link to="/" className="text-sm text-teal-700 underline">
            Home
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-blue-200/35 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <NeoLogo compact />
            <p className="text-sm text-teal-900/65 mt-2">Clinician console · {user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="px-4 py-2 rounded-full border border-white/60 bg-white/40 backdrop-blur text-sm font-semibold text-teal-900"
          >
            Logout
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/80 via-teal-50/40 to-white/60 backdrop-blur-xl p-8 md:p-12 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70">Practice</p>
              <h1 className="text-4xl md:text-5xl font-extralight text-teal-950 leading-tight">
                {doc.full_name}
                <span className="block text-lg font-medium text-teal-800/80 mt-2">{doc.specialization}</span>
              </h1>
              <p className="text-sm text-teal-900/70 max-w-xl">{doc.bio ?? "Your public bio will appear on NeoHomeo once you add it in the directory record."}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-4 py-2 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">
                  {doc.experience_years}+ years experience
                </span>
                <span className="px-4 py-2 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">
                  ₹{doc.consultation_fee} consult
                </span>
                <span className="px-4 py-2 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">
                  {doc.languages.join(" · ")}
                </span>
              </div>
            </div>
            <div className="w-full lg:w-80 glass-panel p-5 space-y-3 border border-white/80">
              <p className="text-xs uppercase text-teal-800/60">Today</p>
              <p className="text-3xl font-light text-teal-950">—</p>
              <p className="text-xs text-teal-800/60">Calendar sync arrives with your first Calendly connection.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-lg font-semibold text-teal-950">Calendly</h2>
            <p className="text-sm text-teal-900/70">
              Paste your full scheduling link (for example <code className="text-xs">https://calendly.com/your-name/consult</code>
              ). Patients will see this inside their dashboard when you are matched.
            </p>
            <input
              value={calUrl}
              onChange={(e) => setCalUrl(e.target.value)}
              placeholder="https://calendly.com/..."
              className="w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveCal()}
              className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save link"}
            </button>
            {msg && <p className="text-sm text-teal-800">{msg}</p>}
          </div>
          <div className="glass-panel p-0 overflow-hidden min-h-[420px] border border-teal-100">
            {doc.calendly_url ? (
              <iframe title="Your Calendly" src={calEmbedUrl(doc.calendly_url)} className="w-full h-[420px]" />
            ) : (
              <div className="p-8 text-center text-teal-900/65 text-sm h-full flex items-center justify-center">
                Preview appears after you save a Calendly URL.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 grid sm:grid-cols-3 gap-4 text-center">
          {[
            ["Patients routed", "NeoHomeo matching"],
            ["Prescriptions", "Coming soon"],
            ["Payouts", "Coming soon"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl bg-white/60 border border-teal-50 p-4">
              <p className="text-xs uppercase text-teal-800/50">{a}</p>
              <p className="text-sm font-semibold text-teal-950 mt-1">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
