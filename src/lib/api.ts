import { getSupabase, isSupabaseConfigured } from "./supabase";
import { isAdminEmail } from "./env";

export type UserRole = "patient" | "doctor" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  onboarding_completed: boolean;
};

export type PatientDetails = {
  user_id: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
  language_preference: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string | null;
  occupation: string | null;
  lifestyle_notes: string | null;
  sleep_hours: number | null;
  diet_type: string | null;
  past_diseases: string | null;
  current_medicines: string | null;
  allergies: string | null;
  family_history: string | null;
  surgeries: string | null;
  stress_level: string | null;
  anxiety_notes: string | null;
  mood_pattern: string | null;
  energy_level: string | null;
  emotional_triggers: string | null;
};

export type DoctorRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  qualification: string | null;
  specialization: string;
  experience_years: number;
  clinic_name: string | null;
  clinic_address: string | null;
  consultation_fee: number;
  languages: string[];
  bio: string | null;
  photo_url: string | null;
  calendly_url: string | null;
  match_keywords: string | null;
  rating: number;
  review_count: number;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  degree_url: string | null;
  license_url: string | null;
  gov_id_url: string | null;
  profile_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type AssessmentRecord = {
  id: string;
  patient_id: string;
  language: string | null;
  summary: string;
  raw_json: string | null;
  created_at: string;
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function ensureAdminRole(userId: string, email: string | null): Promise<void> {
  if (!email || !isAdminEmail(email)) return;
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  await sb.from("profiles").update({ role: "admin", updated_at: new Date().toISOString() }).eq("id", userId);
}

export async function promoteDoctorIfApprovedEmail(userId: string, email: string | null): Promise<void> {
  if (!email || !isSupabaseConfigured()) return;
  if (isAdminEmail(email)) return;
  const sb = getSupabase();
  const { data } = await sb
    .from("doctors")
    .select("id")
    .eq("status", "approved")
    .ilike("email", email)
    .maybeSingle();
  if (data) {
    await sb.from("profiles").update({ role: "doctor", updated_at: new Date().toISOString() }).eq("id", userId);
    await sb.from("doctors").update({ profile_id: userId }).eq("id", data.id);
  }
}

export async function fetchPatientDetails(userId: string): Promise<PatientDetails | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const { data, error } = await sb.from("patient_details").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as PatientDetails | null;
}

