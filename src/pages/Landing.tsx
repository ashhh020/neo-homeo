import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { listApprovedDoctors, type DoctorRow } from "../lib/api";

/* ── data ── */
const steps = [
  { icon: "🧠", title: "Complete AI assessment", body: "Dr. Neo gathers symptoms, lifestyle, emotions, and triggers in a warm guided conversation.", color: "from-teal-500 to-cyan-500" },
  { icon: "🎯", title: "Get matched with a doctor", body: "AI weighs specialty, language, and availability so the fit feels completely natural.", color: "from-cyan-500 to-blue-500" },
  { icon: "📹", title: "Online consultation", body: "Secure video or audio visit with structured notes shared to your dashboard.", color: "from-violet-500 to-purple-500" },
  { icon: "🌿", title: "Start your healing journey", body: "Prescriptions, medicine tracking, and follow-up assessments all in one calm place.", color: "from-emerald-500 to-teal-500" },
];

const categories = [
  { icon: "🌿", title: "Skin problems", desc: "Eczema, acne, and chronic irritation patterns." },
  { icon: "💆", title: "Hair fall", desc: "Diffuse shedding, post-illness recovery, scalp health." },
  { icon: "🧠", title: "Migraine", desc: "Aura, triggers, menstrual association, and relief rhythm." },
  { icon: "⚡", title: "PCOS", desc: "Cycles, metabolic signals, and mood-linked symptoms." },
  { icon: "🦋", title: "Thyroid balance", desc: "Energy, temperature sensitivity, and weight shifts." },
  { icon: "🧘", title: "Stress & anxiety", desc: "Sleep, focus, and how your body holds tension." },
  { icon: "🌸", title: "Allergies", desc: "Seasonal flare, food sensitivity, and respiratory comfort." },
  { icon: "🦴", title: "Joint pain", desc: "Morning stiffness, exertion limits, and inflammation cues." },
  { icon: "🫃", title: "Digestive issues", desc: "Bloating, acidity, appetite swings, and elimination." },
  { icon: "👶", title: "Children's care", desc: "Gentle, age-aware history taking with caregiver support." },
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

const trustPills = ["✓ Certified doctors", "✓ AI-assisted assessments", "✓ Personalized remedies", "✓ Online consultations", "✓ Root-cause treatment"];

/* ── animated hero chat demo ── */
const chatDemoMessages = [
  { role: "ai", text: "Hi! What's your main concern today?", delay: 0 },
  { role: "user", text: "I get migraines before exams, behind my eyes.", delay: 1.2 },
  { role: "ai", text: "Thank you. How often do they occur, and what helps?", delay: 2.5 },
  { role: "user", text: "2–3 times a month. Sleep helps a little.", delay: 3.7 },
  { role: "ai", text: "Noted. I'll also ask about stress, sleep, and lifestyle next.", delay: 5 },
];

function ChatDemo() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const timers = chatDemoMessages.map((m, i) =>
      setTimeout(() => setVisible(i + 1), m.delay * 1000 + 600)
    );
    const reset = setTimeout(() => setVisible(0), 8500);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, [visible]);

  return (
    <div className="space-y-3 text-sm">
      {chatDemoMessages.slice(0, visible).map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8, x: m.role === "user" ? 10 : -10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            m.role === "user"
              ? "bg-teal-600 text-white rounded-br-sm"
              : "bg-white/90 border border-teal-100 text-teal-900 rounded-bl-sm shadow-sm"
          }`}>
            {m.text}
          </div>
        </motion.div>
      ))}
      {visible < chatDemoMessages.length && visible > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
          <div className="bg-white/90 border border-teal-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400"
                animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, delay: i * 0.16, repeat: Infinity }} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

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
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [tIndex, setTIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  useEffect(() => { void listApprovedDoctors().then(setDoctors); }, []);
  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <PageShell className="hero-gradient">
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
            {[["#treatments", "Treatments"], ["#doctors", "Doctors"], ["#how", "How it works"], ["#neo", "Dr. Neo"], ["#faq", "FAQ"]].map(([href, label]) => (
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
            <button className="md:hidden ml-1 text-teal-800" onClick={() => setMobileMenuOpen((v) => !v)}>☰</button>
          </div>
        </motion.nav>

        {/* mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur rounded-3xl border border-teal-100 shadow-xl p-4 flex flex-col gap-2"
          >
            {[["#treatments", "Treatments"], ["#doctors", "Doctors"], ["#how", "How it works"], ["#neo", "Dr. Neo"], ["#faq", "FAQ"]].map(([href, label]) => (
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

      <main className="pt-28 pb-24 px-4 max-w-6xl mx-auto space-y-28">

        {/* ── HERO ── */}
        <section ref={heroRef} className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-teal-600 bg-teal-50 border border-teal-100 px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                NeoHomeo platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extralight text-teal-950 leading-[1.1]"
            >
              Heal from the{" "}
              <span className="font-bold italic" style={{
                background: "linear-gradient(135deg, #0d9488, #22d3ee, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                root,
              </span>
              <br />
              <span className="font-light">not the symptoms.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-teal-900/65 max-w-xl leading-relaxed"
            >
              AI-assisted homeopathic consultations personalized for your body, emotions, and lifestyle — then matched with verified physicians.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/assessment"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-[1.6rem] text-lg font-bold shadow-xl shadow-teal-500/20 transition"
              >
                Start free assessment <span>→</span>
              </Link>
              <a href="#how"
                className="inline-flex items-center gap-2 bg-white/80 border border-white px-8 py-4 rounded-[1.6rem] text-lg font-semibold text-teal-900 shadow-sm hover:bg-white transition"
              >
                How it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2"
            >
              {trustPills.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="text-xs font-semibold text-teal-700 bg-teal-50/80 border border-teal-100 px-3 py-1.5 rounded-full"
                >
                  {t}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* chat demo card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            {/* glow ring */}
            <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-teal-300/40 via-cyan-200/20 to-violet-300/30 blur-xl" />
            <div className="relative glass-panel p-6 space-y-4 overflow-hidden">
              {/* card header */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full animate-spin"
                    style={{ background: "conic-gradient(from 0deg,#2dd4bf,#22d3ee,#a78bfa,#2dd4bf)", animationDuration: "3s" }} />
                  <div className="absolute inset-[2px] rounded-full bg-white flex items-center justify-center text-base">🩺</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-teal-950">Dr. Neo</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-teal-800/50">AI assessment active</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-1">
                  {["bg-rose-400","bg-amber-400","bg-emerald-400"].map((c) => (
                    <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
              </div>

              <div className="min-h-[220px]">
                <ChatDemo />
              </div>

              <div className="flex gap-2 flex-wrap pt-1">
                {["Sleep pattern", "Stress level", "Diet type", "Triggers"].map((chip) => (
                  <span key={chip} className="text-xs px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-medium">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

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
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-lg`}>
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
                <span className="text-2xl">{c.icon}</span>
                <h3 className="font-bold text-teal-950 text-sm">{c.title}</h3>
                <p className="text-xs text-teal-900/60 leading-relaxed flex-1">{c.desc}</p>
                <Link to="/assessment" className="text-xs font-bold text-teal-600 group-hover:text-teal-800 transition">
                  Assess now →
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

        {/* ── DOCTORS ── */}
        <section id="doctors" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-teal-700/70 font-bold">Clinicians</p>
              <h2 className="text-4xl font-light text-teal-950 mt-1">Verified doctors on NeoHomeo</h2>
              <p className="text-teal-900/65 mt-2 max-w-xl">Profiles appear only after admin verification and document review.</p>
            </div>
            <Link to="/apply"
              className="self-start text-sm font-bold bg-white border border-teal-100 px-5 py-2.5 rounded-full shadow-sm hover:bg-teal-50 transition"
            >
              Physician application →
            </Link>
          </div>

          {doctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="glass-panel p-12 text-center space-y-3"
            >
              <p className="text-4xl">👨‍⚕️</p>
              <p className="font-semibold text-teal-950">Verified doctor profiles appear here</p>
              <p className="text-sm text-teal-900/65 max-w-sm mx-auto">Profiles are published after the clinical team approves applications.</p>
              <Link to="/apply" className="inline-flex text-sm font-bold text-teal-600">Apply as a doctor →</Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {doctors.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(13,148,136,0.15)" }}
                  className="glass-panel p-6 flex gap-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-50 overflow-hidden flex-shrink-0">
                    {d.photo_url
                      ? <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-teal-700">{d.full_name.slice(0, 1)}</div>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-bold text-teal-950">{d.full_name}</h3>
                      <span className="text-sm text-amber-600 font-semibold">★ {Number(d.rating).toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-teal-800/70">{d.specialization}</p>
                    <p className="text-xs text-teal-900/55">{d.experience_years}+ yrs · {d.languages.join(", ")}</p>
                    <p className="text-sm font-bold text-teal-900">₹{d.consultation_fee} consultation</p>
                    <div className="flex gap-3 pt-1">
                      <Link to={`/doctors/${d.id}`} className="text-sm font-bold text-teal-600 hover:text-teal-800 transition">View profile →</Link>
                      {d.calendly_url && <Link to={`/doctors/${d.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">Book online</Link>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
              <div className="flex justify-center mb-3">
                {Array.from({ length: testimonials[tIndex].rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
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
      <footer className="border-t border-teal-100 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm text-teal-900/70">
          <div className="space-y-3">
            <NeoLogo compact />
            <p className="text-xs leading-relaxed">AI-powered digital infrastructure for modern homeopathy.</p>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link to="/admin/login" className="hover:text-teal-700 transition">Operations login</Link></li>
              <li><a href="#how" className="hover:text-teal-700 transition">How it works</a></li>
              <li><Link to="/apply" className="hover:text-teal-700 transition">Doctors</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Policies</p>
            <ul className="space-y-2">
              <li className="cursor-pointer hover:text-teal-700 transition">Privacy policy</li>
              <li className="cursor-pointer hover:text-teal-700 transition">Terms of use</li>
              <li className="cursor-pointer hover:text-teal-700 transition">Medical disclaimer</li>
              <li className="cursor-pointer hover:text-teal-700 transition">Refund policy</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-teal-900 mb-3">Contact</p>
            <p>care@neohomeo.com</p>
            <p className="mt-1">+91 80 4620 4410</p>
            <div className="flex gap-3 mt-3">
              {["𝕏", "in", "📷"].map((icon) => (
                <div key={icon} className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-sm cursor-pointer hover:bg-teal-100 transition">
                  {icon}
                </div>
              ))}
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
