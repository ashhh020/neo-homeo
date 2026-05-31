import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Medicine } from "../types/student";

interface Props {
  medicines: Medicine[];
  activeMedicine: Medicine | null;
  onSelect: (medicine: Medicine) => void;
  isOpen: boolean;    // mobile drawer open state
  onClose: () => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.18 }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 text-teal-500"
    >
      <path d="M9 18l6-6-6-6" />
    </motion.svg>
  );
}

function SidebarInner({
  medicines,
  activeMedicine,
  onSelect,
  onClose,
  isMobileDrawer,
}: {
  medicines: Medicine[];
  activeMedicine: Medicine | null;
  onSelect: (m: Medicine) => void;
  onClose: () => void;
  isMobileDrawer: boolean;
}) {
  const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? medicines.filter((m) => m.name.toLowerCase().includes(q))
      : medicines;

    const map = new Map<string, Medicine[]>();
    for (const m of filtered) {
      const arr = map.get(m.letter) ?? [];
      arr.push(m);
      map.set(m.letter, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [medicines, search]);

  // When searching, treat all matching letters as expanded
  const isExpanded = (letter: string) =>
    search.trim() ? true : expandedLetters.has(letter);

  function toggleLetter(letter: string) {
    setExpandedLetters((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  }

  function handleSelect(m: Medicine) {
    onSelect(m);
    if (isMobileDrawer) onClose();
  }

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100">
        <div className="flex items-center gap-2">
          {/* Folder icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-teal-600">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-800">
            Materia Medica
          </span>
        </div>
        {isMobileDrawer && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-teal-50 text-teal-600 transition"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-teal-50">
        <div className="flex items-center gap-2 bg-teal-50/60 border border-teal-100 rounded-xl px-3 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-teal-500 flex-shrink-0">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines..."
            className="flex-1 text-xs bg-transparent outline-none text-teal-900 placeholder-teal-400 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-teal-400 hover:text-teal-600 transition">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {grouped.length === 0 ? (
          <p className="text-xs text-teal-500 px-4 py-6 text-center">No medicines found</p>
        ) : (
          grouped.map(([letter, meds]) => (
            <div key={letter}>
              {/* Letter folder */}
              <button
                onClick={() => toggleLetter(letter)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-teal-50 transition rounded-lg mx-1 text-left group"
              >
                <ChevronIcon open={isExpanded(letter)} />
                {/* Folder SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-amber-500 flex-shrink-0">
                  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    fill="currentColor" opacity="0.8"/>
                </svg>
                <span className="text-xs font-bold text-teal-800 flex-1">{letter}</span>
                <span className="text-[10px] text-teal-400 font-medium group-hover:text-teal-600 transition">
                  {meds.length}
                </span>
              </button>

              {/* Medicine leaves */}
              <AnimatePresence initial={false}>
                {isExpanded(letter) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    {meds.map((m) => {
                      const isActive = activeMedicine?.path === m.path;
                      return (
                        <button
                          key={m.path}
                          onClick={() => handleSelect(m)}
                          className={`w-full flex items-center gap-2 pl-7 pr-3 py-1 mx-1 rounded-lg text-left transition ${
                            isActive
                              ? "bg-teal-50 border-l-2 border-teal-500 text-teal-900 font-medium"
                              : "text-teal-700 hover:bg-teal-50/60 hover:text-teal-900"
                          }`}
                        >
                          {/* File icon */}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className={`flex-shrink-0 ${isActive ? "text-teal-500" : "text-teal-300"}`}>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                              fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span className="text-[11px] leading-tight truncate">{m.name}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      <div className="px-4 py-2 border-t border-teal-50">
        <p className="text-[10px] text-teal-400">
          {medicines.length} remedies · Boericke MM
        </p>
      </div>
    </div>
  );
}

export function MedicineTree({ medicines, activeMedicine, onSelect, isOpen, onClose }: Props) {
  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex flex-col h-full w-64 flex-shrink-0">
        <SidebarInner
          medicines={medicines}
          activeMedicine={activeMedicine}
          onSelect={onSelect}
          onClose={onClose}
          isMobileDrawer={false}
        />
      </div>

      {/* Mobile: slide-in drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden shadow-2xl"
            >
              <SidebarInner
                medicines={medicines}
                activeMedicine={activeMedicine}
                onSelect={onSelect}
                onClose={onClose}
                isMobileDrawer={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
