import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://neohomeo.com/about#webpage",
  "url": "https://neohomeo.com/about",
  "name": "About NeoHomeo — AI-Powered Homeopathy Platform",
  "isPartOf": { "@id": "https://neohomeo.com/#website" },
  "about": { "@id": "https://neohomeo.com/#organization" },
  "description": "Learn about NeoHomeo — who we are, why we built the platform, and our mission to make quality homeopathic care accessible to everyone in India.",
  "inLanguage": "en",
};

const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "NeoHomeo", "item": "https://neohomeo.com/" },
    { "@type": "ListItem", "position": 2, "name": "About",    "item": "https://neohomeo.com/about" },
  ],
};

const values = [
  { icon: "🌿", title: "Classical wisdom", body: "We believe in the 200-year tradition of homeopathy — individual case-taking, constitutional remedies, and holistic healing." },
  { icon: "🤖", title: "Modern technology", body: "Dr. Neo — our AI assistant — structures your health history so your doctor can focus entirely on healing, not paperwork." },
  { icon: "🔒", title: "Privacy by design", body: "Your health data is yours. Encrypted end-to-end, shared only with your treating physician, never sold." },
  { icon: "🌐", title: "Accessible care", body: "Multilingual consultations, doorstep delivery, and mobile-first design — because healthcare should reach everyone." },
  { icon: "✓", title: "Verified doctors only", body: "Every practitioner on NeoHomeo passes document verification, identity checks, and an operations audit." },
  { icon: "📦", title: "End-to-end care", body: "From first assessment to prescription to medicine delivery — everything in one calm, organised place." },
];

const timeline = [
  { year: "2024", event: "NeoHomeo founded with the mission to digitise classical homeopathy." },
  { year: "2025", event: "Dr. Neo AI assistant launched. First verified doctors onboarded." },
  { year: "2025", event: "100+ patient assessments completed. Medicine delivery launched across India." },
  { year: "2026", event: "Platform expanded with multilingual consultations and mobile-first redesign." },
];

export default function About() {
  useEffect(() => {
    document.title = "About NeoHomeo — AI-Powered Homeopathy Platform";
    let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!el) { el = document.createElement("meta"); el.name = "description"; document.head.appendChild(el); }
    el.content = "Learn about NeoHomeo — India's AI-powered homeopathy platform. Our mission, values, story, and the team bringing modern homeopathic care online.";
  }, []);

  return (
    <PageShell className="hero-gradient">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB) }} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/90 px-6 py-3 flex items-center justify-between">
        <Link to="/"><NeoLogo compact /></Link>
        <nav className="hidden md:flex gap-6 text-xs font-bold text-teal-800 uppercase tracking-widest">
          <Link to="/#treatments" className="hover:text-teal-600 transition">Treatments</Link>
          <Link to="/#how" className="hover:text-teal-600 transition">How it works</Link>
          <Link to="/about" className="text-teal-600">About</Link>
        </nav>
        <Link to="/signup" className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2 rounded-full shadow-md">
          Get started
        </Link>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 pt-6 text-xs text-teal-900/50 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-teal-700 transition">Home</Link>
        <span>/</span>
        <span className="text-teal-800 font-medium">About</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">

        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-700/60 font-bold">About NeoHomeo</p>
          <h1 className="text-4xl md:text-5xl font-black text-teal-950 leading-tight">
            Making homeopathy accessible<br className="hidden md:block" /> to every Indian
          </h1>
          <p className="text-lg text-teal-900/65 max-w-2xl mx-auto leading-relaxed">
            NeoHomeo is India's AI-powered homeopathy platform — connecting patients with verified, licensed practitioners through thoughtful technology that honours the depth of classical homeopathic practice.
          </p>
        </motion.section>

        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-5">
            <h2 className="text-3xl font-light text-teal-950">Our mission</h2>
            <p className="text-teal-900/70 leading-relaxed">
              Quality homeopathic care has always required finding the right doctor, booking an appointment, waiting, and navigating a system that was never designed for busy modern lives.
            </p>
            <p className="text-teal-900/70 leading-relaxed">
              NeoHomeo was built to change that. We combined the wisdom of 200 years of homeopathic tradition with modern AI to remove the friction between patients and practitioners — so that anyone, anywhere in India, can access personalised homeopathic care from their phone.
            </p>
            <p className="text-teal-900/70 leading-relaxed">
              We don't replace the doctor. We prepare you for them. Our AI assistant, Dr. Neo, structures your symptom history into a clinician-ready summary — so every consultation starts with depth, not introductions.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-panel p-8 space-y-4">
            <h2 className="text-xl font-semibold text-teal-950">NeoHomeo in numbers</h2>
            {[
              { n: "10+",   l: "Verified homeopathic doctors" },
              { n: "100+",  l: "Patient assessments completed" },
              { n: "Free",  l: "AI-powered intake assessment" },
              { n: "Pan-India", l: "Medicine delivery coverage" },
            ].map(s => (
              <div key={s.l} className="flex items-center justify-between border-b border-teal-50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-teal-900/65">{s.l}</span>
                <span className="text-lg font-black text-teal-700">{s.n}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Values */}
        <section className="space-y-8">
          <h2 className="text-3xl font-light text-teal-950 text-center">What we stand for</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-panel p-6 space-y-2">
                <span className="text-2xl">{v.icon}</span>
                <h3 className="font-bold text-teal-950">{v.title}</h3>
                <p className="text-sm text-teal-900/65 leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story / Timeline */}
        <section className="space-y-8">
          <h2 className="text-3xl font-light text-teal-950">Our story</h2>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-100">
            {timeline.map((t, i) => (
              <motion.div key={t.year}
                initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 pl-12 relative">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 top-0">
                  {t.year.slice(2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">{t.year}</p>
                  <p className="text-sm text-teal-900/75 leading-relaxed">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-panel p-12 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-cyan-50/30 to-violet-50/40" />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-light text-teal-950">Ready to experience NeoHomeo?</h2>
            <p className="text-teal-900/65 max-w-md mx-auto text-sm">
              Start with a free AI assessment. Meet your doctor. Get personalised care — from anywhere in India.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/assessment"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition">
                Start free assessment →
              </Link>
              <Link to="/apply"
                className="bg-white text-teal-900 px-8 py-4 rounded-full font-bold border border-teal-100 hover:bg-teal-50 transition shadow-sm">
                Join as a doctor
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      <footer className="border-t border-teal-100 py-6 text-center text-xs text-teal-800/40 mt-8">
        © {new Date().getFullYear()} NeoHomeo ·{" "}
        <Link to="/legal/privacy" className="hover:underline">Privacy</Link> ·{" "}
        <Link to="/legal/terms" className="hover:underline">Terms</Link> ·{" "}
        <Link to="/legal/disclaimer" className="hover:underline">Medical disclaimer</Link>
      </footer>
    </PageShell>
  );
}
