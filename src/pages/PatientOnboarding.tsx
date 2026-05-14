import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { savePatientOnboarding, type PatientDetails } from "../lib/api";
import { isSupabaseConfigured } from "../lib/supabase";

const langs = ["English", "Hindi", "Telugu", "Urdu", "Malayalam", "Tamil", "Marathi"];

export default function PatientOnboarding() {
  const { user, refreshProfile, loading, profile, patientDetails } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name as string || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [d, setD] = useState<Partial<PatientDetails>>({
    language_preference: "English",
    gender: "",
    city: "",
    phone: "",
    date_of_birth: "",
    height_cm: undefined,
    weight_kg: undefined,
    blood_group: "",
    occupation: "",
    lifestyle_notes: "",
    sleep_hours: undefined,
    diet_type: "",
    past_diseases: "",
    current_medicines: "",
    allergies: "",
    family_history: "",
    surgeries: "",
    stress_level: "",
    anxiety_notes: "",
    mood_pattern: "",
    energy_level: "",
    emotional_triggers: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim()) {
      setErr("Please enter your full name.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");
      await savePatientOnboarding(user.id, fullName.trim(), d);
      await refreshProfile();
      nav("/dashboard", { replace: true });
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  function field<K extends keyof PatientDetails>(key: K, v: PatientDetails[K]) {
    setD((prev) => ({ ...prev, [key]: v }));
  }

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center text-teal-800">Loading…</div>
      </PageShell>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.role === "doctor") return <Navigate to="/doctor" replace />;
  if (profile?.onboarding_completed && patientDetails) return <Navigate to="/dashboard" replace />;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <NeoLogo />
        <div className="glass-panel p-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-700/70">One-time setup</p>
          <h1 className="text-3xl font-light text-teal-950">Complete your health profile</h1>
          <p className="text-sm text-teal-900/70">
            NeoHomeo uses this context for Dr. Neo and for matching you with the right physician. You will not be asked
            for these basics again in the assessment chat.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="glass-panel p-6 space-y-4">
            <h2 className="font-semibold text-teal-950">Identity</h2>
            <label className="block text-sm font-medium text-teal-900">
              Full legal name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-teal-900">
                Phone
                <input
                  value={d.phone ?? ""}
                  onChange={(e) => field("phone", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                City
                <input
                  required
                  value={d.city ?? ""}
                  onChange={(e) => field("city", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Date of birth
                <input
                  type="date"
                  required
                  value={d.date_of_birth ?? ""}
                  onChange={(e) => field("date_of_birth", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Gender
                <select
                  required
                  value={d.gender ?? ""}
                  onChange={(e) => field("gender", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                >
                  <option value="">Select</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
              <label className="text-sm font-medium text-teal-900">
                Preferred language
                <select
                  value={d.language_preference ?? "English"}
                  onChange={(e) => field("language_preference", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                >
                  {langs.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="glass-panel p-6 space-y-4">
            <h2 className="font-semibold text-teal-950">Body & lifestyle</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="text-sm font-medium text-teal-900">
                Height (cm)
                <input
                  type="number"
                  required
                  value={d.height_cm ?? ""}
                  onChange={(e) => field("height_cm", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Weight (kg)
                <input
                  type="number"
                  step="0.1"
                  required
                  value={d.weight_kg ?? ""}
                  onChange={(e) => field("weight_kg", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Blood group
                <input
                  value={d.blood_group ?? ""}
                  onChange={(e) => field("blood_group", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
            </div>
            <label className="text-sm font-medium text-teal-900">
              Occupation
              <input
                value={d.occupation ?? ""}
                onChange={(e) => field("occupation", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-teal-900">
                Sleep (hours / night)
                <input
                  type="number"
                  step="0.5"
                  value={d.sleep_hours ?? ""}
                  onChange={(e) => field("sleep_hours", e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Diet pattern
                <input
                  value={d.diet_type ?? ""}
                  onChange={(e) => field("diet_type", e.target.value)}
                  placeholder="Vegetarian, mixed, etc."
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
            </div>
            <label className="text-sm font-medium text-teal-900">
              Lifestyle notes
              <textarea
                rows={2}
                value={d.lifestyle_notes ?? ""}
                onChange={(e) => field("lifestyle_notes", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
          </section>

          <section className="glass-panel p-6 space-y-4">
            <h2 className="font-semibold text-teal-950">Medical history</h2>
            {(
              [
                ["past_diseases", "Past diseases / conditions"],
                ["current_medicines", "Current medicines & supplements"],
                ["allergies", "Allergies"],
                ["family_history", "Family history"],
                ["surgeries", "Surgeries / hospitalisations"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm font-medium text-teal-900">
                {label}
                <textarea
                  rows={2}
                  value={(d[key] as string) ?? ""}
                  onChange={(e) => field(key, e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
            ))}
          </section>

          <section className="glass-panel p-6 space-y-4">
            <h2 className="font-semibold text-teal-950">Emotional profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-teal-900">
                Stress level (words)
                <input
                  value={d.stress_level ?? ""}
                  onChange={(e) => field("stress_level", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Energy level
                <input
                  value={d.energy_level ?? ""}
                  onChange={(e) => field("energy_level", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
            </div>
            <label className="text-sm font-medium text-teal-900">
              Anxiety notes
              <textarea
                rows={2}
                value={d.anxiety_notes ?? ""}
                onChange={(e) => field("anxiety_notes", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-teal-900">
              Mood pattern
              <textarea
                rows={2}
                value={d.mood_pattern ?? ""}
                onChange={(e) => field("mood_pattern", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-teal-900">
              Emotional triggers
              <textarea
                rows={2}
                value={d.emotional_triggers ?? ""}
                onChange={(e) => field("emotional_triggers", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
              />
            </label>
          </section>

          <label className="flex items-start gap-3 text-sm text-teal-900/85 glass-panel p-4">
            <input type="checkbox" required className="mt-1" />
            <span>
              I consent to NeoHomeo storing this profile for care coordination and AI-assisted intake. I understand this
              is not emergency care.
            </span>
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl shadow"
          >
            {saving ? "Saving…" : "Save and continue to dashboard"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