export async function savePatientOnboarding(userId: string, fullName: string, details: Partial<PatientDetails>) {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const cleaned = Object.fromEntries(
    Object.entries(details).filter(([, v]) => v !== undefined)
  ) as Partial<PatientDetails>;
  const { error: pErr } = await sb
    .from("profiles")
    .update({ full_name: fullName, onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (pErr) throw pErr;
  const { error: dErr } = await sb.from("patient_details").upsert(
    { user_id: userId, ...cleaned, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (dErr) throw dErr;
}

export function buildPatientContextForAi(profile: Profile, d: PatientDetails | null): string {
  const lines: string[] = [];
  lines.push(`Full name: ${profile.full_name ?? "Unknown"}`);
  if (d) {
    if (d.language_preference) lines.push(`Preferred chat language: ${d.language_preference}`);
    if (d.gender) lines.push(`Gender: ${d.gender}`);
    if (d.date_of_birth) lines.push(`Date of birth: ${d.date_of_birth}`);
    if (d.city) lines.push(`City: ${d.city}`);
    if (d.height_cm) lines.push(`Height (cm): ${d.height_cm}`);
    if (d.weight_kg) lines.push(`Weight (kg): ${d.weight_kg}`);
    if (d.blood_group) lines.push(`Blood group: ${d.blood_group}`);
    if (d.occupation) lines.push(`Occupation: ${d.occupation}`);
    if (d.sleep_hours != null) lines.push(`Sleep hours: ${d.sleep_hours}`);
    if (d.diet_type) lines.push(`Diet: ${d.diet_type}`);
    if (d.lifestyle_notes) lines.push(`Lifestyle: ${d.lifestyle_notes}`);
    if (d.past_diseases) lines.push(`Past diseases: ${d.past_diseases}`);
    if (d.current_medicines) lines.push(`Current medicines: ${d.current_medicines}`);
    if (d.allergies) lines.push(`Allergies: ${d.allergies}`);
    if (d.family_history) lines.push(`Family history: ${d.family_history}`);
    if (d.surgeries) lines.push(`Surgeries: ${d.surgeries}`);
    if (d.stress_level) lines.push(`Stress level: ${d.stress_level}`);
    if (d.anxiety_notes) lines.push(`Anxiety: ${d.anxiety_notes}`);
    if (d.mood_pattern) lines.push(`Mood pattern: ${d.mood_pattern}`);
    if (d.energy_level) lines.push(`Energy: ${d.energy_level}`);
    if (d.emotional_triggers) lines.push(`Emotional triggers: ${d.emotional_triggers}`);
  }
  return lines.join("\n");
}

export async function listApprovedDoctors(): Promise<DoctorRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb.from("doctors").select("*").eq("status", "approved").order("full_name");
  if (error) throw error;
  return (data ?? []) as DoctorRow[];
}

export async function listPendingDoctorApplications(): Promise<DoctorRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb.from("doctors").select("*").eq("status", "pending").order("created_at", {
    ascending: false,
  });
  if (error) throw error;
  return (data ?? []) as DoctorRow[];
}

export async function setDoctorApplicationStatus(
  id: string,
  status: "approved" | "rejected",
  adminNote?: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb
    .from("doctors")
    .update({
      status,
      admin_note: adminNote ?? "",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function removeDoctor(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  // Reset profile_id link first (so the profile doesn't get cascade-deleted)
  await sb.from("doctors").update({ profile_id: null, status: "rejected" }).eq("id", id);
  const { error } = await sb.from("doctors").delete().eq("id", id);
  if (error) throw error;
}

export async function submitDoctorApplication(input: {
  fullName: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  clinicName: string;
  clinicAddress: string;
  consultationFee: number;
  languages: string[];
  email: string;
  phone: string;
  degreeUrl?: string;
  licenseUrl?: string;
  govIdUrl?: string;
  photoUrl?: string;
}): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { data, error } = await sb
    .from("doctors")
    .insert({
      full_name: input.fullName,
      qualification: input.qualification,
      specialization: input.specialization,
      experience_years: input.experienceYears,
      clinic_name: input.clinicName,
      clinic_address: input.clinicAddress,
      consultation_fee: input.consultationFee,
      languages: input.languages,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      status: "pending",
      degree_url: input.degreeUrl,
      license_url: input.licenseUrl,
      gov_id_url: input.govIdUrl,
      photo_url: input.photoUrl,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function uploadDoctorFile(path: string, file: File): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.storage.from("doctor-docs").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("doctor-docs").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveAssessment(input: {
  patientId: string;
  language: string;
  summary: string;
  rawJson?: string;
}): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { data, error } = await sb
    .from("assessments")
    .insert({
      patient_id: input.patientId,
      language: input.language,
      summary: input.summary,
      raw_json: input.rawJson ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function listAssessmentsForPatient(patientId: string): Promise<AssessmentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("assessments")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssessmentRecord[];
}

export async function getLatestAssessmentSummary(patientId: string): Promise<string | null> {
  const list = await listAssessmentsForPatient(patientId);
  return list[0]?.summary ?? null;
}

export async function getDashboardStats(): Promise<{
  pendingDoctors: number;
  approvedDoctors: number;
  assessmentsCount: number;
}> {
  if (!isSupabaseConfigured()) return { pendingDoctors: 0, approvedDoctors: 0, assessmentsCount: 0 };
  const sb = getSupabase();
  const [{ count: pending }, { count: approved }, { count: assess }] = await Promise.all([
    sb.from("doctors").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("doctors").select("*", { count: "exact", head: true }).eq("status", "approved"),
    sb.from("assessments").select("*", { count: "exact", head: true }),
  ]);
  return {
    pendingDoctors: pending ?? 0,
    approvedDoctors: approved ?? 0,
    assessmentsCount: assess ?? 0,
  };
}

export async function fetchDoctorById(id: string): Promise<DoctorRow | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const { data, error } = await sb.from("doctors").select("*").eq("id", id).eq("status", "approved").maybeSingle();
  if (error) throw error;
  return data as DoctorRow | null;
}

export async function fetchDoctorByEmail(email: string): Promise<DoctorRow | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  const e = email.trim().toLowerCase();
  const { data, error } = await sb.from("doctors").select("*").eq("email", e).eq("status", "approved").maybeSingle();
  if (error) throw error;
  return data as DoctorRow | null;
}

export async function updateDoctorCalendly(doctorId: string, calendlyUrl: string) {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.from("doctors").update({ calendly_url: calendlyUrl }).eq("id", doctorId);
  if (error) throw error;
}

export async function updateDoctorProfile(doctorId: string, updates: Partial<Pick<DoctorRow, "bio" | "clinic_name" | "clinic_address" | "consultation_fee" | "languages" | "calendly_url" | "match_keywords" | "photo_url">>) {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.from("doctors").update(updates).eq("id", doctorId);
  if (error) throw error;
}

/** Upload a doctor profile photo and update photo_url on their record */
export async function uploadDoctorPhoto(doctorId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `photos/${doctorId}.${ext}`;
  const { error: upErr } = await sb.storage.from("doctor-docs").upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = sb.storage.from("doctor-docs").getPublicUrl(path);
  const url = data.publicUrl;
  const { error: dbErr } = await sb.from("doctors").update({ photo_url: url }).eq("id", doctorId);
  if (dbErr) throw dbErr;
  return url;
}

/** Admin-only: update any editable field on a doctor record */
export async function adminUpdateDoctor(
  doctorId: string,
  updates: Partial<Pick<DoctorRow, "bio" | "clinic_name" | "clinic_address" | "consultation_fee" | "languages" | "calendly_url" | "match_keywords" | "photo_url" | "specialization" | "experience_years">>
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.from("doctors").update(updates).eq("id", doctorId);
  if (error) throw error;
}

export async function listAllProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function updateUserRole(userId: string, role: "patient" | "doctor" | "admin") {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

// ── Notification helpers ──────────────────────────────────────────────

export async function createNotification(input: {
  userId: string;
  title: string;
  body?: string;
  link?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  await sb.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
}

export async function notifyDoctorOfDecision(
  doctorId: string,
  status: "approved" | "rejected",
  adminNote?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  const { data } = await sb.from("doctors").select("profile_id, full_name").eq("id", doctorId).maybeSingle();
  if (!data?.profile_id) return;
  await createNotification({
    userId: data.profile_id,
    title: status === "approved"
      ? "🎉 Your application was approved!"
      : "Your application was reviewed",
    body: status === "approved"
      ? "Welcome to NeoHomeo! Your profile is now live. Log in to complete your dashboard."
      : `Your application was not approved at this time.${adminNote ? ` Note: ${adminNote}` : ""}`,
    link: status === "approved" ? "/doctor" : undefined,
  });
}

// ── Appointments ──────────────────────────────────────────────────────

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type AppointmentRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string | null;
  status: AppointmentStatus;
  notes: string | null;
  calendly_event_uri: string | null;
  created_at: string;
  updated_at: string;
  // joined
  doctor?: Pick<DoctorRow, "full_name" | "specialization" | "photo_url" | "consultation_fee">;
  patient?: Pick<Profile, "full_name" | "email">;
};

export async function bookAppointment(input: {
  patientId: string;
  doctorId: string;
  scheduledAt?: string;
  notes?: string;
  calendlyEventUri?: string;
}): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { data, error } = await sb
    .from("appointments")
    .insert({
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      scheduled_at: input.scheduledAt ?? null,
      notes: input.notes ?? null,
      calendly_event_uri: input.calendlyEventUri ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function listPatientAppointments(patientId: string): Promise<AppointmentRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("appointments")
    .select("*, doctor:doctors(full_name, specialization, photo_url, consultation_fee)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppointmentRow[];
}

export async function listDoctorAppointments(doctorId: string): Promise<AppointmentRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("appointments")
    .select("*, patient:profiles(full_name, email)")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppointmentRow[];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  notes?: string
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb
    .from("appointments")
    .update({ status, ...(notes !== undefined ? { notes } : {}) })
    .eq("id", id);
  if (error) throw error;
}

export async function listAllAppointments(): Promise<AppointmentRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("appointments")
    .select("*, doctor:doctors(full_name, specialization), patient:profiles(full_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppointmentRow[];
}

// ── Notifications ─────────────────────────────────────────────────────

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  link: string | null;
  created_at: string;
};

export async function listNotifications(userId: string): Promise<NotificationRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function markNotificationsRead(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabase();
  await sb.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

// ── Reviews ───────────────────────────────────────────────────────────

export type ReviewRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function submitReview(input: {
  patientId: string;
  doctorId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase required");
  const sb = getSupabase();
  const { error } = await sb.from("reviews").upsert(
    {
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    { onConflict: "patient_id,doctor_id" }
  );
  if (error) throw error;
}

export async function listDoctorReviews(doctorId: string): Promise<ReviewRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

// ── Admin: assessments with patient info ──────────────────────────────

export type AssessmentWithPatient = AssessmentRecord & {
  patient: Pick<Profile, "full_name" | "email"> | null;
};

export async function listAllAssessmentsAdmin(): Promise<AssessmentWithPatient[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("assessments")
    .select("*, patient:profiles(full_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssessmentWithPatient[];
}
