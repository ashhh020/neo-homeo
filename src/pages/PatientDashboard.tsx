import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  getLatestAssessmentSummary,
  listApprovedDoctors,
  listAssessmentsForPatient,
  type AssessmentRecord,
  type DoctorRow,
} from "../lib/api";
import { matchDoctorsToSummary, type MatchedDoctor } from "../lib/matching";

function calEmbedUrl(url: string) {
  const sep = url.includes("?") ? "&" : "?";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${url}${sep}embed_type=Inline&embed_domain=${encodeURIComponent(host)}`;
}

export default function PatientDashboard() {
  const { user, profile, patientDetails, signOut } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [pick, setPick] = useState<MatchedDoctor | null>(null);

  useEffect(() => {
    if (!user) return;
    void Promise.all([listAssessmentsForPatient(user.id), listApprovedDoctors(), getLatestAssessmentSummary(user.id)]).then(
      ([a, d, s]) => {
        setAssessments(a);
        setDoctors(d);
        setSummary(s);
      }
    );
  }, [user]);

  const matched = useMemo(() => {
    const s = summary ?? assessments[0]?.summary ?? "";
    return matchDoctorsToSummary(s, doctors).slice(0, 6);
  }, [summary, assessments, doctors]);

  const displayName = profile?.full_name ?? user?.email ?? "Patient";

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <NeoLogo compact />
            <p className="text-sm text-teal-900/65 mt-2">
              Signed in as <span className="font-semibold text-teal-900">{user?.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
                <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[140px]">
                  <p className="text-[10px] uppercase text-teal-700/70">Profile</p>
                  <p className="text-sm font-semibold text-teal-950">{patientDetails?.city ?? "—"}</p>
                </div>
                <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[140px]">
                  <p className="text-[10px] uppercase text-teal-700/70">Assessments</p>
                  <p className="text-sm font-semibold text-teal-950">{assessments.length}</p>
                </div>
                <div className="rounded-2xl bg-white/90 border border-teal-100 px-4 py-3 min-w-[140px]">
                  <p className="text-[10px] uppercase text-teal-700/70">Match pool</p>
                  <p className="text-sm font-semibold text-teal-950">{doctors.length} doctors</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-5 border border-white/80 bg-white/50">
              <h3 className="font-semibold text-teal-950 mb-2">Quick paths</h3>
              <ul className="space-y-2 text-sm text-teal-800">
                <li>
                  <Link className="hover:text-teal-600" to="/">
                    Marketing site
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-teal-600" to="/apply">
                    Refer a physician
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-teal-950">Matched physicians</h2>
              <p className="text-sm text-teal-900/65">
                Ranked by overlap between your latest assessment narrative and each doctor&apos;s specialty keywords.
              </p>
            </div>
            {!summary && assessments.length === 0 && (
              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                Complete Dr. Neo to unlock stronger matches
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {matched.map((doc) => (
              <button
                type="button"
                key={doc.id}
                onClick={() => setPick(doc)}
                className={`text-left glass-panel p-5 transition hover:-translate-y-0.5 ${
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
              </button>
            ))}
          </div>

          {pick?.calendly_url && (
            <div className="glass-panel p-4 space-y-3">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-teal-950">Book {pick.full_name}</h3>
                <a
                  href={pick.calendly_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-teal-700 underline"
                >
                  Open in new tab
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden border border-teal-100 bg-white min-h-[640px]">
                <iframe title="Calendly" src={calEmbedUrl(pick.calendly_url)} className="w-full h-[640px]" />
              </div>
            </div>
          )}

          {pick && !pick.calendly_url && (
            <p className="text-sm text-teal-800/70">This physician has not connected Calendly yet. Our care desk will coordinate.</p>
          )}
        </section>

        <section className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-teal-950">Assessment history</h3>
            <Link to="/assessment" className="text-sm font-semibold text-teal-700">
              New assessment
            </Link>
          </div>
          {assessments.length === 0 ? (
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
      </div>
    </PageShell>
  );
}
