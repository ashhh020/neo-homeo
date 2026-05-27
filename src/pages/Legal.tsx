import { Link, useParams } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";

const DOCS: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "What we collect",
        body: "We collect information you provide directly — name, email, phone number, health history entered during assessments, and payment details processed via our payment partners. We also collect standard usage data (device type, pages visited, session duration) through anonymised analytics.",
      },
      {
        heading: "How we use your data",
        body: "Your health information is used solely to match you with a suitable doctor and to generate your clinical case summary. We never sell your data. Aggregated, de-identified analytics may be used to improve platform features.",
      },
      {
        heading: "Data storage & security",
        body: "All data is stored on Supabase infrastructure with row-level security. Health records are encrypted at rest and in transit using AES-256 and TLS 1.3. Access is restricted to the doctor assigned to your case and our operations team.",
      },
      {
        heading: "Your rights",
        body: "You may request a copy of your data, ask us to correct inaccuracies, or request deletion at any time by writing to connect@neohomeo.com. Deletion requests are processed within 30 days.",
      },
      {
        heading: "Cookies",
        body: "We use session cookies for authentication and anonymous analytics cookies. We do not use advertising or tracking cookies.",
      },
      {
        heading: "Contact",
        body: "For privacy-related queries, reach us at connect@neohomeo.com or +91 97046 40098.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    sections: [
      {
        heading: "Acceptance",
        body: "By creating an account or using NeoHomeo, you agree to these Terms. If you disagree, please do not use the platform.",
      },
      {
        heading: "Eligibility",
        body: "You must be at least 18 years old to create an account. Minors may use the platform only under the supervision of a parent or legal guardian who accepts these Terms on their behalf.",
      },
      {
        heading: "Platform use",
        body: "NeoHomeo is a technology platform that connects patients with independent licensed homeopathic practitioners. We are not a healthcare provider and do not employ doctors. Consultations are provided by registered practitioners on the platform.",
      },
      {
        heading: "Accuracy of information",
        body: "You are responsible for providing accurate and complete health information. Providing false information may result in incorrect medical advice and may constitute a breach of these Terms.",
      },
      {
        heading: "Intellectual property",
        body: "All platform content, logos, and software are the property of NeoHomeo. You may not reproduce, distribute, or create derivative works without written permission.",
      },
      {
        heading: "Termination",
        body: "We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraud, or misuse the platform.",
      },
      {
        heading: "Governing law",
        body: "These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.",
      },
    ],
  },
  disclaimer: {
    title: "Medical Disclaimer",
    sections: [
      {
        heading: "Not a substitute for emergency care",
        body: "NeoHomeo is not an emergency service. If you or someone else is experiencing a medical emergency, please call 112 immediately or visit the nearest emergency room.",
      },
      {
        heading: "AI assistant limitations",
        body: "Dr. Neo is an AI-powered tool that collects and structures symptom information. It does not diagnose conditions, prescribe treatments, or replace professional clinical judgment. All treatment decisions are made by licensed practitioners.",
      },
      {
        heading: "Homeopathy context",
        body: "Homeopathy is a complementary medicine system. Outcomes vary between individuals. NeoHomeo does not guarantee specific results from any consultation or course of treatment.",
      },
      {
        heading: "Professional advice",
        body: "Information presented on this platform — including educational content, condition descriptions, and AI-collected summaries — is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making health decisions.",
      },
      {
        heading: "Chronic & serious conditions",
        body: "If you have a severe, chronic, or worsening condition, please consult an allopathic physician in addition to, or before, seeking homeopathic care.",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    sections: [
      {
        heading: "Consultation fees",
        body: "Consultation fees are charged per session as listed on each doctor's profile. Payment is collected at the time of booking confirmation.",
      },
      {
        heading: "Eligible refunds",
        body: "You are eligible for a full refund if: (a) the doctor cancels or does not attend the scheduled consultation; (b) a technical failure on our platform prevents the session from taking place; or (c) you cancel at least 2 hours before the scheduled appointment time.",
      },
      {
        heading: "Non-refundable situations",
        body: "Refunds will not be issued for consultations that have been completed, for cancellations made less than 2 hours before the appointment, or for dissatisfaction with the doctor's clinical opinion.",
      },
      {
        heading: "Processing time",
        body: "Approved refunds are processed within 5–7 business days to the original payment method.",
      },
      {
        heading: "Medicine orders",
        body: "Medicine orders that have been dispatched are non-refundable. Damaged or incorrect items must be reported within 48 hours of delivery with photographic evidence to connect@neohomeo.com.",
      },
      {
        heading: "How to request a refund",
        body: "Email connect@neohomeo.com with your booking ID and reason. Our support team will respond within 2 business days.",
      },
    ],
  },
};

export default function Legal() {
  const { slug } = useParams<{ slug: string }>();
  const doc = DOCS[slug ?? ""];

  if (!doc) {
    return (
      <PageShell className="hero-gradient">
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-5xl">404</p>
          <p className="text-teal-900/70">Page not found.</p>
          <Link to="/" className="text-teal-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="hero-gradient">
      {/* Minimal nav */}
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/90 px-6 py-3 flex items-center justify-between">
        <Link to="/"><NeoLogo compact /></Link>
        <Link to="/" className="text-sm text-teal-700 hover:text-teal-900 transition">← Back to home</Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-700/60 font-bold">Legal</p>
          <h1 className="text-4xl font-light text-teal-950">{doc.title}</h1>
          <p className="text-sm text-teal-900/50">Last updated May 2026 · NeoHomeo</p>
        </div>

        <div className="space-y-8">
          {doc.sections.map((s) => (
            <div key={s.heading} className="space-y-2">
              <h2 className="text-lg font-semibold text-teal-950">{s.heading}</h2>
              <p className="text-teal-900/70 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-teal-100 pt-8 text-sm text-teal-900/50">
          Questions? Email us at{" "}
          <a href="mailto:connect@neohomeo.com" className="text-teal-600 hover:underline">
            connect@neohomeo.com
          </a>
        </div>
      </main>

      <footer className="border-t border-teal-100 py-4 text-center text-xs text-teal-800/40">
        © {new Date().getFullYear()} NeoHomeo. Not a substitute for professional medical advice.
      </footer>
    </PageShell>
  );
}
