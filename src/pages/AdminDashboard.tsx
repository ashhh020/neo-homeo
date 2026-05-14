import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  getDashboardStats,
  listApprovedDoctors,
  listPendingDoctorApplications,
  setDoctorApplicationStatus,
  type DoctorRow,
} from "../lib/api";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [apps, setApps] = useState<DoctorRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [stats, setStats] = useState({ pendingDoctors: 0, approvedDoctors: 0, assessmentsCount: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const applyUrl = useMemo(() => `${window.location.origin}/apply`, []);

  async function refresh() {
    const [a, d, s] = await Promise.all([
      listPendingDoctorApplications(),
      listApprovedDoctors(),
      getDashboardStats(),
    ]);
    setApps(a);
    setDoctors(d);
    setStats(s);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(applyUrl);
      setToast("Doctor application link copied");
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Unable to access clipboard");
    }
  }

  async function decide(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await setDoctorApplicationStatus(id, status, note);
      setNote("");
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <NeoLogo compact />
            <p className="text-sm text-teal-900/65 mt-2">
              Console · <span className="font-semibold text-teal-900">{user?.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold shadow hover:bg-teal-700"
            >
              Copy doctor signup link
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-full border border-teal-100 bg-white text-sm font-semibold text-teal-900"
            >
              View site
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

        {toast && (
          <div className="fixed bottom-6 right-6 bg-teal-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
            {toast}
          </div>
        )}

        <section className="grid sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4">
            <p className="text-xs uppercase text-teal-800/60">Pending reviews</p>
            <p className="text-3xl font-semibold text-teal-950">{stats.pendingDoctors}</p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs uppercase text-teal-800/60">Live doctor profiles</p>
            <p className="text-3xl font-semibold text-teal-950">{stats.approvedDoctors}</p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs uppercase text-teal-800/60">Assessments stored</p>
            <p className="text-3xl font-semibold text-teal-950">{stats.assessmentsCount}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-teal-950">Doctor applications</h2>
            <p className="text-xs text-teal-800/60">Approving publishes a public profile on the marketing site.</p>
          </div>
          <div className="glass-panel overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-teal-800/60 border-b border-teal-100">
                <tr>
                  <th className="px-4 py-3">Physician</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-teal-50 align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-teal-950">{a.full_name}</div>
                      <div className="text-xs text-teal-800/60">{a.email}</div>
                      <div className="text-xs text-teal-800/60">{a.phone}</div>
                      <div className="text-xs mt-1 space-x-2">
                        {a.degree_url && (
                          <a className="text-teal-700 underline" href={a.degree_url} target="_blank" rel="noreferrer">
                            Degree
                          </a>
                        )}
                        {a.license_url && (
                          <a className="text-teal-700 underline" href={a.license_url} target="_blank" rel="noreferrer">
                            License
                          </a>
                        )}
                        {a.gov_id_url && (
                          <a className="text-teal-700 underline" href={a.gov_id_url} target="_blank" rel="noreferrer">
                            ID
                          </a>
                        )}
                        {a.photo_url && (
                          <a className="text-teal-700 underline" href={a.photo_url} target="_blank" rel="noreferrer">
                            Photo
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-teal-900/80">
                      <div>{a.specialization}</div>
                      <div className="text-xs text-teal-800/60">{a.experience_years}+ yrs</div>
                      <div className="text-xs text-teal-800/60">₹{a.consultation_fee}</div>
                      <div className="text-xs text-teal-800/60">{a.languages.join(", ")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800">
                        {a.status}
                      </span>
                      {a.admin_note && <p className="text-xs text-teal-800/60 mt-1">{a.admin_note}</p>}
                    </td>
                    <td className="px-4 py-3 space-y-2">
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => void decide(a.id, "approved")}
                        className="block w-full px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => void decide(a.id, "rejected")}
                        className="block w-full px-3 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-teal-900/60">
                      No pending applications.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <label className="block text-xs text-teal-800/70">
            Optional note on decision
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm"
            />
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-teal-950">Published doctors</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((d) => (
              <div key={d.id} className="glass-panel p-4 flex gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 overflow-hidden flex-shrink-0">
                  {d.photo_url ? (
                    <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-semibold text-teal-800">
                      {d.full_name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-teal-950">{d.full_name}</p>
                  <p className="text-xs text-teal-800/70">{d.specialization}</p>
                  <p className="text-xs text-teal-800/60 mt-1">
                    ★ {Number(d.rating).toFixed(1)} · {d.review_count} reviews
                  </p>
                </div>
              </div>
            ))}
            {doctors.length === 0 && (
              <p className="text-sm text-teal-900/65">No approved profiles. Approve an application or run the seed SQL.</p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
