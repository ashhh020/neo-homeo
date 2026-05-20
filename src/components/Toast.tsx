import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; msg: string; kind: ToastKind };

type ToastCtx = { toast: (msg: string, kind?: ToastKind) => void };
const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() { return useContext(Ctx); }

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((msg: string, kind: ToastKind = "success") => {
    const id = ++_id;
    setItems((p) => [...p, { id, msg, kind }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 max-w-sm
                ${t.kind === "success" ? "bg-teal-900 text-white" : t.kind === "error" ? "bg-rose-600 text-white" : "bg-white border border-teal-100 text-teal-900"}`}
            >
              {t.kind === "success" ? "✓" : t.kind === "error" ? "✕" : "ℹ"} {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
