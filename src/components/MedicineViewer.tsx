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
    <div className="space-y-5 animate-pulse p-4 md:p-6 max-w-3xl mx-auto">
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

function ErrorState({ medicine, error, onRetry }: { medicine: Medicine; error: string; onRetry: () => void }) {
  const isNotConfigured = error === "not-configured";
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="glass-panel p-6 text-center space-y-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-400">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-teal-950">
            {isNotConfigured ? "Proxy not configured" : "Could not load medicine content"}
          </p>
          <p className="text-sm text-teal-700/70">
            {isNotConfigured
              ? "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in environment variables."
              : error}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          {!isNotConfigured && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Retry
            </button>
          )}
          <a
            href={`https://www.homeoint.org/books/boericmm/${medicine.path}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white border border-teal-200 hover:border-teal-400 text-teal-700 text-sm font-semibold transition"
          >
            View on Homeoint.org
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export function MedicineViewer({ medicine, cache, onAskAbout }: Props) {
  const [data, setData] = useState<MedicineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const cached = cache.current.get(medicine.path);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setData(null);

    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes("YOUR_SUPABASE")) {
      setLoading(false);
      setError("not-configured");
      return;
    }

    const url = `${supabaseUrl}/functions/v1/medicine-proxy?path=${encodeURIComponent(medicine.path)}`;

    fetch(url, {
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const json = await r.json() as MedicineData & { error?: string };
        if (!r.ok || json.error) {
          throw new Error(json.error ?? `HTTP ${r.status}`);
        }
        return json;
      })
      .then((d) => {
        cache.current.set(medicine.path, d);
        setData(d);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        console.error("[MedicineViewer] fetch error:", e.message);
        setError(e.message);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [medicine.path, cache, retryKey]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <ErrorState
        medicine={medicine}
        error={error}
        onRetry={() => {
          cache.current.delete(medicine.path);
          setRetryKey((k) => k + 1);
        }}
      />
    );
  }

  if (!data) return null;

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

      {/* Source */}
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
