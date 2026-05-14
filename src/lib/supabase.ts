import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True when .env has real Supabase values (not template placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !key) return false;

  const urlIsPlaceholder =
    url === "YOUR_SUPABASE_PROJECT_URL" ||
    url.includes("YOUR_SUPABASE_PROJECT") ||
    !url.startsWith("http");

  const keyIsPlaceholder =
    key === "YOUR_SUPABASE_ANON_PUBLIC_KEY" ||
    key.includes("YOUR_SUPABASE_ANON_PUBLIC") ||
    key.length < 80;

  return !urlIsPlaceholder && !keyIsPlaceholder;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
  }
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}
