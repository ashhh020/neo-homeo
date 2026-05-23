import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppointmentRow, PatientDetails, AssessmentRecord } from "../lib/api";

interface Props {
  appointment: AppointmentRow;
  patientName: string;
  patientEmail: string;
  patientDetails: PatientDetails | null;
  latestAssessment: AssessmentRecord | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-teal-800/50 w-36 flex-shrink-0">{label}</span>
      <span className="text-teal-950 font-medium">{value}</span>
    </div>
  );
}

export function AppointmentReceipt({ appointment, patientName, patientEmail, patientDetails, latestAssessment, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (overlayRef.current === e.target) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const doctor = appointment.doctor as {
    full_name?: string;
    specialization?: string;
    consultation_fee?: number;
    photo_url?: string;
  } | undefined;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/40 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1">Booking Confirmed</p>
                <h2 className="text-2xl font-bold">Appointment Receipt</h2>
                <p className="text-sm opacity-80 mt-0.5">#{appointment.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* ── Doctor Info ── */}
            <section className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-teal-700">Consulting Doctor</h3>
              <div className="flex items-center gap-4 bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-200 to-cyan-200 flex-shrink-0 overflow-hidden">
                  {doctor?.photo_url
                    ? <img src={doctor.photo_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-teal-700">
                        {(doctor?.full_name ?? "D").charAt(0)}
                      </div>
                  }
                </div>
                <div className="flex-1">
                  <p className="font-bold text-teal-950">{doctor?.full_name ?? "Doctor"}</p>
                  <p className="text-sm text-teal-800/70">{doctor?.specialization}</p>
                  {doctor?.consultation_fee && (
                    <p className="text-sm font-semibold text-teal-700 mt-0.5">₹{doctor.consultation_fee} consultation fee</p>
                  )}
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold capitalize">
                  {appointment.status}
                </span>
              </div>
              {appointment.scheduled_at && (
                <div className="flex items-center gap-2 text-sm text-teal-900/70 px-1">
                  <span>{new Date(appointment.scheduled_at).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</span>
                </div>
              )}
              {appointment.notes && (
                <div className="text-sm text-teal-900/70 bg-teal-50 rounded-xl px-4 py-2">
                  <span className="font-semibold text-teal-900">Doctor's note: </span>{appointment.notes}
                </div>
              )}
            </section>

            {/* ── Patient Details ── */}
            <section className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-teal-700">Patient Information</h3>
              <div className="bg-white border border-teal-100 rounded-2xl px-5 py-4 space-y-2.5">
                <Row label="Name"            value={patientName} />
                <Row label="Email"           value={patientEmail} />
                {patientDetails && (
                  <>
                    <Row label="Phone"           value={patientDetails.phone} />
                    <Row label="Date of birth"   value={patientDetails.date_of_birth} />
                    <Row label="Gender"          value={patientDetails.gender} />
                    <Row label="City"            value={patientDetails.city} />
                    <Row label="Blood group"     value={patientDetails.blood_group} />
                    <Row label="Height"          value={patientDetails.height_cm ? `${patientDetails.height_cm} cm` : null} />
                    <Row label="Weight"          value={patientDetails.weight_kg ? `${patientDetails.weight_kg} kg` : null} />
                    <Row label="Occupation"      value={patientDetails.occupation} />
                    <Row label="Diet"            value={patientDetails.diet_type} />
                    <Row label="Sleep hours"     value={patientDetails.sleep_hours ? `${patientDetails.sleep_hours} hrs/night` : null} />
                    <Row label="Stress level"    value={patientDetails.stress_level} />
                  </>
                )}
              </div>
            </section>

            {/* ── Medical History ── */}
            {patientDetails && (patientDetails.past_diseases || patientDetails.current_medicines || patientDetails.allergies || patientDetails.family_history) && (
              <section className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-teal-700">Medical History</h3>
                <div className="bg-white border border-teal-100 rounded-2xl px-5 py-4 space-y-2.5">
                  <Row label="Past diseases"       value={patientDetails.past_diseases} />
                  <Row label="Current medicines"   value={patientDetails.current_medicines} />
                  <Row label="Allergies"           value={patientDetails.allergies} />
                  <Row label="Family history"      value={patientDetails.family_history} />
                  <Row label="Surgeries"           value={patientDetails.surgeries} />
                </div>
              </section>
            )}

            {/* ── Assessment Summary ── */}
            {latestAssessment && (
              <section className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-teal-700">Latest Assessment Summary</h3>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl px-5 py-4">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-teal-800/50">
                      <span>Dr. Neo</span>
                      {latestAssessment.language && <span>· {latestAssessment.language}</span>}
                    </div>
                    <span className="text-[10px] text-teal-800/40">
                      {new Date(latestAssessment.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-teal-950 leading-relaxed whitespace-pre-line">{latestAssessment.summary}</p>
                </div>
              </section>
            )}

            {/* ── Mental & Lifestyle ── */}
            {patientDetails && (patientDetails.anxiety_notes || patientDetails.mood_pattern || patientDetails.emotional_triggers || patientDetails.lifestyle_notes) && (
              <section className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold text-teal-700">Lifestyle & Mental Health</h3>
                <div className="bg-white border border-teal-100 rounded-2xl px-5 py-4 space-y-2.5">
                  <Row label="Anxiety notes"       value={patientDetails.anxiety_notes} />
                  <Row label="Mood pattern"         value={patientDetails.mood_pattern} />
                  <Row label="Energy level"         value={patientDetails.energy_level} />
                  <Row label="Emotional triggers"   value={patientDetails.emotional_triggers} />
                  <Row label="Lifestyle notes"      value={patientDetails.lifestyle_notes} />
                </div>
              </section>
            )}

            {/* ── Footer ── */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-teal-500/20"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-2xl border border-teal-100 text-teal-900 text-sm font-semibold hover:bg-teal-50 transition"
              >
                Print
              </button>
            </div>

            <p className="text-[10px] text-center text-teal-800/40">
              NeoHomeo · Appointment ID: {appointment.id} · Generated {new Date().toLocaleString()}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
