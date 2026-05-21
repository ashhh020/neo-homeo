import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  adminUpdateDoctor,
  getDashboardStats,
  listAllAppointments,
  listAllAssessmentsAdmin,
  listAllProfiles,
  listApprovedDoctors,
  listPendingDoctorApplications,
  notifyDoctorOfDecision,
  removeDoctor,
  setDoctorApplicationStatus,
  updateUserRole,
  type AppointmentRow,
  type AssessmentWithPatient,
  type DoctorRow,
  type Profile,
} from "../lib/api";

type Tab = "overview" | "applications" | "doctors" | "patients" | "appointments" | "assessments" | "settings";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "applications", label: "Applications", icon: "📋" },
  { id: "doctors", label: "Live Doctors", icon: "👨‍⚕️" },
  { id: "patients", label: "Patients", icon: "🏥" },
  { id: "appointments", label: "Appointments", icon: "📅" },
  { id: "assessments", label: "Assessments", icon: "🧠" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
};

/* ──── animated stat card ──── */
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(13,148,136,0.18)" }}
      className="relative overflow-hidden bg-white rounded-3xl border border-teal-50 shadow-glass p-5"
    >
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-full ${color} opacity-10 -translate-y-8 translate-x-8`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-teal-800/50 font-semibold">{label}</p>
          <p className="text-4xl font-bold text-teal-950 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}

/* ──── document link pill ──── */
function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 transition"
    >
      ↗ {label}
    </a>
  );
}

/* ──── doctor application row ──── */
function AppRow({
  app,
  busy,
  note,
  onNote,
  onDecide,
  onDelete,
}: {
  app: DoctorRow;
  busy: boolean;
  note: string;
  onNote: (v: string) => void;
  onDecide: (status: "approved" | "rejected") => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-teal-50 shadow-sm overflow-hidden"
    >
      <div
        className="flex flex-wrap items-start gap-4 p-5 cursor-pointer hover:bg-teal-50/30 transition"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {app.photo_url ? (
            <img src={app.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-teal-700">{app.full_name.slice(0, 1)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-teal-950 truncate">{app.full_name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[app.status]}`}>
              {app.status}
            </span>
          </div>
          <p className="text-xs text-teal-800/60 mt-0.5">{app.email} · {app.phone}</p>
          <p className="text-sm text-teal-900/80 mt-1">
            {app.specialization} · {app.experience_years}+ yrs · ₹{app.consultation_fee}
          </p>
          <p className="text-xs text-teal-800/50">{app.languages.join(", ")}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-teal-400 text-lg">⌄</motion.span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-teal-50"
          >
            <div className="p-5 space-y-4">
              {/* documents */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-teal-800/60 uppercase tracking-wider">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {app.degree_url && <DocLink href={app.degree_url} label="Degree" />}
                  {app.license_url && <DocLink href={app.license_url} label="License" />}
                  {app.gov_id_url && <DocLink href={app.gov_id_url} label="Gov ID" />}
                  {app.photo_url && <DocLink href={app.photo_url} label="Photo" />}
                  {!app.degree_url && !app.license_url && !app.gov_id_url && (
                    <span className="text-xs text-teal-800/40">No documents uploaded</span>
                  )}
                </div>
              </div>

              {/* clinic */}
              {app.clinic_name && (
                <div className="text-sm text-teal-900/70 bg-teal-50/50 rounded-2xl px-4 py-3">
                  <span className="font-semibold text-teal-900">{app.clinic_name}</span>
                  {app.clinic_address && <p className="text-xs mt-0.5">{app.clinic_address}</p>}
                </div>
              )}

              {/* admin note */}
              <label className="block text-xs font-semibold text-teal-800/60 uppercase tracking-wider">
                Admin note (optional)
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => onNote(e.target.value)}
                  placeholder="Reason for rejection, request for more info…"
                  className="mt-1.5 w-full rounded-2xl border border-teal-100 bg-white px-3 py-2 text-sm text-teal-900 font-normal normal-case tracking-normal"
                />
              </label>

              {/* actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  disabled={busy}
                  onClick={() => onDecide("approved")}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold shadow-lg disabled:opacity-50"
                >
                  {busy ? "Saving…" : "✓ Approve"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  disabled={busy}
                  onClick={() => onDecide("rejected")}
                  className="flex-1 py-3 rounded-2xl border-2 border-rose-200 text-rose-700 text-sm font-bold hover:bg-rose-50 transition disabled:opacity-50"
                >
                  ✕ Reject
                </motion.button>
              </div>

              {app.admin_note && (
                <p className="text-xs text-teal-800/60 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
                  Previous note: {app.admin_note}
                </p>
              )}
              <div className="border-t border-teal-50 pt-3">
                <button
                  disabled={busy}
                  onClick={() => onDelete()}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline disabled:opacity-50"
                >
                  Permanently delete this application
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ──────────────────────── main component ────────────────────────── */
export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [apps, setApps] = useState<DoctorRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [stats, setStats] = useState({ pendingDoctors: 0, approvedDoctors: 0, assessmentsCount: 0 });
  const [patients, setPatients] = useState<Profile[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentRow[]>([]);
  const [allAssessments, setAllAssessments] = useState<AssessmentWithPatient[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [editingDoc, setEditingDoc] = useState<DoctorRow | null>(null);
  const [editForm, setEditForm] = useState<{
    bio: string; clinic_name: string; clinic_address: string;
    consultation_fee: string; languages: string; specialization: string;
    experience_years: string; calendly_url: string; match_keywords: string;
  }>({ bio: "", clinic_name: "", clinic_address: "", consultation_fee: "",
       languages: "", specialization: "", experience_years: "", calendly_url: "", match_keywords: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const applyUrl = useMemo(() => `${window.location.origin}/apply`, []);

  async function refresh() {
    const [a, d, s, p, appts, assess] = await Promise.allSettled([
      listPendingDoctorApplications(),
      listApprovedDoctors(),
      getDashboardStats(),
      listAllProfiles(),
      listAllAppointments(),
      listAllAssessmentsAdmin(),
    ]);
    if (a.status === "fulfilled") setApps(a.value);
    if (d.status === "fulfilled") setDoctors(d.value);
    if (s.status === "fulfilled") setStats(s.value);
    if (p.status === "fulfilled") setPatients(p.value);
    if (appts.status === "fulfilled") setAllAppointments(appts.value);
    if (assess.status === "fulfilled") setAllAssessments(assess.value);
    // Log any failures so they show in browser console for debugging
    [a, d, s, p, appts, assess].forEach((r, i) => {
      if (r.status === "rejected") console.error(`Admin load[${i}] failed:`, r.reason);
    });
  }

  useEffect(() => { void refresh(); }, []);

  function showToast(msg: string, kind: "success" | "error" = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(applyUrl);
      showToast("Doctor application link copied to clipboard!");
    } catch {
      showToast("Unable to copy — link: " + applyUrl, "error");
    }
  }

  async function decide(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await setDoctorApplicationStatus(id, status, notes[id]);
      // Notify the doctor (best-effort — don't fail the whole action if this errors)
      void notifyDoctorOfDecision(id, status, notes[id]).catch(() => {});
      setNotes((n) => { const c = { ...n }; delete c[id]; return c; });
      showToast(status === "approved" ? "Doctor approved and published!" : "Application rejected.");
      await refresh();
      if (status === "approved") setTab("doctors");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  const filteredApps = useMemo(() =>
    apps.filter((a) =>
      !searchQ ||
      a.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.specialization.toLowerCase().includes(searchQ.toLowerCase()) ||
      (a.email ?? "").toLowerCase().includes(searchQ.toLowerCase())
    ), [apps, searchQ]);

  const filteredDoctors = useMemo(() =>
    doctors.filter((d) =>
      !searchQ ||
      d.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQ.toLowerCase())
    ), [doctors, searchQ]);

  const filteredPatients = useMemo(() =>
    patients.filter((p) =>
      !searchQ ||
      (p.full_name ?? "").toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(searchQ.toLowerCase())
    ), [patients, searchQ]);

  async function changeRole(userId: string, role: "patient" | "doctor" | "admin") {
    setBusyId(userId);
    try {
      await updateUserRole(userId, role);
      setPatients((prev) => prev.map((p) => p.id === userId ? { ...p, role } : p));
      showToast(`Role updated to ${role}`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to update role", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteDoctor(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from NeoHomeo? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await removeDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      setApps((prev) => prev.filter((a) => a.id !== id));
      await refresh();
      showToast(`${name} has been removed.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not remove doctor", "error");
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(d: DoctorRow) {
    setEditingDoc(d);
    setEditForm({
      bio: d.bio ?? "",
      clinic_name: d.clinic_name ?? "",
      clinic_address: d.clinic_address ?? "",
      consultation_fee: String(d.consultation_fee),
      languages: (d.languages ?? []).join(", "),
      specialization: d.specialization,
      experience_years: String(d.experience_years),
      calendly_url: d.calendly_url ?? "",
      match_keywords: d.match_keywords ?? "",
    });
  }

  async function saveEdit() {
    if (!editingDoc) return;
    setSavingEdit(true);
    try {
      const updates = {
        bio: editForm.bio.trim() || null,
        clinic_name: editForm.clinic_name.trim() || null,
        clinic_address: editForm.clinic_address.trim() || null,
        consultation_fee: Number(editForm.consultation_fee) || editingDoc.consultation_fee,
        languages: editForm.languages.split(",").map((l) => l.trim()).filter(Boolean),
        specialization: editForm.specialization.trim() || editingDoc.specialization,
        experience_years: Number(editForm.experience_years) || editingDoc.experience_years,
        calendly_url: editForm.calendly_url.trim() || null,
        match_keywords: editForm.match_keywords.trim() || null,
      };
      await adminUpdateDoctor(editingDoc.id, updates);
      setDoctors((prev) => prev.map((d) => d.id === editingDoc.id ? { ...d, ...updates } as DoctorRow : d));
      showToast("Doctor profile updated!");
      setEditingDoc(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  /* ─── sidebar ─── */
  const Sidebar = (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 64 }}
      className="relative flex-shrink-0 bg-white border-r border-teal-50 shadow-sm flex flex-col gap-1 py-4 overflow-hidden"
    >
      <div className="px-3 mb-4 flex items-center gap-2 overflow-hidden">
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <NeoLogo compact />
          </motion.div>
        )}
        <motion.button
          className="ml-auto w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition flex-shrink-0"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "◀" : "▶"}
        </motion.button>
      </div>

      {NAV.map((item) => (
        <motion.button
          key={item.id}
          whileHover={{ x: 2 }}
          onClick={() => setTab(item.id)}
          className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all text-left
            ${tab === item.id
              ? "bg-teal-600 text-white shadow-md shadow-teal-200"
              : "text-teal-900/70 hover:bg-teal-50"}`}
        >
          <span className="text-base flex-shrink-0">{item.icon}</span>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.label}
                {item.id === "applications" && apps.length > 0 && (
                  <span className="ml-1.5 text-xs bg-amber-400 text-white rounded-full px-1.5">
                    {apps.length}
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}

      <div className="mt-auto px-2">
        <motion.button
          whileHover={{ x: 2 }}
          onClick={() => void signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <span>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </motion.button>
      </div>
    </motion.aside>
  );

  /* ─── main area ─── */
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex">
      {Sidebar}

      <div className="flex-1 overflow-auto">
        {/* top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-teal-50 px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-teal-950 capitalize">{tab === "overview" ? "Admin Console" : NAV.find((n) => n.id === tab)?.label}</h1>
            <p className="text-xs text-teal-800/50">{user?.email}</p>
          </div>
          {/* search */}
          {(tab === "applications" || tab === "doctors" || tab === "patients" || tab === "appointments" || tab === "assessments") && (
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search…"
              className="rounded-full border border-teal-100 bg-teal-50/50 px-4 py-2 text-sm w-56 focus:outline-none focus:border-teal-400"
            />
          )}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => void copyLink()}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow"
            >
              Copy doctor link
            </motion.button>
            <Link to="/" className="px-4 py-2 rounded-full border border-teal-100 bg-white text-sm font-semibold text-teal-900 hover:bg-teal-50 transition">
              View site
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <AnimatePresence mode="wait">

            {/* ── Overview ── */}
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Pending Reviews" value={stats.pendingDoctors} icon="⏳" color="bg-amber-400" />
                  <StatCard label="Live Doctors" value={stats.approvedDoctors} icon="✅" color="bg-teal-400" />
                  <StatCard label="Registered Users" value={patients.length} icon="🏥" color="bg-blue-400" />
                  <StatCard label="Assessments" value={stats.assessmentsCount} icon="📊" color="bg-violet-400" />
                </div>

                {/* quick actions */}
                <div className="bg-white rounded-3xl border border-teal-50 shadow-glass p-6 space-y-3">
                  <h2 className="font-bold text-teal-950">Quick actions</h2>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { label: "Review pending doctors", count: apps.length, tab: "applications", color: "from-amber-400 to-orange-500" },
                      { label: "View live doctors", count: doctors.length, tab: "doctors", color: "from-teal-400 to-emerald-500" },
                      { label: "Manage users", count: patients.length, tab: "patients", color: "from-blue-400 to-cyan-500" },
                      { label: "Copy doctor signup link", count: null, tab: null, color: "from-violet-400 to-purple-500" },
                    ].map((a) => (
                      <motion.div
                        key={a.label}
                        whileHover={{ y: -2 }}
                        onClick={() => a.tab ? setTab(a.tab as Tab) : void copyLink()}
                        className="cursor-pointer rounded-2xl bg-gradient-to-br p-[1px] shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${a.color.includes("amber") ? "#fbbf24,#f97316" : a.color.includes("teal") ? "#2dd4bf,#10b981" : a.color.includes("blue") ? "#60a5fa,#22d3ee" : "#a78bfa,#8b5cf6"})` }}
                      >
                        <div className="bg-white rounded-2xl p-4">
                          <p className="text-sm font-semibold text-teal-950">{a.label}</p>
                          {a.count !== null && <p className="text-2xl font-bold text-teal-700 mt-1">{a.count}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* recent applications preview */}
                {apps.length > 0 && (
                  <div className="bg-white rounded-3xl border border-teal-50 shadow-glass p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-teal-950">Pending applications</h2>
                      <button onClick={() => setTab("applications")} className="text-xs font-semibold text-teal-600 hover:text-teal-800">View all →</button>
                    </div>
                    <div className="space-y-2">
                      {apps.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                            {a.full_name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-teal-950 text-sm truncate">{a.full_name}</p>
                            <p className="text-xs text-teal-800/60">{a.specialization}</p>
                          </div>
                          <button
                            onClick={() => setTab("applications")}
                            className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full hover:bg-amber-200 transition"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Applications ── */}
            {tab === "applications" && (
              <motion.div key="apps" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-teal-900/70">
                    {filteredApps.length} application{filteredApps.length !== 1 ? "s" : ""} pending review
                  </p>
                  <p className="text-xs text-teal-800/50 bg-white border border-teal-100 px-3 py-1 rounded-full">
                    Approving publishes to public site
                  </p>
                </div>

                {filteredApps.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-teal-50">
                    <p className="text-5xl mb-3">🎉</p>
                    <p className="font-semibold text-teal-950">All caught up!</p>
                    <p className="text-sm text-teal-900/60 mt-1">No pending doctor applications.</p>
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <AppRow
                      key={app.id}
                      app={app}
                      busy={busyId === app.id}
                      note={notes[app.id] ?? ""}
                      onNote={(v) => setNotes((n) => ({ ...n, [app.id]: v }))}
                      onDecide={(status) => void decide(app.id, status)}
                      onDelete={() => void deleteDoctor(app.id, app.full_name)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* ── Live Doctors ── */}
            {tab === "doctors" && (
              <motion.div key="doctors" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-teal-900/70">{filteredDoctors.length} verified doctor{filteredDoctors.length !== 1 ? "s" : ""} on NeoHomeo</p>

                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-teal-50">
                    <p className="text-5xl mb-3">👨‍⚕️</p>
                    <p className="font-semibold text-teal-950">No live doctors yet</p>
                    <p className="text-sm text-teal-900/60 mt-1">Approve applications to publish profiles.</p>
                    <button onClick={() => setTab("applications")} className="mt-4 text-sm font-semibold text-teal-600 underline">
                      Go to applications
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredDoctors.map((d, i) => (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-3xl border border-teal-50 shadow-glass p-5 flex gap-4"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-50 overflow-hidden flex-shrink-0">
                          {d.photo_url ? (
                            <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-teal-700">
                              {d.full_name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-teal-950 truncate">{d.full_name}</h3>
                            <span className="text-amber-600 font-semibold text-sm flex-shrink-0">★ {Number(d.rating).toFixed(1)}</span>
                          </div>
                          <p className="text-sm text-teal-800/70">{d.specialization}</p>
                          <p className="text-xs text-teal-900/55">{d.experience_years}+ yrs · {d.languages.join(", ")}</p>
                          <p className="text-sm font-semibold text-teal-900">₹{d.consultation_fee}</p>
                          <div className="flex gap-2 flex-wrap items-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS.approved}`}>live</span>
                            {d.calendly_url && <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-blue-50 text-blue-700 border-blue-100">Calendly ✓</span>}
                            <button
                              onClick={() => openEdit(d)}
                              className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition"
                            >
                              ✎ Edit
                            </button>
                            <button
                              disabled={busyId === d.id}
                              onClick={() => void deleteDoctor(d.id, d.full_name)}
                              className="text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition"
                            >
                              {busyId === d.id ? "Removing…" : "✕ Remove"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Patients ── */}
            {tab === "patients" && (
              <motion.div key="patients" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-teal-900/70">
                  {filteredPatients.length} user{filteredPatients.length !== 1 ? "s" : ""} registered
                </p>

                {filteredPatients.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-teal-50">
                    <p className="text-5xl mb-3">🏥</p>
                    <p className="font-semibold text-teal-950">No users found</p>
                    <p className="text-sm text-teal-900/60 mt-1">Users appear here once they sign up.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-teal-50 shadow-glass overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-teal-50 text-left">
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Name</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Email</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Role</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Onboarded</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Change role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-50">
                        {filteredPatients.map((p) => (
                          <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-teal-50/30 transition">
                            <td className="px-5 py-3 font-medium text-teal-950">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                                  {(p.full_name ?? p.email ?? "?").slice(0, 1).toUpperCase()}
                                </div>
                                <span className="truncate max-w-[140px]">{p.full_name ?? "—"}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-teal-800/70 truncate max-w-[180px]">{p.email ?? "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                                ${p.role === "admin" ? "bg-violet-50 text-violet-700 border-violet-200"
                                  : p.role === "doctor" ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-teal-50 text-teal-700 border-teal-200"}`}>
                                {p.role}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                                ${p.onboarding_completed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                {p.onboarding_completed ? "✓ Yes" : "Pending"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <select
                                value={p.role}
                                disabled={busyId === p.id}
                                onChange={(e) => void changeRole(p.id, e.target.value as "patient" | "doctor" | "admin")}
                                className="rounded-xl border border-teal-100 bg-teal-50/50 px-2 py-1 text-xs font-medium text-teal-900 disabled:opacity-50"
                              >
                                <option value="patient">patient</option>
                                <option value="doctor">doctor</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Appointments ── */}
            {tab === "appointments" && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-teal-900/70">{allAppointments.length} total appointments</p>
                {allAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-teal-50">
                    <p className="text-5xl mb-3">📅</p>
                    <p className="font-semibold text-teal-950">No appointments yet</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-teal-50 shadow-glass overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-teal-50 text-left">
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Patient</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Doctor</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Status</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Scheduled</th>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-teal-800/50">Requested</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-50">
                        {allAppointments
                          .filter((a) => !searchQ ||
                            ((a.patient as {full_name?: string})?.full_name ?? "").toLowerCase().includes(searchQ.toLowerCase()) ||
                            ((a.patient as {email?: string})?.email ?? "").toLowerCase().includes(searchQ.toLowerCase()) ||
                            ((a.doctor as {full_name?: string})?.full_name ?? "").toLowerCase().includes(searchQ.toLowerCase())
                          )
                          .map((appt) => {
                            const patient = appt.patient as {full_name?: string; email?: string} | undefined;
                            const doctor = appt.doctor as {full_name?: string; specialization?: string} | undefined;
                            return (
                              <tr key={appt.id} className="hover:bg-teal-50/30 transition">
                                <td className="px-5 py-3">
                                  <p className="font-medium text-teal-950 truncate max-w-[140px]">{patient?.full_name ?? "—"}</p>
                                  <p className="text-xs text-teal-800/50 truncate">{patient?.email ?? ""}</p>
                                </td>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-teal-950 truncate max-w-[140px]">{doctor?.full_name ?? "—"}</p>
                                  <p className="text-xs text-teal-800/50">{doctor?.specialization ?? ""}</p>
                                </td>
                                <td className="px-5 py-3">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                                    ${appt.status === "confirmed" ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : appt.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : appt.status === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                    {appt.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-xs text-teal-800/60">
                                  {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-5 py-3 text-xs text-teal-800/60">
                                  {new Date(appt.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Assessments ── */}
            {tab === "assessments" && (
              <motion.div key="assess" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatCard label="Total assessments" value={stats.assessmentsCount} icon="🧠" color="bg-violet-400" />
                  <StatCard label="Registered users" value={patients.length} icon="🏥" color="bg-cyan-400" />
                </div>
                {allAssessments.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-teal-50 shadow-glass p-8 text-center space-y-3">
                    <p className="text-4xl">📊</p>
                    <p className="font-bold text-teal-950">No assessments yet</p>
                    <p className="text-sm text-teal-900/60">Patient assessments will appear here once created.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allAssessments
                      .filter((a) => !searchQ ||
                        ((a.patient as {full_name?: string})?.full_name ?? "").toLowerCase().includes(searchQ.toLowerCase()) ||
                        ((a.patient as {email?: string})?.email ?? "").toLowerCase().includes(searchQ.toLowerCase())
                      )
                      .map((assess) => {
                        const patient = assess.patient as {full_name?: string; email?: string} | undefined;
                        return (
                          <motion.div key={assess.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-teal-50 shadow-glass p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 flex-shrink-0">
                                {(patient?.full_name ?? patient?.email ?? "?").slice(0, 1).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div>
                                    <p className="font-semibold text-teal-950">{patient?.full_name ?? "Unknown patient"}</p>
                                    <p className="text-xs text-teal-800/50">{patient?.email ?? ""}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-teal-800/50">{new Date(assess.created_at).toLocaleString()}</p>
                                    {assess.language && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 font-semibold">
                                        {assess.language}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-teal-900/80 mt-2 whitespace-pre-line line-clamp-3">{assess.summary}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Settings ── */}
            {tab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-white rounded-3xl border border-teal-50 shadow-glass p-6 space-y-5">
                  <h2 className="font-bold text-teal-950">Admin settings</h2>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-teal-900">
                      Doctor application link
                      <div className="flex gap-2 mt-1.5">
                        <input
                          readOnly
                          value={applyUrl}
                          className="flex-1 rounded-2xl border border-teal-100 bg-teal-50/50 px-3 py-2 text-sm font-mono text-teal-800"
                        />
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => void copyLink()}
                          className="px-4 py-2 rounded-2xl bg-teal-600 text-white text-sm font-semibold"
                        >
                          Copy
                        </motion.button>
                      </div>
                      <p className="text-xs text-teal-800/50 mt-1">Share this link with doctors who want to apply to NeoHomeo.</p>
                    </label>
                  </div>

                  <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm text-teal-900/70">
                    <p className="font-semibold text-teal-900 mb-1">Admin email</p>
                    <p className="font-mono text-xs">{user?.email}</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── Edit Doctor Modal ── */}
      <AnimatePresence>
        {editingDoc && (
          <motion.div
            key="edit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditingDoc(null); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-teal-50 w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-teal-950">Edit doctor profile</h2>
                    <p className="text-xs text-teal-800/55">{editingDoc.full_name}</p>
                  </div>
                  <button onClick={() => setEditingDoc(null)} className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 text-lg hover:bg-teal-100 transition flex items-center justify-center">✕</button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {([
                    { label: "Specialization", key: "specialization", type: "text" },
                    { label: "Experience (years)", key: "experience_years", type: "number" },
                    { label: "Clinic name", key: "clinic_name", type: "text" },
                    { label: "Consultation fee (₹)", key: "consultation_fee", type: "number" },
                    { label: "Clinic address", key: "clinic_address", type: "text", span: true },
                    { label: "Languages (comma-separated)", key: "languages", type: "text", span: true },
                    { label: "Calendly URL", key: "calendly_url", type: "text", span: true },
                    { label: "Match keywords", key: "match_keywords", type: "text", span: true },
                  ] as { label: string; key: keyof typeof editForm; type: string; span?: boolean }[]).map(({ label, key, type, span }) => (
                    <label key={key} className={`block font-medium text-teal-900 ${span ? "md:col-span-2" : ""}`}>
                      {label}
                      <input
                        type={type}
                        value={editForm[key]}
                        onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-teal-100 bg-teal-50/40 px-3 py-2 text-sm font-normal"
                      />
                    </label>
                  ))}
                  <label className="block font-medium text-teal-900 md:col-span-2">
                    Bio
                    <textarea rows={3} value={editForm.bio}
                      onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-teal-100 bg-teal-50/40 px-3 py-2 text-sm font-normal" />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => void saveEdit()}
                    disabled={savingEdit}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm disabled:opacity-50 shadow"
                  >
                    {savingEdit ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    onClick={() => setEditingDoc(null)}
                    className="px-5 py-3 rounded-2xl border border-teal-100 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold z-50 flex items-center gap-2
              ${toast.kind === "success" ? "bg-teal-900 text-white" : "bg-rose-600 text-white"}`}
          >
            {toast.kind === "success" ? "✓" : "✕"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
