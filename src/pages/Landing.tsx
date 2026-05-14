import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { listApprovedDoctors, type DoctorRow } from "../lib/api";

const steps = [
  {
    title: "Complete AI assessment",
    body: "Dr. Neo gathers symptoms, lifestyle, emotions, and triggers in a guided conversation.",
  },
  {
    title: "Get matched with a doctor",
    body: "We weigh specialty, languages you speak, and availability so the fit feels natural.",
  },
  {
    title: "Online consultation",
    body: "Secure video or audio visit with structured notes shared to your dashboard.",
  },
  {
    title: "Start your healing journey",
    body: "Prescriptions, medicine tracking, and follow-up assessments stay in one calm place.",
  },
];

const categories = [
  { title: "Skin problems", desc: "Eczema, acne, and chronic irritation patterns." },
  { title: "Hair fall", desc: "Diffuse shedding, post-illness recovery, scalp health." },
  { title: "Migraine", desc: "Aura, triggers, menstrual association, and relief rhythm." },
  { title: "PCOS", desc: "Cycles, metabolic signals, and mood-linked symptoms." },
  { title: "Thyroid balance", desc: "Energy, temperature sensitivity, and weight shifts." },
  { title: "Stress and anxiety", desc: "Sleep, focus, and how your body holds tension." },
  { title: "Allergies", desc: "Seasonal flare, food sensitivity, and respiratory comfort." },
  { title: "Joint pain", desc: "Morning stiffness, exertion limits, and inflammation cues." },
  { title: "Digestive issues", desc: "Bloating, acidity, appetite swings, and elimination." },
  { title: "Children's care", desc: "Gentle, age-aware history taking with caregiver support." },
];

const faqs = [
  {
    q: "Is this real homeopathy?",
    a: "Yes. NeoHomeo connects you with licensed practitioners who practice classical and modern homeopathic approaches.",
  },
  {
    q: "Is AI diagnosing me?",
    a: "No. Dr. Neo only collects and structures information. Licensed doctors interpret your case and decide next steps.",
  },
  {
    q: "Are doctors verified?",
    a: "Every clinician passes document review, identity checks, and an operations audit before appearing publicly.",
  },
  {
    q: "How are medicines delivered?",
    a: "After a valid prescription, logistics partners dispatch tracked kits to your doorstep with cold-chain when needed.",
  },
  {
    q: "How long do treatments take?",
    a: "Homeopathy is individualized; your doctor sets realistic milestones and follow-up cadence.",
  },
];

const testimonials = [
  {
    quote:
      "The assessment felt like a thoughtful intake, not a chatbot gimmick. My doctor already knew the contours of my symptoms.",
    name: "Ananya, Bengaluru",
  },
  {
    quote:
      "I appreciated the emotional questions. Stress was tied to my migraines in a way no previous form captured.",
    name: "Rahul, Hyderabad",
  },
  {
    quote:
      "Seeing the medicine journey in one dashboard removed the anxiety of remembering doses during travel.",
    name: "Meera, Kochi",
  },
];

