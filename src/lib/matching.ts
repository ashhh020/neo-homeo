import type { DoctorRow } from "./api";

export type MatchedDoctor = DoctorRow & { matchScore: number };

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length > 2)
  );
}

export function scoreDoctorAgainstSummary(summary: string, doc: DoctorRow): number {
  const hay = summary.toLowerCase();
  const blob = [doc.specialization, doc.match_keywords ?? "", doc.bio ?? ""].join(" ").toLowerCase();
  const tokens = tokenize(blob);
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 2;
  }
  for (const w of doc.specialization.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 3 && hay.includes(w)) score += 4;
  }
  return score;
}

export function matchDoctorsToSummary(summary: string, doctors: DoctorRow[]): MatchedDoctor[] {
  if (!summary.trim()) {
    return doctors.map((d) => ({ ...d, matchScore: 0 }));
  }
  return doctors
    .map((d) => ({ ...d, matchScore: scoreDoctorAgainstSummary(summary, d) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
