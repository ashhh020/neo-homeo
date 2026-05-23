import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  ensureAdminRole,
  fetchMyProfile,
  fetchPatientDetails,
  promoteDoctorIfApprovedEmail,
  type PatientDetails,
  type Profile,
} from "../lib/api";
import { isAdminEmail } from "../lib/env";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  patientDetails: PatientDetails | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      setPatientDetails(null);
      setLoading(false);
      return;
    }
    try {
      const sb = getSupabase();
      const { data: ures } = await sb.auth.getUser();
      const u = ures.user;
      setUser(u);
      if (!u) {
        setProfile(null);
        setPatientDetails(null);
        setLoading(false);
        return;
      }

      try {
        await ensureAdminRole(u.id, u.email ?? null);
        if (!isAdminEmail(u.email ?? "")) {
          await promoteDoctorIfApprovedEmail(u.id, u.email ?? null);
        }
      } catch (roleErr) {
        if (import.meta.env.DEV) console.warn("Role check failed:", roleErr);
      }

      let p = await fetchMyProfile(u.id);
      if (!p) {
        const { error: upsertErr } = await sb.from("profiles").upsert(
          {
            id: u.id,
            email: u.email,
            full_name:
              (u.user_metadata?.full_name as string) ??
              u.email?.split("@")[0] ??
              "Patient",
            role: "patient",
            onboarding_completed: false,
          },
          { onConflict: "id" }
        );
        if (upsertErr && import.meta.env.DEV) console.warn("Failed to create profile:", upsertErr);
        p = await fetchMyProfile(u.id).catch(() => null);
      }
      setProfile(p);

      if (p?.role === "patient") {
        const d = await fetchPatientDetails(u.id).catch(() => null);
        setPatientDetails(d);
      } else {
        setPatientDetails(null);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Auth initialization failed:", err);
      setProfile(null);
      setPatientDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      void refreshProfile();
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      void refreshProfile();
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) throw new Error("Configure Supabase in .env first.");
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshProfile();
  }, [refreshProfile]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string): Promise<{ needsConfirmation: boolean }> => {
    if (!isSupabaseConfigured()) throw new Error("Configure Supabase in .env first.");
    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    // If session is returned immediately, email confirmation is disabled — sign in right away
    if (data.session) {
      await refreshProfile();
      return { needsConfirmation: false };
    }
    // Otherwise, try signing in (works if autoconfirm is on but signUp didn't return session)
    const { error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    if (!signInErr) {
      await refreshProfile();
      return { needsConfirmation: false };
    }
    return { needsConfirmation: true };
  }, [refreshProfile]);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) throw new Error("Configure Supabase in .env first.");
    const sb = getSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabase();
    await sb.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setPatientDetails(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      patientDetails,
      loading,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, patientDetails, loading, signInWithEmail, signUpWithEmail, sendPasswordReset, signOut, refreshProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