export default function Landing() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    void listApprovedDoctors().then(setDoctors);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <PageShell>
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <nav className="glass-nav rounded-full px-6 py-3 flex w-full max-w-5xl items-center justify-between gap-4">
          <Link to="/">
            <NeoLogo compact />
          </Link>
          <div className="hidden md:flex gap-6 text-xs font-semibold text-teal-800 uppercase tracking-wide">
            <a href="#treatments" className="hover:text-teal-600">
              Treatments
            </a>
            <a href="#doctors" className="hover:text-teal-600">
              Doctors
            </a>
            <a href="#how" className="hover:text-teal-600">
              How it works
            </a>
            <a href="#neo" className="hover:text-teal-600">
              Dr. Neo
            </a>
            <a href="#faq" className="hover:text-teal-600">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-teal-800 px-3 py-2 rounded-full hover:bg-white/60"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold bg-teal-600 text-white px-4 py-2 rounded-full shadow hover:bg-teal-700 transition"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-32 pb-24 px-4 max-w-6xl mx-auto space-y-24">
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70 mb-4">NeoHomeo platform</p>
            <h1 className="text-4xl md:text-6xl font-extralight text-teal-950 leading-tight mb-6">
              Heal from the root, <span className="font-medium italic text-teal-700">not just the symptoms.</span>
            </h1>
            <p className="text-lg text-teal-900/65 mb-8 max-w-xl leading-relaxed">
              AI-assisted homeopathic consultations personalized for your body, emotions, and lifestyle—then matched
              with verified physicians.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-[1.6rem] text-lg font-medium shadow-lg transition"
              >
                Start free assessment
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center bg-white/80 border border-white px-8 py-4 rounded-[1.6rem] text-lg font-medium text-teal-900 shadow-sm hover:bg-white transition"
              >
                How it works
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-10 text-sm text-teal-900/70">
              {[
                "Certified doctors",
                "AI-assisted assessments",
                "Personalized remedies",
                "Online consultations",
                "Root-cause framing",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <div className="glass-panel p-8 min-h-[360px] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Dr. Neo preview</span>
                <span className="text-xs text-teal-800/60">Live in assessment</span>
              </div>
              <div className="space-y-3 text-sm text-teal-900/80">
                <div className="bg-teal-50/80 rounded-2xl px-4 py-3 border border-teal-100">
                  Hi, I am Dr. Neo. I will help collect your symptoms so our doctors can understand your story better.
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 border border-teal-50 shadow-sm self-end max-w-[90%]">
                  I get migraines before exams, mostly behind my eyes.
                </div>
                <div className="bg-teal-50/80 rounded-2xl px-4 py-3 border border-teal-100">
                  Thank you for sharing that. We will map triggers, sleep, and emotional load—then summarize for your
                  clinician.
                </div>
              </div>
              <div className="mt-auto flex gap-2 flex-wrap">
                {["Sleep", "Stress", "Diet", "Screen time"].map((chip) => (
                  <span key={chip} className="text-xs px-3 py-1 rounded-full bg-white border border-teal-100">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section id="how" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Flow</p>
            <h2 className="text-3xl md:text-4xl font-light text-teal-950">How NeoHomeo works</h2>
            <p className="text-teal-900/65">Four calm steps from first message to ongoing care.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-6 flex flex-col gap-3"
              >
                <div className="text-xs font-bold text-teal-600">Step {i + 1}</div>
                <h3 className="text-lg font-semibold text-teal-950">{s.title}</h3>
                <p className="text-sm text-teal-900/65 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="treatments" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Focus areas</p>
            <h2 className="text-3xl md:text-4xl font-light text-teal-950">Disease categories we support</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.title} className="glass-panel p-5 flex flex-col gap-2 hover:-translate-y-0.5 transition">
                <h3 className="font-semibold text-teal-950">{c.title}</h3>
                <p className="text-sm text-teal-900/65 flex-1">{c.desc}</p>
                <Link to="/assessment" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                  Start assessment →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="neo" className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Trust</p>
            <h2 className="text-3xl font-light text-teal-950">Dr. Neo prepares your case, never replaces your doctor</h2>
            <p className="text-teal-900/70 leading-relaxed">
              Dr. Neo is an AI-powered assistant that collects symptoms and prepares a structured handoff. Licensed
              physicians review everything, ask clarifying questions, and chart the therapeutic path.
            </p>
            <ul className="space-y-2 text-sm text-teal-900/75">
              <li>• Guided tree—not random questions</li>
              <li>• Multilingual conversation with optional voice</li>
              <li>• Outputs a clinician-ready summary in your record</li>
            </ul>
            <Link to="/assessment" className="inline-flex text-sm font-semibold text-teal-700">
              Open Dr. Neo →
            </Link>
          </div>
          <div className="glass-panel p-6 space-y-4">
            <div className="h-48 rounded-2xl bg-gradient-to-br from-teal-100 via-white to-blue-50 border border-white flex items-center justify-center text-teal-800/70 text-sm">
              Animated assessment canvas ships inside the live chat experience.
            </div>
            <p className="text-xs text-teal-800/60 text-center">Medical disclaimer applies; not for emergencies.</p>
          </div>
        </section>

        <section id="doctors" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Clinicians</p>
              <h2 className="text-3xl md:text-4xl font-light text-teal-950">Verified doctors on NeoHomeo</h2>
              <p className="text-teal-900/65 mt-2 max-w-xl">
                Profiles appear here only after admin verification. Patients book once a doctor connects availability.
              </p>
            </div>
            <Link
              to="/apply"
              className="self-start md:self-auto text-sm font-semibold bg-white border border-teal-100 px-4 py-2 rounded-full shadow-sm hover:bg-teal-50"
            >
              Physician application
            </Link>
          </div>
          {doctors.length === 0 ? (
            <div className="glass-panel p-10 text-center text-teal-900/70">
              Verified doctor profiles will appear here after the clinical team approves applications.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((d) => (
                <div key={d.id} className="glass-panel p-6 flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 border border-teal-50 overflow-hidden flex-shrink-0">
                    {d.photo_url ? (
                      <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-teal-700 text-lg font-semibold">
                        {d.full_name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-teal-950">{d.full_name}</h3>
                      <span className="text-sm text-amber-700">★ {Number(d.rating).toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-teal-800/70">{d.specialization}</p>
                    <p className="text-xs text-teal-900/60">
                      {d.experience_years}+ yrs · {d.languages.join(", ")}
                    </p>
                    <p className="text-sm font-semibold text-teal-900">₹{d.consultation_fee} consultation</p>
                    <p className="text-xs text-teal-800/60">
                      {d.calendly_url ? "Calendly connected" : "Scheduling via care team"}
                    </p>
                    <Link to="/login" className="text-sm font-semibold text-teal-700">
                      View profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Stories</p>
            <h2 className="text-3xl font-light text-teal-950">What patients mention first</h2>
          </div>
          <div className="glass-panel p-8 max-w-3xl mx-auto text-center space-y-4">
            <p className="text-lg text-teal-900/80 leading-relaxed">“{testimonials[tIndex].quote}”</p>
            <p className="text-sm font-semibold text-teal-800">{testimonials[tIndex].name}</p>
            <div className="flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setTIndex(i)}
                  className={`h-2 w-8 rounded-full ${i === tIndex ? "bg-teal-600" : "bg-teal-100"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-2 mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">FAQ</p>
            <h2 className="text-3xl font-light text-teal-950">Answers before you begin</h2>
          </div>
          {faqs.map((f) => (
            <details key={f.q} className="glass-panel p-4 group">
              <summary className="cursor-pointer font-semibold text-teal-950 list-none flex justify-between gap-2">
                {f.q}
                <span className="text-teal-500 group-open:rotate-180 transition">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-teal-900/70 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </section>

        <section className="text-center glass-panel p-10 space-y-4">
          <h3 className="text-2xl font-light text-teal-950">Ready when you are</h3>
          <p className="text-teal-900/65 max-w-xl mx-auto">
            Begin with Dr. Neo, meet your doctor, and keep every prescription and follow-up in one gentle surface.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/assessment" className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold shadow">
              Start free assessment
            </Link>
            <Link to="/signup" className="bg-white text-teal-900 px-8 py-3 rounded-full font-semibold border border-teal-100">
              Create patient account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-teal-100 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm text-teal-900/70">
          <div className="space-y-2">
            <NeoLogo compact />
            <p>AI-powered digital infrastructure for modern homeopathy.</p>
          </div>
          <div>
            <p className="font-semibold text-teal-900 mb-2">Company</p>
            <ul className="space-y-1">
              <li>
                <Link to="/admin/login" className="hover:text-teal-700">
                  Operations login
                </Link>
              </li>
              <li>
                <a href="#how" className="hover:text-teal-700">
                  How it works
                </a>
              </li>
              <li>
                <Link to="/apply" className="hover:text-teal-700">
                  Doctors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-teal-900 mb-2">Policies</p>
            <ul className="space-y-1">
              <li>Privacy policy</li>
              <li>Terms of use</li>
              <li>Medical disclaimer</li>
              <li>Refund policy</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-teal-900 mb-2">Contact</p>
            <p>care@neohomeo.com</p>
            <p className="mt-2">+91 80 4620 4410</p>
          </div>
        </div>
      </footer>
    </PageShell>
  );
}
