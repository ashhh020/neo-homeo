import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import {
  listNotifications,
  markNotificationsRead,
  deleteAllNotifications,
  type NotificationRow,
} from "../lib/api";

export function NotificationBell({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Prevent markRead firing multiple times per open session
  const markedRef = useRef(false);

  const unread = notes.filter((n) => !n.read).length;

  // Initial fetch
  useEffect(() => {
    void listNotifications(userId).then(setNotes);
  }, [userId]);

  // Supabase Realtime — live push for new notifications
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase();
    const channel = sb
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotes((prev) => [payload.new as NotificationRow, ...prev]);
        }
      )
      .subscribe();

    return () => { void sb.removeChannel(channel); };
  }, [userId]);

  // Reset markRead guard each time panel opens
  useEffect(() => {
    if (open) markedRef.current = false;
  }, [open]);

  // Mark all read — fires at most once per open
  useEffect(() => {
    if (open && unread > 0 && !markedRef.current) {
      markedRef.current = true;
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

  function handleNotificationClick(n: NotificationRow) {
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  async function handleClearAll() {
    setNotes([]);
    setOpen(false);
    // Persist to DB — best-effort, local state already cleared
    await deleteAllNotifications(userId).catch(() => {});
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full bg-white/70 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-white transition"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
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
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-semibold">
                    {unread} new
                  </span>
                )}
                {notes.length > 0 && (
                  <span className="text-xs text-teal-800/50">{notes.length} total</span>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-teal-50">
              {notes.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-teal-900/50">No notifications yet</p>
                  <p className="text-xs text-teal-900/35 mt-1">
                    You'll be notified about appointments and updates here.
                  </p>
                </div>
              ) : (
                notes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 space-y-0.5 transition hover:bg-teal-50/70
                      ${!n.read ? "bg-teal-50/50 border-l-2 border-teal-400" : ""}`}
                  >
                    <p className="text-sm font-semibold text-teal-950 leading-snug">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-teal-900/70 leading-relaxed">{n.body}</p>
                    )}
                    <p className="text-[10px] text-teal-800/40 mt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                    {n.link && (
                      <p className="text-[10px] font-semibold text-teal-600 mt-0.5">
                        Tap to open →
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>

            {notes.length > 0 && (
              <div className="px-4 py-2 border-t border-teal-50 text-center">
                <button
                  onClick={() => void handleClearAll()}
                  className="text-xs text-teal-800/40 hover:text-rose-500 transition"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
