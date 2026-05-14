import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  buildPatientContextForAi,
  saveAssessment,
} from "../lib/api";
import {
  extractAssessmentJson,
  generateNeoReply,
  LANGUAGE_BCP47,
  parseOptions,
  stripOptionsAndCompleteMarkers,
  type ChatTurn,
} from "../lib/gemini";

type Step = "ready" | "chat" | "complete";

const INTROS: Record<string, string> = {
  English:
    "Hi, I'm Dr. Neo. I already have your NeoHomeo profile on file, so we can focus on what is bothering you right now. In your own words, what is the main concern you would like a physician to address?",
  Hindi:
    "नमस्ते, मैं डॉ. नियो हूँ। आपकी प्रोफ़ाइल मेरे पास है; आज आप किस मुख्य समस्या पर विस्तार से बात करना चाहेंगे?",
  Telugu:
    "నమస్కారం, నేను డాక్టర్ నియో. మీ వివరాలు నాకు అందుబాటులో ఉన్నాయి; ఇప్పుడు మీ ప్రధాన ఆరోగ్య సమస్య ఏమిటి?",
  Urdu:
    "السلام علیکم، میں ڈاکٹر نیو ہوں۔ آپ کا ریکارڈ میرے پاس ہے؛ آج آپ کس مسئلے پر تفصیل سے بات کرنا چاہیں گے؟",
  Malayalam:
    "നമസ്കാരം, ഞാൻ ഡോ. നിയോ. നിങ്ങളുടെ പ്രൊഫൈൽ എനിക്ക് ലഭ്യമാണ്; ഇന്ന് ഏത് പ്രധാന ആരോഗ്യ പ്രശ്നത്തെക്കുറിച്ചാണ് നാം ആദ്യം സംസാരിക്കേണ്ടത്?",
};

export default function DrNeo() {
  const { user, profile, patientDetails, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("ready");
  const [customLang, setCustomLang] = useState("");
  const [tts, setTts] = useState(true);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const patientContext = useMemo(() => {
    if (!profile) return "";
    return buildPatientContextForAi(profile, patientDetails);
  }, [profile, patientDetails]);

  const resolvedLang = useMemo(() => {
    const pref = patientDetails?.language_preference?.trim();
    const c = customLang.trim();
    if (c) return c;
    return pref || "English";
  }, [customLang, patientDetails?.language_preference]);

  const bcp47 = useMemo(() => LANGUAGE_BCP47[resolvedLang] ?? "en-IN", [resolvedLang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, step]);

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
      {
        role: "user",
        text: `[session]\n${patientContext}\nPreferred response language for Dr. Neo: ${resolvedLang}.`,
      },
      { role: "model", text: intro },
    ]);
    speak(intro);
    setStep("chat");
  }

  async function handleSend(text?: string) {
    const payload = (text ?? input).trim();
    if (!payload || loading || !user) return;
    setInput("");
    setError(null);
    const userTurn: ChatTurn = { role: "user", text: payload };
    setLoading(true);
    try {
      const reply = await generateNeoReply([...history, userTurn], patientContext);
      setHistory((h) => [...h, userTurn, { role: "model", text: reply }]);
      speak(stripOptionsAndCompleteMarkers(reply));
      const done = extractAssessmentJson(reply);
      if (done) {
        await saveAssessment({
          patientId: user.id,
          language: resolvedLang,
          summary: done.summary,
          rawJson: done.raw,
        });
        setStep("complete");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reach Dr. Neo");
    } finally {
      setLoading(false);
    }
  }

  function toggleMic() {
    type Rec = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start(): void;
      onresult: ((ev: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    };
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = bcp47;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript.trim();
      setInput((prev) => (prev ? `${prev}, ${transcript}` : transcript));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const lastModel = [...history].reverse().find((m) => m.role === "model");
  const options = lastModel ? parseOptions(lastModel.text) : null;

  if (authLoading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center text-teal-800">Loading profile…</div>
      </PageShell>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!profile.onboarding_completed || !patientDetails) {
    return <Navigate to="/onboarding/patient" replace />;
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/dashboard">
            <NeoLogo compact />
          </Link>
          <label className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            <input type="checkbox" checked={tts} onChange={(e) => setTts(e.target.checked)} />
            Read aloud
          </label>
        </div>

        {step === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 space-y-6"
          >
            <h1 className="text-2xl font-light text-teal-950">Dr. Neo assessment</h1>
            <p className="text-sm text-teal-900/70">
              Your profile ({profile.full_name}) is already attached — the chat will not repeat demographics. You may
              override the response language for this session only.
            </p>
            <label className="block text-sm font-medium text-teal-900">
              Session language override (optional)
              <input
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value)}
                placeholder={resolvedLang}
                className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-4 py-3"
              />
            </label>
            <button
              type="button"
              onClick={() => beginChat()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-2xl shadow"
            >
              Start conversation
            </button>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-4 flex flex-col gap-4 min-h-[520px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-700/70">Dr. Neo</p>
                <p className="text-sm text-teal-900/65">{resolvedLang}</p>
              </div>
              <Link to="/dashboard" className="text-xs font-semibold text-teal-700">
                Dashboard
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px]">
              {history
                .filter((m) => !(m.role === "user" && m.text.startsWith("[session]")))
                .map((m, idx) => (
                  <div key={`${idx}-${m.text.slice(0, 12)}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : "bg-white border border-teal-50 text-teal-900 rounded-bl-sm"
                      }`}
                    >
                      {m.role === "model" ? stripOptionsAndCompleteMarkers(m.text) : m.text}
                    </div>
                  </div>
                ))}
              {loading && <div className="text-xs text-teal-700/70 animate-pulse">Dr. Neo is thinking…</div>}
              <div ref={bottomRef} />
            </div>
            {options && (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() =>
                      setInput((prev) => {
                        const part = opt.trim();
                        if (!prev) return part;
                        if (prev.includes(part)) return prev;
                        return `${prev}, ${part}`;
                      })
                    }
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 border border-teal-100 text-teal-900"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe symptoms, timing, what makes it better or worse…"
                className="flex-1 rounded-2xl border border-teal-100 bg-white/90 px-3 py-2 text-sm resize-none"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleMic()}
                  className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${
                    listening ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-teal-100 text-teal-800"
                  }`}
                  aria-label="Microphone"
                >
                  🎙
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleSend()}
                  className="h-11 w-11 rounded-2xl bg-teal-600 text-white font-semibold disabled:opacity-50"
                >
                  ↑
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "complete" && (
          <div className="glass-panel p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-teal-950">Assessment saved</h2>
            <p className="text-sm text-teal-900/70">Your summary is stored. Matched doctors update on your dashboard.</p>
            <Link to="/dashboard" className="inline-block px-6 py-3 rounded-full bg-teal-600 text-white font-semibold shadow">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
