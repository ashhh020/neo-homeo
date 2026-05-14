import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { NeoLogo, PageShell } from "../components/Shell";
import { submitDoctorApplication, uploadDoctorFile } from "../lib/api";
import { isSupabaseConfigured } from "../lib/supabase";

const LANG_OPTIONS = ["English", "Hindi", "Telugu", "Urdu", "Malayalam", "Marathi", "Tamil"];

export default function DoctorApply() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    qualification: "",
    specialization: "",
    experienceYears: 3,
    clinicName: "",
    clinicAddress: "",
    consultationFee: 1200,
    languages: [] as string[],
    email: "",
    phone: "",
  });
  const [files, setFiles] = useState({
    degree: null as File | null,
    license: null as File | null,
    govId: null as File | null,
    photo: null as File | null,
  });

  const applyUrl = useMemo(() => `${window.location.origin}/apply`, []);

  function toggleLanguage(l: string) {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(l) ? f.languages.filter((x) => x !== l) : [...f.languages, l],
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.languages.length === 0) {
      setMessage("Select at least one consultation language.");
      return;
    }
    setStatus("submitting");
    setMessage(null);
    try {
      if (!isSupabaseConfigured()) throw new Error("Supabase is not configured on this deployment.");
      const folder = crypto.randomUUID();
      const [degreeUrl, licenseUrl, govIdUrl, photoUrl] = await Promise.all([
        files.degree ? uploadDoctorFile(`${folder}/degree`, files.degree) : Promise.resolve(undefined),
        files.license ? uploadDoctorFile(`${folder}/license`, files.license) : Promise.resolve(undefined),
        files.govId ? uploadDoctorFile(`${folder}/govId`, files.govId) : Promise.resolve(undefined),
        files.photo ? uploadDoctorFile(`${folder}/photo`, files.photo) : Promise.resolve(undefined),
      ]);
      await submitDoctorApplication({
        fullName: form.fullName,
        qualification: form.qualification,
        specialization: form.specialization,
        experienceYears: form.experienceYears,
        clinicName: form.clinicName,
        clinicAddress: form.clinicAddress,
        consultationFee: form.consultationFee,
        languages: form.languages,
        email: form.email,
        phone: form.phone,
        degreeUrl,
        licenseUrl,
        govIdUrl,
        photoUrl,
      });
      setStatus("done");
      setMessage("Application submitted. The clinical operations desk will review your documents shortly.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to submit");
    }
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link to="/">
            <NeoLogo />
          </Link>
          <Link to="/" className="text-sm font-semibold text-teal-700">
            ← Home
          </Link>
        </div>
        <div className="glass-panel p-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-700/70">Physicians</p>
          <h1 className="text-3xl font-light text-teal-950">NeoHomeo doctor application</h1>
          <p className="text-sm text-teal-900/70">
            Complete this secure form once your operations contact shares the NeoHomeo application link with you.
          </p>
          <p className="text-xs text-teal-800/60">
            Public URL (for admins to copy): <span className="font-mono break-all">{applyUrl}</span>
          </p>
        </div>

        {status === "done" ? (
          <div className="glass-panel p-8 text-center space-y-3">
            <h2 className="text-xl font-semibold text-teal-950">Thank you</h2>
            <p className="text-sm text-teal-900/75">{message}</p>
            <Link className="inline-flex text-teal-700 font-semibold" to="/">
              Return home
            </Link>
          </div>
        ) : (
          <form className="glass-panel p-6 space-y-5" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-teal-900">
                Full name
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Phone
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Qualification
                <input
                  required
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Specialization
                <input
                  required
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                  placeholder="e.g. Migraine, dermatology, women's health"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Years of experience
                <input
                  type="number"
                  min={0}
                  required
                  value={form.experienceYears}
                  onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900 md:col-span-2">
                Clinic name
                <input
                  required
                  value={form.clinicName}
                  onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900 md:col-span-2">
                Clinic address
                <textarea
                  required
                  rows={3}
                  value={form.clinicAddress}
                  onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-teal-900">
                Consultation fee (INR)
                <input
                  type="number"
                  min={0}
                  required
                  value={form.consultationFee}
                  onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-teal-100 bg-white/90 px-3 py-2"
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-teal-900 mb-2">Languages offered to patients</p>
              <div className="flex flex-wrap gap-2">
                {LANG_OPTIONS.map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => toggleLanguage(l)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      form.languages.includes(l)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-teal-900 border-teal-100"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {(
                [
                  ["degree", "Degree certificate", "degree"],
                  ["license", "Medical license", "license"],
                  ["govId", "Government ID", "govId"],
                  ["photo", "Profile photo", "photo"],
                ] as const
              ).map(([key, label, name]) => (
                <label key={key} className="text-sm font-medium text-teal-900">
                  {label}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required={key !== "photo"}
                    name={name}
                    onChange={(e) =>
                      setFiles((f) => ({ ...f, [key]: e.target.files?.[0] ?? null }))
                    }
                    className="mt-1 w-full text-xs"
                  />
                </label>
              ))}
            </div>

            {message && <p className="text-sm text-red-600">{message}</p>}

            <button
              disabled={status === "submitting"}
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl shadow"
            >
              {status === "submitting" ? "Submitting…" : "Submit for verification"}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
