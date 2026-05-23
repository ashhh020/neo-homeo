import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { NeoLogo, PageShell } from "../components/Shell";
import { fetchDoctorById, type DoctorRow } from "../lib/api";

function calEmbedUrl(url: string) {
  const sep = url.includes("?") ? "&" : "?";
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${url}${sep}embed_type=Inline&embed_domain=${encodeURIComponent(host)}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-teal-100/60 rounded-2xl ${className}`} />;
}

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DoctorRow | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    if (!id) { setDoc(null); return; }
    fetchDoctorById(id)
      .then(setDoc)
      .catch(() => setDoc(null));
  }, [id]);

  if (doc === undefined) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-52 w-full" />
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
        <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
          <NeoLogo />
          <p className="text-teal-900/70">Doctor profile not found or not yet approved.</p>
          <Link to="/" className="inline-block text-teal-700 underline text-sm">Back to home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-blue-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* nav */}
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 transition">
            ← Back
          </Link>
          <NeoLogo compact />
        </div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/80 via-teal-50/40 to-white/60 backdrop-blur-xl p-8 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {doc.photo_url ? (
                <img src={doc.photo_url} alt={doc.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-teal-700">{doc.full_name.slice(0, 1)}</span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-semibold text-teal-950">{doc.full_name}</h1>
              <p className="text-teal-700 font-medium">{doc.specialization}</p>
              {doc.qualification && <p className="text-sm text-teal-800/60">{doc.qualification}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">{doc.experience_years}+ yrs experience</span>
                <span className="px-3 py-1 rounded-full bg-white/80 border border-teal-100 text-xs font-semibold text-teal-900">₹{doc.consultation_fee} / session</span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">✓ Verified</span>
                {doc.calendly_url && <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">Online booking</span>}
              </div>
            </div>

            <div className="text-center sm:text-right flex-shrink-0">
              <p className="text-3xl font-bold text-amber-500">{Number(doc.rating).toFixed(1)} / 5</p>
              <p className="text-xs text-teal-800/50">{doc.review_count} review{doc.review_count !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </motion.div>

        {/* Details grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* About */}
          {doc.bio && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-panel p-5 space-y-2 md:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800/60">About</h2>
              <p className="text-sm text-teal-900/80 leading-relaxed">{doc.bio}</p>
            </motion.div>
          )}

          {/* Clinic */}
          {(doc.clinic_name || doc.clinic_address) && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="glass-panel p-5 space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800/60">Clinic</h2>
              {doc.clinic_name && <p className="text-sm font-semibold text-teal-950">{doc.clinic_name}</p>}
              {doc.clinic_address && <p className="text-sm text-teal-900/70">{doc.clinic_address}</p>}
            </motion.div>
          )}

          {/* Languages */}
          {doc.languages?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-panel p-5 space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800/60">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {doc.languages.map((l) => (
                  <span key={l} className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-teal-800">{l}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {doc.email && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="glass-panel p-5 space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-800/60">Contact</h2>
              <p className="text-sm text-teal-900/80">{doc.email}</p>
              {doc.phone && <p className="text-sm text-teal-900/80">{doc.phone}</p>}
            </motion.div>
          )}
        </div>

        {/* Booking / Calendly */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-teal-950">Book a consultation</h2>
            {doc.calendly_url && (
              <a href={doc.calendly_url} target="_blank" rel="noreferrer"
                className="text-sm font-semibold text-teal-700 underline">Open in Calendly ↗</a>
            )}
          </div>

          {doc.calendly_url ? (
            <div className="glass-panel p-0 overflow-hidden border border-teal-100 rounded-[1.5rem]">
              <iframe
                title={`Book ${doc.full_name}`}
                src={calEmbedUrl(doc.calendly_url)}
                className="w-full h-[640px]"
              />
            </div>
          ) : (
            <div className="glass-panel p-8 text-center space-y-3">
              <p className="font-semibold text-teal-950">Online booking coming soon</p>
              <p className="text-sm text-teal-900/65">
                This doctor hasn&apos;t linked a booking calendar yet. Sign up and get matched — our care desk will coordinate.
              </p>
              <Link to="/signup"
                className="inline-block px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition">
                Get started
              </Link>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <div className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <p className="font-semibold text-teal-950">Want a better match?</p>
            <p className="text-sm text-teal-900/70">Complete a Dr. Neo assessment and we'll find the right physician for your specific symptoms.</p>
          </div>
          <Link to="/signup"
            className="flex-shrink-0 px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold shadow hover:shadow-teal-400/30 transition">
            Start assessment
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
