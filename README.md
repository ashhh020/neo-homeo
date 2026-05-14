# NeoHomeo (Supabase + Google OAuth)

## What you need in `.env`

| Key | Where to get it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Dashboard → **Settings → API → Project URL** |
| `VITE_SUPABASE_ANON_KEY` | Same page → **anon public** key |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `VITE_ADMIN_EMAILS` | Comma-separated Google emails allowed into `/admin` |
| `VITE_SITE_URL` _(optional)_ | Public origin if OAuth redirect must be fixed for previews |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Authentication → Providers → Google**: enable and add Web client ID/secret from Google Cloud Console (OAuth consent + OAuth 2.0 Client IDs).
3. Add redirect URL: `http://localhost:5173/auth/callback` (and production URL + `/auth/callback`).
4. Run SQL from `supabase/migrations/001_neohomeo_schema.sql` in the SQL editor (then `002_storage_doctor_docs.sql` if you use document uploads).
5. **Storage**: ensure bucket `doctor-docs` exists (migration 002 inserts policies).
6. **Dummy doctors** (landing + matching): run `supabase/seed_dummy_doctors.sql` in the SQL editor. Replace Calendly URLs with your own test links.
7. **Admin user**: sign in once with Google using an email in `VITE_ADMIN_EMAILS`, or manually set `profiles.role = 'admin'` for your user id.

## Run locally

```bash
npm install
npm run dev
```

## Flows

- **Patient**: Google → `/auth/callback` → **full profile onboarding** → `/dashboard` → **Dr. Neo** (profile auto-injected; no repeat demographics) → assessments saved to Supabase → **matched doctors** + **Calendly** embed on dashboard.
- **Doctor apply** (public): `/apply` inserts `doctors` row `status = pending` + optional Storage uploads.
- **Admin**: `/admin/login` → Google → `/admin` (approve/reject, copy `/apply` link).
- **Doctor console**: Google with same email as an **approved** `doctors` row → `/doctor` (Calendly editor + preview).

## Notes

- Matching scores are heuristic (keyword overlap between latest assessment text and `specialization` / `match_keywords` / `bio`).
- Tighten RLS policies before production; current SQL is oriented toward development velocity.
# neohomeo
