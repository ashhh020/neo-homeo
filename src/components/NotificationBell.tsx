import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listNotifications, markNotificationsRead, type NotificationRow } from "../lib/api";

export function NotificationBell({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notes.filter((n) => !n.read).length;

  useEffect(() => {
    void listNotifications(userId).then(setNotes);
  }, [userId]);

  // Mark all read when panel opens
  useEffect(() => {
    if (open && unread > 0) {
      void markNotificationsRead(userId).then(() =>
        setNotes((prev) => prev.map((n) => ({ ...n, read: true })))
      );
    }
  }, [open, unread, userId]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full bg-white/70 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-white transition"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-teal-100 shadow-xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-teal-50 flex items-center justify-between">
              <p className="font-semibold text-teal-950 text-sm">Notifications</p>
              {notes.length > 0 && (
                <span className="text-xs text-teal-800/50">{notes.length} total</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-teal-50">
              {notes.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-2xl mb-1">🔔</p>
                  <p className="text-sm text-teal-900/50">No notifications yet</p>
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 space-y-0.5 ${!n.read ? "bg-teal-50/60" : ""}`}
                  >
                    <p className="text-sm font-semibold text-teal-950">{n.title}</p>
                    {n.body && <p className="text-xs text-teal-900/70 leading-relaxed">{n.body}</p>}
                    <p className="text-[10px] text-teal-800/40">{new Date(n.created_at).toLocaleString()}</p>
                    {n.link && (
                      <a href={n.link} className="text-xs font-semibold text-teal-600 underline">
                        Open →
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
