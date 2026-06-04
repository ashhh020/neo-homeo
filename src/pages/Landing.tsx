import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";

/* ── Luma popup ── */
function LumaPopup({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {/* responsive iframe wrapper — 600×450 aspect ratio */}
        <div className="w-full" style={{ paddingBottom: "75%" /* 450/600 */, position: "relative" }}>
          <iframe
            src="https://luma.com/embed/event/evt-yWZrKEAoGAA9T4A/simple"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: "1.5rem" }}
            allow="fullscreen; payment"
            aria-hidden="false"
            tabIndex={0}
            title="NeoHomeo Event"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── data ── */
const steps = [
  { icon: "01", title: "Complete AI assessment", body: "Dr. Neo gathers symptoms, lifestyle, emotions, and triggers in a warm guided conversation.", color: "from-teal-500 to-cyan-500" },
  { icon: "02", title: "Get matched with a doctor", body: "AI weighs specialty, language, and availability so the fit feels completely natural.", color: "from-cyan-500 to-blue-500" },
  { icon: "03", title: "Online consultation", body: "Secure video or audio visit with structured notes shared to your dashboard.", color: "from-violet-500 to-purple-500" },
  { icon: "04", title: "Start your healing journey", body: "Prescriptions, medicine tracking, and follow-up assessments all in one calm place.", color: "from-emerald-500 to-teal-500" },
];

const categories = [
  { title: "Skin problems", desc: "Eczema, acne, and chronic irritation patterns.", slug: "skin-problems" },
  { title: "Hair fall", desc: "Diffuse shedding, post-illness recovery, scalp health.", slug: "hair-fall" },
  { title: "Migraine", desc: "Aura, triggers, menstrual association, and relief rhythm.", slug: "migraine" },
  { title: "PCOS", desc: "Cycles, metabolic signals, and mood-linked symptoms.", slug: "pcos" },
  { title: "Thyroid balance", desc: "Energy, temperature sensitivity, and weight shifts.", slug: "thyroid" },
  { title: "Stress & anxiety", desc: "Sleep, focus, and how your body holds tension.", slug: "stress-anxiety" },
  { title: "Allergies", desc: "Seasonal flare, food sensitivity, and respiratory comfort.", slug: "allergies" },
  { title: "Joint pain", desc: "Morning stiffness, exertion limits, and inflammation cues.", slug: "joint-pain" },
  { title: "Digestive issues", desc: "Bloating, acidity, appetite swings, and elimination.", slug: "digestive" },
  { title: "Children's care", desc: "Gentle, age-aware history taking with caregiver support.", slug: "children" },
];

const faqs = [
  { q: "Is this real homeopathy?", a: "Yes. NeoHomeo connects you with licensed practitioners who practice classical and modern homeopathic approaches." },
  { q: "Is AI diagnosing me?", a: "No. Dr. Neo only collects and structures information. Licensed doctors interpret your case and decide next steps." },
  { q: "Are doctors verified?", a: "Every clinician passes document review, identity checks, and an operations audit before appearing publicly." },
  { q: "How are medicines delivered?", a: "After a valid prescription, logistics partners dispatch tracked kits to your doorstep." },
  { q: "How long do treatments take?", a: "Homeopathy is individualized; your doctor sets realistic milestones and follow-up cadence." },
];

const testimonials = [
  { quote: "The assessment felt like a thoughtful intake, not a chatbot gimmick. My doctor already knew the contours of my symptoms.", name: "Ananya S.", city: "Bengaluru", rating: 5 },
  { quote: "I appreciated the emotional questions. Stress was tied to my migraines in a way no previous form captured.", name: "Rahul M.", city: "Hyderabad", rating: 5 },
  { quote: "Seeing the medicine journey in one dashboard removed the anxiety of remembering doses during travel.", name: "Meera K.", city: "Kochi", rating: 5 },
];

// trust pills are now embedded inside the hero stat badges



