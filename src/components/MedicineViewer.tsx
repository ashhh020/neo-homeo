import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Medicine, MedicineData, MedicineSection } from "../types/student";

interface Props {
  medicine: Medicine;
  cache: React.MutableRefObject<Map<string, MedicineData>>;
  onAskAbout: (medicineName: string) => void;
}

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse p-4 md:p-6">
      <div className="h-8 w-2/3 bg-teal-100/80 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-teal-100/60 rounded-xl" />
        <div className="h-4 w-5/6 bg-teal-100/60 rounded-xl" />
        <div className="h-4 w-4/5 bg-teal-100/60 rounded-xl" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-panel p-5 space-y-3">
          <div className="h-4 w-1/4 bg-teal-100/80 rounded-lg" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-teal-100/40 rounded" />
            <div className="h-3 w-4/5 bg-teal-100/40 rounded" />
            <div className="h-3 w-5/6 bg-teal-100/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ section, index }: { section: MedicineSection; index: number }) {
  const isDose = section.heading.toLowerCase().includes("dose");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className={isDose
        ? "bg-teal-50 border border-teal-200 rounded-2xl p-4 md:p-5"
        : "glass-panel p-4 md:p-5"
      }
    >
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDose ? "text-teal-600" : "text-teal-500"}`}>
        {section.heading}
      </h3>
      <p className="text-sm text-teal-900/80 leading-relaxed whitespace-pre-line">
        {section.content}
      </p>
    </motion.div>
  );
}

export function MedicineViewer({ medicine, cache, onAskAbout }: Props) {
  const [data, setData] = useState<MedicineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = cache.current.get(medicine.path);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setData(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes("YOUR_SUPABASE")) {
      // Fallback: no proxy available
      setLoading(false);
      setError("fallback");
      return;
    }

    const url = `${supabaseUrl}/functions/v1/medicine-proxy?path=${encodeURIComponent(medicine.path)}`;
    fetch(url, {
      headers: { apikey: anonKey },
      signal: ctrl.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MedicineData>;
      })
      .then((d) => {
        cache.current.set(medicine.path, d);
        setData(d);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setError(e.message);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [medicine.path, cache]);

  if (loading) return <Skeleton />;

  if (error === "fallback") {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="glass-panel p-6 text-center space-y-3">
          <p className="font-semibold text-teal-900">Supabase not configured</p>
          <p className="text-sm text-teal-700/70">
            The medicine proxy requires Supabase to be set up. You can read the full content directly on the source.
          </p>
          <a
            href={`https://www.homeoint.org/books/boericmm/${medicine.path}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-5 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
          >
            Open on Homeoint.org
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="glass-panel p-6 text-center space-y-3">
          <p className="font-semibold text-teal-900">Failed to load content</p>
          <p className="text-sm text-teal-700/70">{error}</p>
          <a
            href={`https://www.homeoint.org/books/boericmm/${medicine.path}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-5 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
          >
            Open on Homeoint.org
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Separate dose section from main sections
  const mainSections = data.sections.filter(
    (s) => !s.heading.toLowerCase().includes("dose")
  );
  const doseSection = data.sections.find((s) =>
    s.heading.toLowerCase().includes("dose")
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-widest">
              Boericke MM
            </span>
            <span className="text-xs text-teal-500 font-mono">{medicine.abbr}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-teal-950 leading-tight">
            {data.title || medicine.name}
          </h1>
        </div>
        <button
          onClick={() => onAskAbout(medicine.name)}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow transition whitespace-nowrap"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ask about this
        </button>
      </motion.div>

      {/* Intro */}
      {data.intro && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-sm md:text-base text-teal-800/80 leading-relaxed border-l-2 border-teal-300 pl-4 italic"
        >
          {data.intro}
        </motion.p>
      )}

      {/* Symptom sections */}
      <div className="space-y-3">
        {mainSections.map((s, i) => (
          <SectionCard key={s.heading || i} section={s} index={i} />
        ))}
      </div>

      {/* Dose */}
      {(doseSection || data.dose) && (
        <SectionCard
          section={{ heading: "Dose", content: doseSection?.content ?? data.dose }}
          index={mainSections.length}
        />
      )}

      {/* Source link */}
      <div className="flex justify-end">
        <a
          href={`https://www.homeoint.org/books/boericmm/${medicine.path}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-teal-500 hover:text-teal-700 transition underline"
        >
          Source: Homeoint.org
        </a>
      </div>
    </div>
  );
}
