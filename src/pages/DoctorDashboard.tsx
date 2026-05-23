import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NeoLogo, PageShell } from "../components/Shell";
import { NotificationBell } from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  fetchDoctorByEmail,
  listDoctorAppointments,
  updateAppointmentStatus,
  updateDoctorProfile,
  uploadDoctorPhoto,
  type AppointmentRow,
  type AppointmentPatient,
  type AppointmentStatus,
  type DoctorRow,
} from "../lib/api";

type Tab = "profile" | "appointments" | "calendar" | "settings";

const APPT_STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-teal-100/60 rounded-2xl ${className}`} />;
}

export default function DoctorDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [doc, setDoc] = useState<DoctorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Editable fields
  const [bio, setBio] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [fee, setFee] = useState("");
  const [languages, setLanguages] = useState("");
  const [calUrl, setCalUrl] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    fetchDoctorByEmail(user.email)
      .then((d) => {
        setDoc(d);
        if (d) {
          setBio(d.bio ?? "");
          setClinicName(d.clinic_name ?? "");
          setClinicAddress(d.clinic_address ?? "");
          setFee(String(d.consultation_fee ?? ""));
          setLanguages((d.languages ?? []).join(", "));
          setCalUrl(d.calendly_url ?? "");
          setKeywords(d.match_keywords ?? "");
        }
      })
      .catch(() => toast("Failed to load practice profile", "error"))
      .finally(() => setLoading(false));
  }, [user?.email]);

  async function saveProfile() {
    if (!doc) return;
    setSaving(true);
    try {
      const updates = {
        bio: bio.trim() || null,
        clinic_name: clinicName.trim() || null,
        clinic_address: clinicAddress.trim() || null,
        consultation_fee: Number(fee) || doc.consultation_fee,
        languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
        match_keywords: keywords.trim() || null,
      };
      await updateDoctorProfile(doc.id, updates);
      setDoc({ ...doc, ...updates });
      toast("Profile saved successfully!");
    } catch {
      toast("Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  // Load appointments once we know the doctor record
  useEffect(() => {
    if (!doc) return;
    setLoadingAppts(true);
    void listDoctorAppointments(doc.id)
      .then(setAppointments)
      .catch(() => toast("Could not load appointments", "error"))
      .finally(() => setLoadingAppts(false));
  }, [doc]);

  async function changeApptStatus(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      toast(status === "confirmed" ? "Appointment confirmed!" : status === "completed" ? "Marked as completed." : "Status updated.");
    } catch {
      toast("Could not update appointment", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveCalendly() {
    if (!doc) return;
    setSaving(true);
    try {
      await updateDoctorProfile(doc.id, { calendly_url: calUrl.trim() || null });
      setDoc({ ...doc, calendly_url: calUrl.trim() || null });
      toast("Calendly link saved!");
    } catch {
      toast("Could not save Calendly link", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !doc) return;
    if (file.size > 5 * 1024 * 1024) { toast("Photo must be under 5 MB", "error"); return; }
    setUploadingPhoto(true);
    try {
      const url = await uploadDoctorPhoto(doc.id, file);
      setDoc({ ...doc, photo_url: url });
      toast("Profile photo updated!");
    } catch {
      toast("Could not upload photo", "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-48 w-full" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32" /><Skeleton className="h-32" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!doc) {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto px-4 py-20 text-center glass-panel space-y-4">
          <NeoLogo />
          <p className="text-teal-900/80">
            No approved profile is linked to <strong>{user?.email}</strong>. Complete the{" "}
            <Link className="text-teal-700 underline" to="/apply">physician application</Link>{" "}
            using this email, then wait for admin approval.
          </p>
          <button onClick={() => void signOut()} className="text-sm text-rose-600 underline">Logout</button>
        </div>
      </PageShell>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "appointments", label: "Appointments", icon: "📋", badge: pendingCount || undefined },
    { id: "calendar", label: "Calendly", icon: "📅" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <PageShell>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-blue-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <NeoLogo compact />
            <p className="text-sm text-teal-900/65 mt-1">Clinician console · {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user && <NotificationBell userId={user.id} />}
            <button onClick={() => void signOut()}
              className="px-4 py-2 rounded-full border border-white/60 bg-white/40 backdrop-blur text-sm font-semibold text-teal-900">
              Logout
            </button>
          </div>
        </header>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/80 via-teal-50/40 to-white/60 backdrop-blur-xl p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative flex-shrink-0">
              {doc.photo_url ? (
                <img src={doc.photo_url} alt={doc.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-teal-100 shadow" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-50 flex items-center justify-center text-2xl font-bold text-teal-700">
                  {doc.full_name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-semibold text-teal-950">{doc.full_name}</h1>
              <p className="text-teal-700 font-medium">{doc.specialization}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">{doc.experience_years}+ yrs</span>
                <span className="px-3 py-1 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">₹{doc.consultation_fee}</span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">✓ Approved</span>
                {doc.calendly_url && <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">Calendly ✓</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-teal-800/50">Rating</p>
              <p className="text-2xl font-bold text-amber-500">★ {Number(doc.rating).toFixed(1)}</p>
              <p className="text-xs text-teal-800/50">{doc.review_count} reviews</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 border border-teal-100 rounded-2xl p-1 flex-wrap">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition
                ${tab === t.id ? "bg-teal-600 text-white shadow" : "text-teal-900/70 hover:bg-teal-50"}`}>
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

        {/* Tab: Appointments */}
        {tab === "appointments" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-teal-950">Patient appointments</h2>
                <p className="text-sm text-teal-900/65">{appointments.length} total · {pendingCount} pending</p>
              </div>
            </div>

            {loadingAppts ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="glass-panel p-5 animate-pulse">
                    <div className="h-4 bg-teal-100/60 rounded-xl w-48 mb-2" />
                    <div className="h-3 bg-teal-100/60 rounded-xl w-32" />
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="glass-panel p-12 text-center space-y-3">
                <p className="text-4xl">📋</p>
                <p className="font-semibold text-teal-950">No appointments yet</p>
                <p className="text-sm text-teal-900/65">When patients book with you, their requests appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {appointments.map((appt) => {
                  const patient = appt.patient as AppointmentPatient | undefined;
                  return (
                    <motion.li key={appt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-5 flex flex-wrap gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-sm font-bold text-teal-700 flex-shrink-0">
                        {(patient?.full_name ?? patient?.email ?? "P").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-teal-950">{patient?.full_name ?? "Patient"}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${APPT_STATUS_STYLES[appt.status]}`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-teal-800/60">{patient?.email ?? ""}</p>
                        {appt.scheduled_at && (
                          <p className="text-xs text-teal-800/60">📅 {new Date(appt.scheduled_at).toLocaleString()}</p>
                        )}
                        <p className="text-xs text-teal-800/50">Requested {new Date(appt.created_at).toLocaleDateString()}</p>
                        {appt.notes && (
                          <p className="text-xs text-teal-900/70 bg-teal-50 rounded-xl px-3 py-1.5 mt-1">{appt.notes}</p>
                        )}
                      </div>
                      {/* Actions */}
                      {appt.status !== "cancelled" && appt.status !== "completed" && (
                        <div className="flex gap-2 flex-wrap flex-shrink-0">
                          {appt.status === "pending" && (
                            <button
                              disabled={updatingId === appt.id}
                              onClick={() => void changeApptStatus(appt.id, "confirmed")}
                              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status === "confirmed" && (
                            <button
                              disabled={updatingId === appt.id}
                              onClick={() => void changeApptStatus(appt.id, "completed")}
                              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 transition"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => void changeApptStatus(appt.id, "cancelled")}
                            className="px-3 py-1.5 rounded-full border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 disabled:opacity-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}

        {/* Tab: Profile */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 space-y-5">
            <h2 className="text-lg font-semibold text-teal-950">Edit your practice profile</h2>

            {/* Photo upload */}
            <div className="flex items-center gap-4 p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
              {doc.photo_url ? (
                <img src={doc.photo_url} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border border-teal-200 shadow" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-700">
                  {doc.full_name.slice(0, 1)}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-teal-900">Profile photo</p>
                <p className="text-xs text-teal-800/60">JPG, PNG or WebP · max 5 MB</p>
                <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition
                  ${uploadingPhoto ? "opacity-50 cursor-not-allowed bg-teal-100 text-teal-600" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                  {uploadingPhoto ? "Uploading…" : doc.photo_url ? "Change photo" : "Upload photo"}
                  <input type="file" accept="image/*" className="sr-only" disabled={uploadingPhoto}
                    onChange={(e) => void handlePhotoUpload(e)} />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-teal-900">
                Clinic name
                <input value={clinicName} onChange={(e) => setClinicName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" placeholder="Your clinic name" />
              </label>
              <label className="block text-sm font-medium text-teal-900">
                Consultation fee (₹)
                <input type="number" value={fee} onChange={(e) => setFee(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium text-teal-900 md:col-span-2">
                Clinic address
                <input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" placeholder="City, State" />
              </label>
              <label className="block text-sm font-medium text-teal-900 md:col-span-2">
                Languages spoken (comma-separated)
                <input value={languages} onChange={(e) => setLanguages(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" placeholder="English, Hindi, Telugu" />
              </label>
              <label className="block text-sm font-medium text-teal-900 md:col-span-2">
                Bio / about you
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" placeholder="Describe your experience and approach…" />
              </label>
              <label className="block text-sm font-medium text-teal-900 md:col-span-2">
                Match keywords (helps patients find you)
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" placeholder="migraine, allergy, PCOS, digestion…" />
              </label>
            </div>
            <button onClick={() => void saveProfile()} disabled={saving}
              className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold transition">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </motion.div>
        )}

        {/* Tab: Calendly */}
        {tab === "calendar" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-panel p-6 space-y-4">
              <h2 className="text-lg font-semibold text-teal-950">Calendly scheduling link</h2>
              <p className="text-sm text-teal-900/70">Patients see this when you're matched. They can book directly inline.</p>
              <input value={calUrl} onChange={(e) => setCalUrl(e.target.value)}
                placeholder="https://calendly.com/your-name/consult"
                className="w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm" />
              <button onClick={() => void saveCalendly()} disabled={saving}
                className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold disabled:opacity-50">
                {saving ? "Saving…" : "Save link"}
              </button>
            </div>
            <div className="glass-panel p-0 overflow-hidden min-h-[420px] border border-teal-100">
              {doc.calendly_url ? (
                <iframe title="Your Calendly"
                  src={`${doc.calendly_url}${doc.calendly_url.includes("?") ? "&" : "?"}embed_type=Inline&embed_domain=${encodeURIComponent(window.location.hostname)}`}
                  className="w-full h-[420px]" />
              ) : (
                <div className="p-8 text-center text-teal-900/65 text-sm h-full flex items-center justify-center">
                  Preview appears after you save a Calendly URL.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Settings */}
        {tab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 space-y-5">
            <h2 className="text-lg font-semibold text-teal-950">Account settings</h2>
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 space-y-1">
              <p className="text-xs font-semibold text-teal-800/60 uppercase">Logged in as</p>
              <p className="text-sm font-semibold text-teal-950">{user?.email}</p>
            </div>
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 space-y-1">
              <p className="text-xs font-semibold text-teal-800/60 uppercase">Profile status</p>
              <p className="text-sm font-semibold text-emerald-700">✓ Approved &amp; Live</p>
            </div>
            <Link to="/forgot-password"
              className="block text-sm text-teal-700 underline">
              Change password
            </Link>
            <button onClick={() => void signOut()}
              className="block text-sm text-rose-600 underline">
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
