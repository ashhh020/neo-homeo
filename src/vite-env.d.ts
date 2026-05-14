/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxxx.supabase.co */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anon (public) key from Project Settings → API */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Google AI Studio key for Dr. Neo (Gemini) */
  readonly VITE_GEMINI_API_KEY: string;
  /** Comma-separated emails that should receive admin console access after Google sign-in */
  readonly VITE_ADMIN_EMAILS: string;
  /** Optional: used in OAuth redirect hints (defaults to window.location.origin) */
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
