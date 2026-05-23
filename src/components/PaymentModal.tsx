import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Razorpay types ───────────────────────────────────────────── */
interface RazorpayOptions {
  key: string;
  amount: number;          // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

/* ── load Razorpay checkout.js once ───────────────────────────── */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ── component ────────────────────────────────────────────────── */
export interface PaymentModalProps {
  doctorName: string;
  specialization: string;
  fee: number;
  patientName: string;
  patientEmail: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export function PaymentModal({
  doctorName,
  specialization,
  fee,
  patientName,
  patientEmail,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (overlayRef.current === e.target) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load payment gateway. Please check your connection.");
      setLoading(false);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    if (!keyId) {
      setError("Payment gateway is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    const options: RazorpayOptions = {
      key: keyId,
      amount: fee * 100,          // paise
      currency: "INR",
      name: "NeoHomeo",
      description: `Consultation with ${doctorName}`,
      prefill: { name: patientName, email: patientEmail },
      notes: { doctor: doctorName, specialization },
      theme: { color: "#0d9488" },
      handler(response) {
        onSuccess(response.razorpay_payment_id);
      },
      modal: {
        ondismiss() {
          setLoading(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Failed to open payment window. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/40 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 px-6 py-6 text-white">
            <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1">Appointment Booking</p>
            <h2 className="text-2xl font-bold leading-snug">{doctorName}</h2>
            <p className="text-sm opacity-80 mt-0.5">{specialization}</p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">
            {/* Fee summary */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm text-teal-900/80">
                <span>Consultation fee</span>
                <span className="font-semibold">₹{fee}</span>
              </div>
              <div className="flex justify-between text-sm text-teal-900/80">
                <span>Platform fee</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-teal-200 pt-3 flex justify-between font-bold text-teal-950">
                <span>Total payable</span>
                <span className="text-xl">₹{fee}</span>
              </div>
            </div>

            {/* Patient */}
            <div className="flex items-center gap-3 bg-white border border-teal-100 rounded-2xl px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-950">{patientName}</p>
                <p className="text-xs text-teal-800/50">{patientEmail}</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {["Secure payment", "Instant confirmation", "Refund policy applied"].map((b) => (
                <span key={b} className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                  {b}
                </span>
              ))}
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-teal-100 text-teal-900 text-sm font-semibold hover:bg-teal-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => void handlePay()}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 disabled:opacity-60 transition"
              >
                {loading ? "Opening…" : `Pay ₹${fee}`}
              </button>
            </div>

            <p className="text-[10px] text-center text-teal-800/40">
              Powered by Razorpay · Your payment info is never stored on our servers
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
