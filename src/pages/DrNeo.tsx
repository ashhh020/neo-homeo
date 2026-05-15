import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildPatientContextForAi, saveAssessment } from "../lib/api";
import {
  extractAssessmentJson,
  generateNeoReply,
  LANGUAGE_BCP47,
  parseOptions,
  stripOptionsAndCompleteMarkers,
  type ChatTurn,
} from "../lib/gemini";

/* ─────────────────────────── constants ─────────────────────────── */
type Step = "lang" | "info" | "chat" | "complete";

const LANGUAGES = [
  { name: "English", flag: "🇬🇧", bcp: "en-IN", color: "from-blue-500 to-indigo-600" },
  { name: "Hindi", flag: "🇮🇳", bcp: "hi-IN", color: "from-orange-500 to-rose-600" },
  { name: "Telugu", flag: "🌿", bcp: "te-IN", color: "from-emerald-500 to-teal-600" },
  { name: "Urdu", flag: "☪️", bcp: "ur-PK", color: "from-green-600 to-emerald-700" },
  { name: "Malayalam", flag: "🌴", bcp: "ml-IN", color: "from-teal-500 to-cyan-600" },
  { name: "Tamil", flag: "🏛️", bcp: "ta-IN", color: "from-yellow-500 to-orange-600" },
  { name: "Marathi", flag: "🦁", bcp: "mr-IN", color: "from-purple-500 to-violet-600" },
  { name: "Kannada", flag: "🌺", bcp: "kn-IN", color: "from-pink-500 to-rose-600" },
];

const INTROS: Record<string, string> = {
  English: "Hi, I'm Dr. Neo — your homeopathy assessment guide. Your NeoHomeo profile is already with me, so we'll go straight to what's bringing you here today. What's the main concern you'd like your physician to focus on?",
  Hindi: "नमस्ते, मैं डॉ. नियो हूँ। आपकी प्रोफ़ाइल मेरे पास है। आज आप किस मुख्य समस्या के बारे में बात करना चाहेंगे?",
  Telugu: "నమస్కారం, నేను డాక్టర్ నియో. మీ వివరాలు నాకు అందుబాటులో ఉన్నాయి. ఇప్పుడు మీ ప్రధాన ఆరోగ్య సమస్య ఏమిటో చెప్పండి.",
  Urdu: "السلام علیکم، میں ڈاکٹر نیو ہوں۔ آپ کا ریکارڈ میرے پاس ہے۔ آج آپ کس مسئلے پر بات کرنا چاہتے ہیں؟",
  Malayalam: "നമസ്കാരം, ഞാൻ ഡോ. നിയോ. നിങ്ങളുടെ പ്രൊഫൈൽ എന്റെ കൈയിലുണ്ട്. ഇന്ന് ഏത് ആരോഗ്യ പ്രശ്നത്തെക്കുറിച്ചാണ് സംസാരിക്കേണ്ടത്?",
  Tamil: "வணக்கம், நான் டாக்டர் நியோ. உங்கள் சுயவிவரம் என்னிடம் உள்ளது. இன்று உங்கள் முக்கிய உடல்நல பிரச்சினை என்ன?",
  Marathi: "नमस्कार, मी डॉ. नियो. तुमची माहिती माझ्याकडे आहे. आज तुम्ही कोणत्या मुख्य समस्येबद्दल बोलायचे आहे?",
  Kannada: "ನಮಸ್ಕಾರ, ನಾನು ಡಾ. ನಿಯೋ. ನಿಮ್ಮ ಮಾಹಿತಿ ನನ್ನ ಬಳಿ ಇದೆ. ಇಂದು ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಏನು?",
};

