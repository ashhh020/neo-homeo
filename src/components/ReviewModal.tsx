import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReview } from "../lib/api";
import { useToast } from "./Toast";

interface Props {
  patientId: string;
  doctorId: string;
  doctorName: string;
  onClose: () => void;
}

export function ReviewModal({ patientId, doctorId, doctorName, onClose }: Props) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!rating) { toast("Please select a star rating.", "error"); return; }
    setSaving(true);
    try {
      await submitReview({ patientId, doctorId, rating, comment: comment.trim() || undefined });
      toast("Review submitted — thank you!");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not submit review", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 space-y-6"
        >
          <div className="text-center space-y-1">
            <p className="text-2xl">⭐</p>
            <h2 className="text-lg font-semibold text-teal-950">Rate your consultation</h2>
            <p className="text-sm text-teal-900/65">with {doctorName}</p>
          </div>

          {/* Star picker */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={(hovered || rating) >= star ? "text-amber-400" : "text-teal-100"}>★</span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-teal-800/60">
              {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
            </p>
          )}

          <label className="block text-sm font-medium text-teal-900">
            Comment (optional)
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this physician…"
              className="mt-1 w-full rounded-2xl border border-teal-100 bg-teal-50/40 px-3 py-2 text-sm resize-none focus:outline-none focus:border-teal-400"
            />
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => void submit()}
              disabled={saving || !rating}
              className="flex-1 py-3 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {saving ? "Submitting…" : "Submit review"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-teal-100 text-sm font-semibold text-teal-900 hover:bg-teal-50 transition"
            >
              Skip
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
