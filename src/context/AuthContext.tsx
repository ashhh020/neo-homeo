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
import { getSiteUrl, isAdminEmail } from "../lib/env";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  patientDetails: PatientDetails | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
    await ensureAdminRole(u.id, u.email ?? null);
    if (!isAdminEmail(u.email ?? "")) {
      await promoteDoctorIfApprovedEmail(u.id, u.email ?? null);
    }
    let p = await fetchMyProfile(u.id);
    if (!p) {
      await sb.from("profiles").upsert(
        {
          id: u.id,
          email: u.email,
          full_name: (u.user_metadata?.full_name as string) ?? u.email?.split("@")[0] ?? "Patient",
          role: "patient",
          onboarding_completed: false,
        },
        { onConflict: "id" }
      );
      p = await fetchMyProfile(u.id);
    }
    setProfile(p);
    if (p?.role === "patient") {
      const d = await fetchPatientDetails(u.id);
      setPatientDetails(d);
    } else {
      setPatientDetails(null);
    }
    setLoading(false);
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
      if (event === "TOKEN_REFRESHED") return;
      void refreshProfile();
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) throw new Error("Configure Supabase in .env first.");
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getSiteUrl()}/auth/callback` },
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
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, patientDetails, loading, signInWithGoogle, signOut, refreshProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