/* ── FAQ accordion item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="glass-panel p-0 overflow-hidden"
      whileHover={{ y: -1 }}
    >
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-teal-950">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-teal-500 flex-shrink-0 text-lg">⌄</motion.span>
      </button>
      <AnimateHeight open={open}>
        <p className="px-5 pb-4 text-sm text-teal-900/70 leading-relaxed">{a}</p>
      </AnimateHeight>
    </motion.div>
  );
}

function AnimateHeight({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}

/* ── main ── */
export default function Landing() {
  const [tIndex, setTIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lumaOpen, setLumaOpen] = useState(false);

  function closeLuma() {
    setLumaOpen(false);
    sessionStorage.setItem("luma_dismissed", "1");
  }

  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("luma_dismissed")) return;
    const t = setTimeout(() => setLumaOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageShell className="hero-gradient">
      {/* ── Luma popup ── */}
      <AnimatePresence>
        {lumaOpen && <LumaPopup onClose={closeLuma} />}
      </AnimatePresence>

      {/* ── navbar ── */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-nav rounded-full px-6 py-3 flex w-full max-w-5xl items-center justify-between gap-4"
        >
          <Link to="/"><NeoLogo compact /></Link>

          <div className="hidden md:flex gap-7 text-xs font-bold text-teal-800 uppercase tracking-widest">
            {[["#treatments", "Treatments"], ["#how", "How it works"], ["#neo", "Dr. Neo"], ["#faq", "FAQ"], ["/about", "About"]].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-teal-600 transition">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex text-sm font-semibold text-teal-800 px-4 py-2 rounded-full hover:bg-white/70 transition">
              Login
            </Link>
            <Link to="/signup" className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2 rounded-full shadow-lg hover:shadow-teal-500/30 transition">
              Get started
            </Link>
            <button className="md:hidden ml-1 text-teal-800 p-1" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Menu">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </motion.nav>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur rounded-3xl border border-teal-100 shadow-xl p-4 flex flex-col gap-2"
          >
            {[["#treatments", "Treatments"], ["#how", "How it works"], ["#neo", "Dr. Neo"], ["#faq", "FAQ"], ["/about", "About"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-teal-900 px-4 py-2 rounded-2xl hover:bg-teal-50">
                {label}
              </a>
            ))}
            <div className="border-t border-teal-100 pt-2 flex gap-2">
              <Link to="/login" className="flex-1 text-center text-sm font-semibold text-teal-900 py-2 rounded-2xl border border-teal-100">Login</Link>
              <Link to="/signup" className="flex-1 text-center text-sm font-bold bg-teal-600 text-white py-2 rounded-2xl">Get started</Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* ── HERO — full-width, outside the constrained main ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">

        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 35%, #e0f2fe 65%, #eff6ff 100%)" }}
        />
        {/* Soft teal orb top-left — static, no animation */}
        <div className="absolute -top-20 -left-20 w-[480px] h-[480px] rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
        {/* Emerald orb bottom-center — static */}
        <div className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

        {/* Doctor image — starts below navbar, shifted 20% right */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 top-20 right-0 left-0 flex items-end justify-end pointer-events-none select-none"
        >
          <img
            src="/hero-doctors.png"
            alt="Verified homeopathic doctors on NeoHomeo"
            draggable={false}
            className="h-full w-auto max-w-none object-cover object-bottom"
            style={{ transform: "translateX(20%)" }}
          />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 inset-x-0 h-56 pointer-events-none"
            style={{ background: "linear-gradient(to top, #ecfdf5 0%, rgba(236,253,245,0.6) 50%, transparent 100%)" }}
          />
          {/* Left fade — keeps text legible */}
          <div
            className="absolute inset-y-0 left-0 w-[55%] pointer-events-none"
            style={{ background: "linear-gradient(to right, #f0fdfa 30%, rgba(240,253,250,0.85) 60%, transparent 100%)" }}
          />
        </motion.div>

        {/* NeoHomeo watermark */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center select-none pointer-events-none overflow-hidden">
          <span
            className="text-[160px] md:text-[220px] font-black leading-none tracking-tight"
            style={{
              background: "linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(6,182,212,0.12) 40%, rgba(139,92,246,0.08) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NeoHomeo
          </span>
        </div>

        {/* Content */}
        <div className="relative w-full max-w-6xl mx-auto px-8 pt-36 pb-28">
          <div className="max-w-xl space-y-8">

            <motion.h1 className="space-y-0 leading-[1.05]">
              {["Homeopathic.", "Anywhere.", "Anytime."].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 + i * 0.1 }}
                  className="block text-5xl md:text-[68px] font-black text-teal-950 tracking-tight"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.38 }}
              className="text-base md:text-lg text-teal-900/65 leading-relaxed hero-speakable"
            >
              Connect with certified homeopathic doctors through AI-assisted consultations, manage your health records, and receive personalized remedies — all from the comfort of your home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/assessment"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-full text-base font-bold shadow-xl shadow-teal-500/25 transition"
              >
                Start Consultation
              </Link>
              <Link to="/apply"
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white border border-teal-200 text-teal-950 px-8 py-4 rounded-full text-base font-bold shadow-sm transition"
              >
                For Doctors
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-wrap gap-3 pt-1"
            >
              {[
                { icon: "🩺", label: "10+ verified doctors" },
                { icon: "📋", label: "100+ assessments done" },
                { icon: "✦", label: "Free AI assessment" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50/80 border border-teal-100 px-3 py-1.5 rounded-full">
                  <span>{b.icon}</span>{b.label}
                </span>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Luma event section ── */}
      <section className="w-full max-w-3xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">Upcoming</p>
          <h2 className="text-3xl font-light text-teal-950">Join our next event</h2>
        </div>
        {/* responsive wrapper: 600×450 → 75% padding-bottom */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingBottom: "min(450px, 75%)" }}>
          <iframe
            src="https://luma.com/embed/event/evt-yWZrKEAoGAA9T4A/simple"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid #bfcbda88", borderRadius: "1rem" }}
            allow="fullscreen; payment"
            aria-hidden="false"
            tabIndex={0}
            title="NeoHomeo Event"
          />
        </div>
      </section>

      <main className="pb-24 px-4 max-w-6xl mx-auto space-y-28">

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">The process</p>
            <h2 className="text-4xl font-light text-teal-950">How NeoHomeo works</h2>
            <p className="text-teal-900/65 max-w-xl mx-auto">Four steps from first message to ongoing care.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(13,148,136,0.15)" }}
                className="glass-panel p-6 flex flex-col gap-3 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${s.color}`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-base font-black text-white shadow-lg`}>
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="text-lg font-semibold text-teal-950">{s.title}</h3>
                <p className="text-sm text-teal-900/65 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DISEASE CATEGORIES ── */}
        <section id="treatments" className="space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">Focus areas</p>
            <h2 className="text-4xl font-light text-teal-950">Conditions we support</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, scale: 0.93 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 16px 32px rgba(13,148,136,0.14)" }}
                className="glass-panel p-5 flex flex-col gap-2 cursor-pointer group"
              >
                <h3 className="font-bold text-teal-950 text-sm">{c.title}</h3>
                <p className="text-xs text-teal-900/60 leading-relaxed flex-1">{c.desc}</p>
                <Link to={`/conditions/${c.slug}`} className="text-xs font-bold text-teal-600 group-hover:text-teal-800 transition">
                  Learn more →
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DR NEO EXPLAINER ── */}
        <section id="neo" className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <span className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">Trust</span>
            <h2 className="text-3xl md:text-4xl font-light text-teal-950">
              Dr. Neo prepares your case,{" "}
              <span className="font-medium italic" style={{
                background: "linear-gradient(135deg,#0d9488,#8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>never replaces</span>{" "}
              your doctor
            </h2>
            <p className="text-teal-900/70 leading-relaxed">
              Dr. Neo is an AI-powered assistant that collects symptoms and prepares a structured handoff. Licensed physicians review everything and chart the therapeutic path.
            </p>
            <ul className="space-y-2.5 text-sm text-teal-900/75">
              {["Guided assessment tree — not random questions", "Multilingual conversation with optional voice input", "Outputs a clinician-ready summary to your record", "Never gives a diagnosis or prescribes remedies"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/assessment"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 rounded-full shadow-lg shadow-teal-500/20"
            >
              Open Dr. Neo →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-6 space-y-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-transparent to-violet-50/40" />
            <div className="relative space-y-3 text-sm">
              {[
                { role: "ai", text: "What's your main concern today?" },
                { role: "user", text: "Chronic skin rash — itchy, worse in summer." },
                { role: "ai", text: "I'll explore triggers, diet, and stress next. What typically worsens it?" },
                { role: "user", text: "Heat, and I've noticed stress at work." },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-white border border-teal-100 text-teal-900 rounded-bl-sm shadow-sm"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="relative flex flex-wrap gap-2 pt-1">
              {["Skin type", "Diet", "Sleep", "Stress", "Season"].map((c) => (
                <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-medium">{c}</span>
              ))}
            </div>
            <p className="relative text-[10px] text-teal-800/50 text-center">Not for emergencies · call 112 for urgent care</p>
          </motion.div>
        </section>



        {/* ── TESTIMONIALS ── */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">Stories</p>
            <h2 className="text-4xl font-light text-teal-950">What patients say</h2>
          </div>
          <div className="glass-panel p-8 max-w-3xl mx-auto text-center space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-transparent to-violet-50/40" />
            <div className="relative">
              <div className="flex justify-center mb-3 gap-0.5">
                {Array.from({ length: testimonials[tIndex].rating }).map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <motion.p
                key={tIndex}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-lg text-teal-900/80 leading-relaxed italic"
              >
                "{testimonials[tIndex].quote}"
              </motion.p>
              <motion.p
                key={`name-${tIndex}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm font-bold text-teal-800 mt-3"
              >
                {testimonials[tIndex].name} · {testimonials[tIndex].city}
              </motion.p>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setTIndex(i)}
                    className={`h-2 rounded-full transition-all ${i === tIndex ? "w-8 bg-teal-600" : "w-2 bg-teal-200"}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="max-w-3xl mx-auto space-y-3">
          <div className="text-center space-y-2 mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">FAQ</p>
            <h2 className="text-4xl font-light text-teal-950">Answers before you begin</h2>
          </div>
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </section>

        {/* ── FINAL CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden glass-panel p-12 text-center space-y-5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-cyan-50/30 to-violet-50/40" />
          <div className="relative space-y-5">
            <h3 className="text-3xl font-light text-teal-950">Ready to begin your healing journey?</h3>
            <p className="text-teal-900/65 max-w-xl mx-auto">
              Start with Dr. Neo, meet your doctor, and keep every prescription and follow-up in one calm place.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/assessment"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition"
              >
                Start free assessment →
              </Link>
              <Link to="/signup"
                className="bg-white text-teal-900 px-8 py-4 rounded-full font-bold border border-teal-100 hover:bg-teal-50 transition shadow-sm"
              >
                Create patient account
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-teal-100 bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm text-teal-900/70">
          <div className="space-y-3">
            <NeoLogo compact />
            <p className="text-xs leading-relaxed">AI-powered digital infrastructure for modern homeopathy.</p>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-teal-700 transition">About NeoHomeo</Link></li>
              <li><a href="#how" className="hover:text-teal-700 transition">How it works</a></li>
              <li><Link to="/apply" className="hover:text-teal-700 transition">Join as a doctor</Link></li>
              <li><Link to="/admin/login" className="hover:text-teal-700 transition">Operations login</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Policies</p>
            <ul className="space-y-2">
              <li><Link to="/legal/privacy" className="hover:text-teal-700 transition">Privacy policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-teal-700 transition">Terms of use</Link></li>
              <li><Link to="/legal/disclaimer" className="hover:text-teal-700 transition">Medical disclaimer</Link></li>
              <li><Link to="/legal/refund" className="hover:text-teal-700 transition">Refund policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Contact</p>
            <a href="mailto:connect@neohomeo.com" className="hover:text-teal-700 transition">connect@neohomeo.com</a>
            <p className="mt-1"><a href="tel:+919704640098" className="hover:text-teal-700 transition">+91 97046 40098</a></p>
            <div className="flex gap-3 mt-3">
              <a href="https://x.com/neohomeo" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold hover:bg-teal-100 transition" aria-label="X / Twitter">
                𝕏
              </a>
              <a href="https://linkedin.com/company/neohomeo" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold hover:bg-teal-100 transition" aria-label="LinkedIn">
                in
              </a>
              <a href="https://instagram.com/neohomeo" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold hover:bg-teal-100 transition" aria-label="Instagram">
                IG
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-teal-50 py-4 text-center text-xs text-teal-800/40">
          © {new Date().getFullYear()} NeoHomeo. Not a substitute for professional medical advice.
        </div>
      </footer>
    </PageShell>
  );
}