/* ─────────────────────── animated bg particles ──────────────────── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 12,
        delay: Math.random() * 5,
        dur: 6 + Math.random() * 8,
        color: ["#2dd4bf", "#22d3ee", "#a78bfa", "#34d399", "#60a5fa"][Math.floor(Math.random() * 5)],
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -30, 0], x: [0, 12, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* large glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
    </div>
  );
}

/* ─────────────────────── typing indicator ───────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-white/10 backdrop-blur rounded-2xl rounded-bl-sm w-fit border border-white/20">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-teal-300"
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── dr neo avatar ─────────────────────────── */
function DrNeoAvatar({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.08 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #2dd4bf, #22d3ee, #a78bfa, #2dd4bf)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-[2px] rounded-full bg-[#0a1628] flex items-center justify-center"
      >
        <span style={{ fontSize: size * 0.45 }}>🩺</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── main page ─────────────────────────── */
export default function DrNeo() {
  const { user, profile, patientDetails, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("lang");
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [customLang, setCustomLang] = useState("");
  const [consent, setConsent] = useState(false);
  const [tts, setTts] = useState(true);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const patientContext = useMemo(() => {
    if (!profile) return "";
    return buildPatientContextForAi(profile, patientDetails);
  }, [profile, patientDetails]);

  const resolvedLang = useMemo(() => {
    const c = customLang.trim();
    if (c) return c;
    if (selectedLang) return selectedLang;
    return patientDetails?.language_preference?.trim() || "English";
  }, [customLang, selectedLang, patientDetails?.language_preference]);

  const bcp47 = useMemo(() => LANGUAGE_BCP47[resolvedLang] ?? "en-IN", [resolvedLang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, aiLoading]);

  function speak(text: string) {
    if (!tts || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = bcp47;
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  }

  function beginChat() {
    if (!profile) return;
    const intro = INTROS[resolvedLang] ?? INTROS.English;
    setHistory([
      { role: "user", text: `[session]\n${patientContext}\nPreferred response language: ${resolvedLang}.` },
      { role: "model", text: intro },
    ]);
    speak(intro);
    setStep("chat");
    setTimeout(() => inputRef.current?.focus(), 400);
  }

  async function handleSend(text?: string) {
    const payload = (text ?? input).trim();
    if (!payload || aiLoading || !user) return;
    setInput("");
    setError(null);
    const userTurn: ChatTurn = { role: "user", text: payload };
    setAiLoading(true);
    try {
      const reply = await generateNeoReply([...history, userTurn], patientContext);
      setHistory((h) => [...h, userTurn, { role: "model", text: reply }]);
      speak(stripOptionsAndCompleteMarkers(reply));
      const done = extractAssessmentJson(reply);
      if (done) {
        await saveAssessment({ patientId: user.id, language: resolvedLang, summary: done.summary, rawJson: done.raw });
        setStep("complete");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dr. Neo is temporarily unavailable");
    } finally {
      setAiLoading(false);
    }
  }

  function toggleMic() {
    type Rec = {
      lang: string; continuous: boolean; interimResults: boolean;
      start(): void;
      onresult: ((ev: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null; onend: (() => void) | null;
    };
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported in this browser."); return; }
    if (listening) { setListening(false); return; }
    const rec = new SR();
    rec.lang = bcp47; rec.interimResults = false; rec.continuous = false;
    rec.onresult = (ev) => {
      const t = ev.results[0][0].transcript.trim();
      setInput((p) => (p ? `${p}, ${t}` : t));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true); rec.start();
  }

  const visibleHistory = history.filter((m) => !(m.role === "user" && m.text.startsWith("[session]")));
  const lastModel = [...history].reverse().find((m) => m.role === "model");
  const options = lastModel ? parseOptions(lastModel.text) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }
  if (!user || !profile) return <Navigate to="/login" replace />;
  if (!profile.onboarding_completed || !patientDetails) return <Navigate to="/onboarding/patient" replace />;

  return (
    <div className="relative min-h-screen bg-[#060d1a] text-white overflow-hidden font-sans">
      <Particles />

      {/* top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 16h14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="font-bold tracking-[0.18em] text-sm text-white group-hover:text-teal-300 transition">NEOHOMEO</span>
        </Link>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white transition">
            <div
              onClick={() => setTts((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${tts ? "bg-teal-500" : "bg-white/20"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${tts ? "translate-x-4" : ""}`} />
            </div>
            Voice
          </label>
          <span className="text-xs text-white/40 bg-white/10 px-3 py-1 rounded-full border border-white/10">Dr. Neo</span>
        </div>
      </div>

      {/* step content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Language ── */}
          {step === "lang" && (
            <motion.div key="lang"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <DrNeoAvatar size={72} />
                <div className="mt-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent"
                  >
                    Hi, I'm Dr. Neo
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="text-white/60 mt-2 text-sm"
                  >
                    Choose your preferred language to begin the assessment
                  </motion.p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LANGUAGES.map((lang, i) => (
                  <motion.button
                    key={lang.name}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedLang(lang.name); setStep("info"); }}
                    className={`relative overflow-hidden rounded-2xl p-4 border border-white/10 text-center group cursor-pointer
                      ${selectedLang === lang.name ? "border-teal-400/60 bg-teal-500/20" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="text-2xl mb-1">{lang.flag}</div>
                    <div className="text-xs font-semibold text-white/80">{lang.name}</div>
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-xs text-white/40 mb-2">Or type your preferred language</p>
                <div className="flex gap-2 max-w-xs mx-auto">
                  <input
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    placeholder="e.g. Gujarati, Bengali…"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-400 transition"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    disabled={!customLang.trim()}
                    onClick={() => { if (customLang.trim()) setStep("info"); }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40"
                  >
                    Go
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Patient Info + Consent ── */}
          {step === "info" && (
            <motion.div key="info"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <button onClick={() => setStep("lang")} className="text-xs text-white/40 hover:text-white/80 transition flex items-center gap-1">
                ← Back
              </button>
              <div className="text-center space-y-1">
                <DrNeoAvatar size={56} />
                <h2 className="text-xl font-bold text-white mt-3">Confirm your details</h2>
                <p className="text-white/50 text-sm">Session language: <span className="text-teal-300 font-semibold">{resolvedLang}</span></p>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
                {/* glow border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/10 via-transparent to-violet-500/10 pointer-events-none" />

                <div className="relative grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ["Name", profile.full_name ?? "—"],
                    ["Gender", patientDetails?.gender ?? "—"],
                    ["City", patientDetails?.city ?? "—"],
                    ["Diet", patientDetails?.diet_type ?? "—"],
                    ["Sleep", patientDetails?.sleep_hours ? `${patientDetails.sleep_hours}h/night` : "—"],
                    ["Language", resolvedLang],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
                      <p className="text-white font-medium mt-0.5 truncate">{val}</p>
                    </div>
                  ))}
                </div>

                <label className="relative flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 accent-teal-400 w-4 h-4"
                  />
                  <p className="text-xs text-white/60 leading-relaxed">
                    I understand Dr. Neo is an AI assistant that collects symptoms for my physician. This is not a diagnosis or emergency service. I consent to this assessment being stored in my NeoHomeo record.
                  </p>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={!consent}
                  onClick={beginChat}
                  className="relative w-full py-4 rounded-2xl font-bold text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 animate-gradient-x" />
                  <span className="relative flex items-center justify-center gap-2">
                    Begin assessment <span className="text-lg">→</span>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Chat ── */}
          {step === "chat" && (
            <motion.div key="chat"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4"
              style={{ height: "calc(100vh - 140px)", minHeight: 520 }}
            >
              {/* chat header */}
              <div className="flex items-center gap-3 px-1">
                <DrNeoAvatar size={40} />
                <div>
                  <p className="font-bold text-white text-sm">Dr. Neo</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/50">Online · {resolvedLang}</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-white/30 bg-white/10 px-2 py-1 rounded-full">Secure session</span>
                </div>
              </div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {visibleHistory.map((m, idx) => (
                    <motion.div
                      key={`${idx}-${m.text.slice(0, 8)}`}
                      initial={{ opacity: 0, y: 12, x: m.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start items-end"}`}
                    >
                      {m.role === "model" && <DrNeoAvatar size={28} />}
                      <div
                        className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-br-sm"
                            : "bg-white/10 backdrop-blur border border-white/20 text-white/90 rounded-bl-sm"
                        }`}
                      >
                        {m.role === "model" ? stripOptionsAndCompleteMarkers(m.text) : m.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-end"
                  >
                    <DrNeoAvatar size={28} />
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* option chips */}
              <AnimatePresence>
                {options && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {options.map((opt) => (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          setInput((prev) => {
                            const part = opt.trim();
                            if (!prev) return part;
                            if (prev.includes(part)) return prev;
                            return `${prev}, ${part}`;
                          })
                        }
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-teal-400/40 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 transition"
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* error */}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 text-center">
                  {error}
                </motion.p>
              )}

              {/* input bar */}
              <div className="relative flex items-end gap-2 bg-white/5 border border-white/20 rounded-3xl p-2 backdrop-blur">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                  placeholder="Describe symptoms, timing, what makes it better or worse…"
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none focus:outline-none px-2 py-1 max-h-28"
                />
                <div className="flex flex-col gap-1.5 pb-0.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={toggleMic}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base transition-all ${
                      listening
                        ? "bg-rose-500 shadow-[0_0_16px_rgba(239,68,68,0.6)] animate-pulse"
                        : "bg-white/10 border border-white/20 hover:bg-white/20"
                    }`}
                    aria-label="Microphone"
                  >
                    🎙
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    disabled={aiLoading || !input.trim()}
                    onClick={() => void handleSend()}
                    className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold disabled:opacity-40 shadow-lg"
                    aria-label="Send"
                  >
                    ↑
                  </motion.button>
                </div>
              </div>

              <p className="text-center text-[10px] text-white/25">
                Dr. Neo collects information only. Not for emergencies — call 112 if urgent.
              </p>
            </motion.div>
          )}

          {/* ── STEP 4: Complete ── */}
          {step === "complete" && (
            <motion.div key="complete"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(52,211,153,0.4)]"
              >
                ✓
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">Assessment Complete</h2>
                <p className="text-white/60 text-sm mt-2 max-w-sm mx-auto">
                  Dr. Neo has saved your structured summary. Your matched doctors can now review it before the consultation.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {[
                  ["Summary saved", "✓"], ["Doctor matching", "→"], ["Consultation booking", "→"], ["Treatment tracking", "→"]
                ].map(([label, icon]) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-center">
                    <span className="text-teal-400 text-lg">{icon}</span>
                    <p className="text-white/70 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg hover:shadow-teal-500/30 transition"
                >
                  Go to dashboard
                </Link>
                <button
                  onClick={() => { setStep("lang"); setHistory([]); setSelectedLang(""); setConsent(false); }}
                  className="px-6 py-3 rounded-full font-semibold text-white/70 border border-white/20 hover:bg-white/10 transition"
                >
                  New assessment
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
