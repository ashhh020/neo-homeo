import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ensureAdminRole,
  fetchMyProfile,
  promoteDoctorIfApprovedEmail,
} from "../lib/api";
import { isAdminEmail } from "../lib/env";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured()) {
        nav("/login?error=supabase", { replace: true });
        return;
      }
      const sb = getSupabase();
      const { data: sess } = await sb.auth.getSession();
      if (!sess.session?.user) {
        nav("/login", { replace: true });
        return;
      }
      const u = sess.session.user;
      await ensureAdminRole(u.id, u.email ?? null);
      if (!isAdminEmail(u.email ?? "")) {
        await promoteDoctorIfApprovedEmail(u.id, u.email ?? null);
      }
      const p = await fetchMyProfile(u.id);
      if (p?.role === "admin") nav("/admin", { replace: true });
      else if (p?.role === "doctor") nav("/doctor", { replace: true });
      else if (!p?.onboarding_completed) nav("/onboarding/patient", { replace: true });
      else nav("/dashboard", { replace: true });
    })();
  }, [nav]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F4F7] text-teal-900 gap-2">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
}
