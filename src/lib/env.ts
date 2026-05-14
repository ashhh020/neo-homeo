export function getAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function getGeminiApiKey(): string | undefined {
  const k = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  if (k && !k.includes("YOUR_")) return k;
  return undefined;
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return import.meta.env.VITE_SITE_URL ?? "";
}
