import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeoLogo, PageShell } from "../components/Shell";
import { NotificationBell } from "../components/NotificationBell";
import { ReviewModal } from "../components/ReviewModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  bookAppointment,
  getLatestAssessmentSummary,
  listApprovedDoctors,
  listAssessmentsForPatient,
  listPatientAppointments,
  savePatientOnboarding,
  updateAppointmentStatus,
  type AppointmentRow,
  type AssessmentRecord,
  type DoctorRow,
  type PatientDetails,
} from "../lib/api";
import { matchDoctorsToSummary, type MatchedDoctor } from "../lib/matching";

type Tab = "dashboard" | "appointments" | "profile";

const langs = ["English", "Hindi", "Telugu", "Urdu", "Malayalam", "Tamil", "Marathi"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-teal-100/60 rounded-2xl ${className}`} />;
}

function calEmbedUrl(url: string) {
  const sep = url.includes("?") ? "&" : "?";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${url}${sep}embed_type=Inline&embed_domain=${encodeURIComponent(host)}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function PatientDashboard() {
  const { user, profile, patientDetails, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("dashboard");

  // Dashboard state
  const [loadingData, setLoadingData] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [pick, setPick] = useState<MatchedDoctor | null>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null); // doctorId being booked
  const [reviewTarget, setReviewTarget] = useState<{ doctorId: string; doctorName: string } | null>(null);

  // Profile edit state
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [d, setD] = useState<Partial<PatientDetails>>({});

  // Init profile form
  useEffect(() => {
    if (patientDetails) {
      setD({
        phone: patientDetails.phone ?? "",
        city: patientDetails.city ?? "",
        date_of_birth: patientDetails.date_of_birth ?? "",
        gender: patientDetails.gender ?? "",
        language_preference: patientDetails.language_preference ?? "English",
        height_cm: patientDetails.height_cm ?? undefined,
        weight_kg: patientDetails.weight_kg ?? undefined,
        blood_group: patientDetails.blood_group ?? "",
        occupation: patientDetails.occupation ?? "",
        lifestyle_notes: patientDetails.lifestyle_notes ?? "",
        sleep_hours: patientDetails.sleep_hours ?? undefined,
        diet_type: patientDetails.diet_type ?? "",
        past_diseases: patientDetails.past_diseases ?? "",
        current_medicines: patientDetails.current_medicines ?? "",
        allergies: patientDetails.allergies ?? "",
        family_history: patientDetails.family_history ?? "",
        surgeries: patientDetails.surgeries ?? "",
        stress_level: patientDetails.stress_level ?? "",
        anxiety_notes: patientDetails.anxiety_notes ?? "",
        mood_pattern: patientDetails.mood_pattern ?? "",
        energy_level: patientDetails.energy_level ?? "",
        emotional_triggers: patientDetails.emotional_triggers ?? "",
      });
    }
    if (profile?.full_name) setFullName(profile.full_name);
  }, [patientDetails, profile]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    void Promise.all([
      listAssessmentsForPatient(user.id),
      listApprovedDoctors(),
      getLatestAssessmentSummary(user.id),
    ]).then(([a, docs, s]) => {
      setAssessments(a);
      setDoctors(docs);
      setSummary(s);
    }).finally(() => setLoadingData(false));
  }, [user]);

  // Load appointments
  useEffect(() => {
    if (!user) return;
    setLoadingAppts(true);
    void listPatientAppointments(user.id)
      .then(setAppointments)
      .catch(() => toast("Could not load appointments", "error"))
      .finally(() => setLoadingAppts(false));
  }, [user]);

  const matched = useMemo(() => {
    const s = summary ?? assessments[0]?.summary ?? "";
    return matchDoctorsToSummary(s, doctors).slice(0, 6);
  }, [summary, assessments, doctors]);

  const displayName = profile?.full_name ?? user?.email ?? "Patient";
  const pendingAppts = appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length;

  function field<K extends keyof PatientDetails>(key: K, v: PatientDetails[K]) {
    setD((prev) => ({ ...prev, [key]: v }));
  }

  async function saveProfile() {
    if (!user) return;
    if (!fullName.trim()) { toast("Please enter your full name.", "error"); return; }
    setSaving(true);
    try {
      await savePatientOnboarding(user.id, fullName.trim(), d);
      await refreshProfile();
      toast("Profile updated successfully!");
      setTab("dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleBook(doc: MatchedDoctor) {
    if (!user) return;
    setBookingId(doc.id);
    try {
      await bookAppointment({ patientId: user.id, doctorId: doc.id });
      const appts = await listPatientAppointments(user.id);
      setAppointments(appts);
      toast(`Appointment requested with ${doc.full_name}!`);
      setTab("appointments");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not book appointment", "error");
    } finally {
      setBookingId(null);
    }
  }

  async function cancelAppointment(id: string) {
    try {
      await updateAppointmentStatus(id, "cancelled");
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
      toast("Appointment cancelled.");
    } catch {
      toast("Could not cancel appointment", "error");
    }
  }

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "appointments", label: "Appointments", icon: "📅", badge: pendingAppts || undefined },
    { id: "profile", label: "Edit Profile", icon: "👤" },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <NeoLogo compact />
            <p className="text-sm text-teal-900/65 mt-2">
              Signed in as <span className="font-semibold text-teal-900">{user?.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {user && <NotificationBell userId={user.id} />}
            <Link
              to="/assessment"
              className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold shadow hover:bg-teal-700"
            >
              Dr. Neo
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="px-4 py-2 rounded-full border border-teal-100 bg-white text-sm font-semibold text-teal-900"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 border border-teal-100 rounded-2xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition
                ${tab === t.id ? "bg-teal-600 text-white shadow" : "text-teal-900/70 hover:bg-teal-50"}`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ─── Dashboard Tab ─── */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-[2rem] glass-panel p-8 md:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-transparent to-blue-50/60 pointer-events-none" />
              <div className="relative z-10 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Your care surface</p>
                  <h1 className="text-3xl md:text-4xl font-extralight text-teal-950">
                    Welcome back, <span className="font-medium text-teal-800">{displayName}</span>
                  </h1>
                  <p className="text-sm text-teal-900/70 max-w-xl">
                    Assessments refine doctor matching. Book a slot when you are ready — Calendly opens inline when your
                    physician has connected a schedule.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[120px]">
                      <p className="text-[10px] uppercase text-teal-700/70">City</p>
                      <p className="text-sm font-semibold text-teal-950">{patientDetails?.city ?? "—"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[120px]">
                      <p className="text-[10px] uppercase text-teal-700/70">Assessments</p>
                      <p className="text-sm font-semibold text-teal-950">{assessments.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[120px]">
                      <p className="text-[10px] uppercase text-teal-700/70">Appointments</p>
                      <p className="text-sm font-semibold text-teal-950">{appointments.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[120px]">
                      <p className="text-[10px] uppercase text-teal-700/70">Match pool</p>
                      <p className="text-sm font-semibold text-teal-950">{doctors.length} doctors</p>
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-5 border border-white/80 bg-white/50">
                  <h3 className="font-semibold text-teal-950 mb-2">Quick paths</h3>
                  <ul className="space-y-2 text-sm text-teal-800">
                    <li>
                      <button onClick={() => setTab("appointments")} className="hover:text-teal-600 text-left">
                        My appointments {pendingAppts > 0 && <span className="text-xs text-amber-600 font-bold">({pendingAppts} active)</span>}
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setTab("profile")} className="hover:text-teal-600 text-left">
                        Edit health profile
                      </button>
                    </li>
                    <li><Link className="hover:text-teal-600" to="/">Marketing site</Link></li>
                    <li><Link className="hover:text-teal-600" to="/apply">Refer a physician</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Matched Doctors */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-teal-950">Matched physicians</h2>
                  <p className="text-sm text-teal-900/65">
                    Ranked by overlap between your latest assessment and each doctor&apos;s specialty keywords.
                  </p>
                </div>
                {!loadingData && !summary && assessments.length === 0 && (
                  <span className="text-xs text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                    Complete Dr. Neo to unlock stronger matches
                  </span>
                )}
              </div>

              {loadingData ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {matched.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setPick(doc)}
                        className={`cursor-pointer text-left glass-panel p-5 transition hover:-translate-y-0.5 ${
                          pick?.id === doc.id ? "ring-2 ring-teal-500" : ""
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <h3 className="font-semibold text-teal-950">{doc.full_name}</h3>
                          <span className="text-xs font-bold text-teal-700">Score {doc.matchScore}</span>
                        </div>
                        <p className="text-sm text-teal-800/80 mt-1">{doc.specialization}</p>
                        <p className="text-xs text-teal-900/60 mt-1">{doc.languages.join(" · ")}</p>
                        <p className="text-sm font-semibold text-teal-900 mt-2">₹{doc.consultation_fee}</p>
                        <div className="flex gap-2 mt-3">
                          <Link
                            to={`/doctors/${doc.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                          >
                            View profile →
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); void handleBook(doc); }}
                            disabled={bookingId === doc.id}
                            className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-3 py-1 rounded-full transition"
                          >
                            {bookingId === doc.id ? "Booking…" : "Book"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pick?.calendly_url && (
                    <div className="glass-panel p-4 space-y-3">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-teal-950">Schedule with {pick.full_name}</h3>
                        <a href={pick.calendly_url} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold text-teal-700 underline">
                          Open in new tab
                        </a>
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-teal-100 bg-white min-h-[640px]">
                        <iframe title="Calendly" src={calEmbedUrl(pick.calendly_url)} className="w-full h-[640px]" />
                      </div>
                    </div>
                  )}

                  {pick && !pick.calendly_url && (
                    <p className="text-sm text-teal-800/70 glass-panel p-4">
                      This physician hasn&apos;t connected a Calendly calendar yet. Use the <strong>Book</strong> button to request an appointment and our care desk will coordinate timing.
                    </p>
                  )}
                </>
              )}
            </section>

            {/* Assessment history */}
            <section className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-teal-950">Assessment history</h3>
                <Link to="/assessment" className="text-sm font-semibold text-teal-700">
                  New assessment
                </Link>
              </div>
              {loadingData ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" /><Skeleton className="h-20" />
                </div>
              ) : assessments.length === 0 ? (
                <p className="text-sm text-teal-900/65">No assessments yet. Start Dr. Neo when you are ready.</p>
              ) : (
                <ul className="space-y-3">
                  {assessments.map((a) => (
                    <li key={a.id} className="border border-teal-100 rounded-2xl p-4 bg-white/80">
                      <div className="flex justify-between gap-2 text-xs text-teal-800/60">
                        <span>{a.language}</span>
                        <span>{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-teal-950 mt-2 whitespace-pre-line">{a.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </motion.div>
        )}

        {/* ─── Appointments Tab ─── */}
        {tab === "appointments" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-5 space-y-1">
              <h2 className="text-lg font-semibold text-teal-950">My appointments</h2>
              <p className="text-sm text-teal-900/65">
                Appointments booked via the dashboard. Your doctor may confirm or reschedule.
              </p>
            </div>

            {loadingAppts ? (
              <div className="space-y-3">
                <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="glass-panel p-12 text-center space-y-3">
                <p className="text-4xl">📅</p>
                <p className="font-semibold text-teal-950">No appointments yet</p>
                <p className="text-sm text-teal-900/65">Go to Dashboard, pick a matched doctor, and click Book.</p>
                <button onClick={() => setTab("dashboard")}
                  className="text-sm font-semibold text-teal-600 underline">
                  Find a doctor
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {appointments.map((appt) => (
                  <motion.li
                    key={appt.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-5 flex flex-wrap gap-4 items-start"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-teal-950">
                          {(appt.doctor as { full_name?: string })?.full_name ?? "Doctor"}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[appt.status]}`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-sm text-teal-800/70">
                        {(appt.doctor as { specialization?: string })?.specialization ?? ""}
                      </p>
                      {appt.scheduled_at && (
                        <p className="text-xs text-teal-800/60">
                          📅 {new Date(appt.scheduled_at).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-teal-800/50">
                        Requested {new Date(appt.created_at).toLocaleDateString()}
                      </p>
                      {appt.notes && (
                        <p className="text-xs text-teal-900/70 bg-teal-50 rounded-xl px-3 py-1.5 mt-1">{appt.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Link
                        to={`/doctors/${appt.doctor_id}`}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                      >
                        View doctor →
                      </Link>
                      {appt.status === "completed" && (
                        <button
                          onClick={() => setReviewTarget({
                            doctorId: appt.doctor_id,
                            doctorName: (appt.doctor as { full_name?: string })?.full_name ?? "Doctor",
                          })}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 underline"
                        >
                          ★ Leave review
                        </button>
                      )}
                      {appt.status !== "cancelled" && appt.status !== "completed" && (
                        <button
                          onClick={() => void cancelAppointment(appt.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* ─── Edit Profile Tab ─── */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-panel p-6 space-y-2">
              <h2 className="text-xl font-semibold text-teal-950">Edit your health profile</h2>
              <p className="text-sm text-teal-900/70">Keep your profile current — Dr. Neo and doctor matching use this context.</p>
            </div>

            {/* Identity */}
            <section className="glass-panel p-6 space-y-4">
              <h3 className="font-semibold text-teal-950">Identity</h3>
              <label className="block text-sm font-medium text-teal-900">
                Full name
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-teal-900">
                  Phone
                  <input value={d.phone ?? ""} onChange={(e) => field("phone", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  City
                  <input value={d.city ?? ""} onChange={(e) => field("city", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Date of birth
                  <input type="date" value={d.date_of_birth ?? ""} onChange={(e) => field("date_of_birth", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Gender
                  <select value={d.gender ?? ""} onChange={(e) => field("gender", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option>Female</option><option>Male</option>
                    <option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Preferred language
                  <select value={d.language_preference ?? "English"} onChange={(e) => field("language_preference", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm">
                    {langs.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
              </div>
            </section>

            {/* Body & Lifestyle */}
            <section className="glass-panel p-6 space-y-4">
              <h3 className="font-semibold text-teal-950">Body &amp; lifestyle</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="text-sm font-medium text-teal-900">
                  Height (cm)
                  <input type="number" value={d.height_cm ?? ""} onChange={(e) => field("height_cm", e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Weight (kg)
                  <input type="number" step="0.1" value={d.weight_kg ?? ""} onChange={(e) => field("weight_kg", e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Blood group
                  <input value={d.blood_group ?? ""} onChange={(e) => field("blood_group", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-teal-900">
                  Occupation
                  <input value={d.occupation ?? ""} onChange={(e) => field("occupation", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Sleep (hrs/night)
                  <input type="number" step="0.5" value={d.sleep_hours ?? ""} onChange={(e) => field("sleep_hours", e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Diet pattern
                  <input value={d.diet_type ?? ""} onChange={(e) => field("diet_type", e.target.value)} placeholder="Vegetarian, mixed…"
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-teal-900">
                Lifestyle notes
                <textarea rows={2} value={d.lifestyle_notes ?? ""} onChange={(e) => field("lifestyle_notes", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
            </section>

            {/* Medical History */}
            <section className="glass-panel p-6 space-y-4">
              <h3 className="font-semibold text-teal-950">Medical history</h3>
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
                  <textarea rows={2} value={(d[key] as string) ?? ""} onChange={(e) => field(key, e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
              ))}
            </section>

            {/* Emotional Profile */}
            <section className="glass-panel p-6 space-y-4">
              <h3 className="font-semibold text-teal-950">Emotional profile</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-teal-900">
                  Stress level
                  <input value={d.stress_level ?? ""} onChange={(e) => field("stress_level", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
                <label className="text-sm font-medium text-teal-900">
                  Energy level
                  <input value={d.energy_level ?? ""} onChange={(e) => field("energy_level", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
                </label>
              </div>
              <label className="text-sm font-medium text-teal-900">
                Anxiety notes
                <textarea rows={2} value={d.anxiety_notes ?? ""} onChange={(e) => field("anxiety_notes", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Mood pattern
                <textarea rows={2} value={d.mood_pattern ?? ""} onChange={(e) => field("mood_pattern", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Emotional triggers
                <textarea rows={2} value={d.emotional_triggers ?? ""} onChange={(e) => field("emotional_triggers", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
            </section>

            <div className="flex gap-3">
              <button onClick={() => void saveProfile()} disabled={saving}
                className="px-8 py-3 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold transition">
                {saving ? "Saving…" : "Save profile"}
              </button>
              <button onClick={() => setTab("dashboard")}
                className="px-8 py-3 rounded-full border border-teal-100 bg-white text-sm font-semibold text-teal-900 hover:bg-teal-50 transition">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Review modal */}
      {reviewTarget && user && (
        <ReviewModal
          patientId={user.id}
          doctorId={reviewTarget.doctorId}
          doctorName={reviewTarget.doctorName}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </PageShell>
  );
}
