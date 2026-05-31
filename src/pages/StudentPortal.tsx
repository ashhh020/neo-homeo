import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { NeoLogo } from "../components/Shell";
import { MedicineTree } from "../components/MedicineTree";
import { MedicineViewer } from "../components/MedicineViewer";
import { MEDICINES } from "../data/medicines";
import { generateStudentReply } from "../lib/studentGemini";
import type { ChatTurn } from "../lib/gemini";
import type { Medicine, MedicineData, StudentTab } from "../types/student";

/* ─────────────────── Chat suggestion chips ─────────────────── */
const SUGGESTIONS = [
  "What are the keynotes of Sulphur?",
  "Explain homeopathic potency selection",
  "Compare Nux Vomica vs Lycopodium",
  "What are miasms in classical homeopathy?",
  "Describe Pulsatilla — mentals and generals",
];

/* ─────────────────── Typing indicator ─────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 rounded-full bg-teal-400"
        />
      ))}
    </div>
  );
}

/* ─────────────────── Tab button ─────────────────── */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap flex-shrink-0 ${
        active
          ? "text-teal-700 border-b-2 border-teal-500"
          : "text-teal-500 hover:text-teal-700 border-b-2 border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────── Chat message bubble ─────────────────── */
function ChatBubble({ turn, isLatest }: { turn: ChatTurn; isLatest: boolean }) {
  const isUser = turn.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 3v18M5 8h14M5 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-br-sm shadow-md"
            : "bg-white/80 border border-white/90 shadow text-teal-900 rounded-bl-sm"
        } ${isLatest ? "shadow-md" : ""}`}
      >
        <p className="whitespace-pre-wrap">{turn.text}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Main page ─────────────────── */
export default function StudentPortal() {
  // Medicine browsing
  const [activeMedicine, setActiveMedicine] = useState<Medicine | null>(null);
  const [tab, setTab] = useState<StudentTab>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const medicineCache = useRef(new Map<string, MedicineData>());

  // Chat
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, aiLoading]);

  /* ── Medicine selected ── */
  function handleSelectMedicine(m: Medicine) {
    setActiveMedicine(m);
    setTab("medicine");
    setSidebarOpen(false);
  }

  /* ── Close medicine tab ── */
  function closeMedicineTab() {
    setActiveMedicine(null);
    setTab("chat");
  }

  /* ── Ask about medicine (from viewer) ── */
  function handleAskAbout(medicineName: string) {
    const text = `Tell me about ${medicineName} — its keynote symptoms, generals, modalities, and clinical uses in homeopathy.`;
    setInput(text);
    setTab("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  /* ── Send chat message ── */
  async function handleSend(overrideText?: string) {
    const payload = (overrideText ?? input).trim();
    if (!payload || aiLoading) return;
    setInput("");
    setChatError(null);
    const userTurn: ChatTurn = { role: "user", text: payload };
    const newHistory: ChatTurn[] = [...history, userTurn];
    setHistory(newHistory);
    setAiLoading(true);
    try {
      const reply = await generateStudentReply(newHistory);
      setHistory((prev) => [...prev, { role: "model", text: reply }]);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to get response");
    } finally {
      setAiLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  /* ────── Render ────── */
  return (
    <div className="h-screen flex flex-col bg-[#F2F4F7] overflow-hidden">

      {/* ── Fixed Navbar ── */}
      <header className="flex-shrink-0 z-30 bg-white/80 backdrop-blur-sm border-b border-teal-100 h-14 flex items-center px-4 gap-3 shadow-sm">
        <Link to="/" className="flex items-center">
          <NeoLogo compact />
        </Link>
        <span className="text-teal-300 font-light">/</span>
        <span className="text-sm font-semibold text-teal-800 hidden sm:inline">Student Portal</span>
        <span className="text-sm font-semibold text-teal-800 sm:hidden">Students</span>

        {/* Mobile: open sidebar button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="ml-auto flex items-center gap-1.5 md:hidden bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-teal-100 transition"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinecap="round"/>
          </svg>
          Medicines
        </button>

        <div className="hidden md:flex ml-auto items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-teal-800 px-4 py-2 rounded-full hover:bg-white/70 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2 rounded-full shadow-lg hover:shadow-teal-500/30 transition"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar (desktop always visible, mobile is drawer) ── */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r border-teal-100 h-full overflow-hidden">
          <MedicineTree
            medicines={MEDICINES}
            activeMedicine={activeMedicine}
            onSelect={handleSelectMedicine}
            isOpen={false}
            onClose={() => {}}
          />
        </div>

        {/* Mobile drawer */}
        <MedicineTree
          medicines={MEDICINES}
          activeMedicine={activeMedicine}
          onSelect={handleSelectMedicine}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-teal-100 bg-white/50 backdrop-blur-sm overflow-x-auto scrollbar-hide">
            <TabBtn active={tab === "chat"} onClick={() => setTab("chat")}>
              <span className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Research Chat
              </span>
            </TabBtn>
            {activeMedicine && (
              <TabBtn active={tab === "medicine"} onClick={() => setTab("medicine")}>
                <span className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeLinecap="round"/>
                    <path d="M14 2v6h6" strokeLinecap="round"/>
                  </svg>
                  {activeMedicine.name.length > 24
                    ? activeMedicine.name.slice(0, 22) + "…"
                    : activeMedicine.name}
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); closeMedicineTab(); }}
                  className="ml-2 text-teal-400 hover:text-teal-700 cursor-pointer"
                  role="button"
                  aria-label="Close medicine tab"
                >
                  ×
                </span>
              </TabBtn>
            )}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {/* ── CHAT TAB ── */}
            {tab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4">
                  {/* Welcome / empty state */}
                  {history.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full py-10 space-y-5"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M12 3v18M5 8h14M5 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="text-center space-y-1">
                        <h2 className="text-lg font-semibold text-teal-950">Homeopathy Research Assistant</h2>
                        <p className="text-sm text-teal-700/70 max-w-sm">
                          Ask me anything about remedies, materia medica, potency theory, or classical homeopathy.
                        </p>
                      </div>
                      {/* Suggestion chips */}
                      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => void handleSend(s)}
                            className="text-xs font-medium text-teal-700 bg-white/80 border border-teal-100 hover:border-teal-300 hover:bg-white px-3 py-1.5 rounded-full shadow-sm transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Message bubbles */}
                  {history.map((turn, i) => (
                    <ChatBubble key={i} turn={turn} isLatest={i === history.length - 1} />
                  ))}

                  {/* Typing indicator */}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M12 3v18M5 8h14M5 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="bg-white/80 border border-white/90 shadow rounded-2xl rounded-bl-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {chatError && (
                    <p className="text-xs text-red-500 text-center">{chatError}</p>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div className="flex-shrink-0 border-t border-teal-100 bg-white/60 backdrop-blur-sm px-3 md:px-6 py-3">
                  <div className="flex items-center gap-2 bg-white border border-teal-100 rounded-2xl px-4 py-2 shadow-sm focus-within:border-teal-300 transition max-w-3xl mx-auto">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about a remedy, symptom, or homeopathy concept…"
                      disabled={aiLoading}
                      className="flex-1 text-sm bg-transparent outline-none text-teal-900 placeholder-teal-400 disabled:opacity-50 min-w-0"
                    />
                    <button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || aiLoading}
                      className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow hover:opacity-90 disabled:opacity-40 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-teal-400 text-center mt-1.5">
                    For educational use only · Not medical advice
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── MEDICINE TAB ── */}
            {tab === "medicine" && activeMedicine && (
              <motion.div
                key={`medicine-${activeMedicine.path}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto"
              >
                <MedicineViewer
                  medicine={activeMedicine}
                  cache={medicineCache}
                  onAskAbout={handleAskAbout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
