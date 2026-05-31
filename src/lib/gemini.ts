import Groq from "groq-sdk";
import { getGroqApiKey } from "./env";

export type ChatTurn = { role: "user" | "model"; text: string };

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM = `You are Dr. Neo, a warm, empathetic junior homeopathy assistant for NeoHomeo.
You conduct a preliminary health assessment only. Never give a final diagnosis or prescribe specific remedies with certainty.
Use supportive, non-alarming language. Gather: current symptoms, history, lifestyle, sleep, stress, digestion, emotional patterns.
When you have enough structured information for a clinician, end your message with a new line containing exactly:
[ASSESSMENT_COMPLETE]
followed immediately by a single JSON object (no markdown fences) with keys:
summary (string, structured medical overview for the doctor),
conditionCategory (string),
severity (one of: Low, Moderate, Severe),
notesForDoctor (string).
Whenever helpful, after your main message offer 3-5 short clickable choices using exactly this pattern on its own line:
[OPTIONS] option A | option B | option C
Use the patient's chosen language for all visible text.
If the user selects options, treat them as their answer and continue the assessment tree logically.`;

const NO_REPEAT = `
IMPORTANT: A verified patient record is provided below. Do NOT ask for name, age, weight, height, blood group, city, gender, or any demographic or static medical history item that already appears there. Do NOT repeat intake questions about data already listed. Focus on the evolving complaint, modalities, timeline, and clarifying details not yet covered.`;

export function parseOptions(text: string): string[] | null {
  const lines = text.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith("[OPTIONS]")) {
      const rest = line.slice("[OPTIONS]".length).trim();
      return rest
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return null;
}

export function stripOptionsAndCompleteMarkers(text: string): string {
  return text
    .split("\n")
    .filter((l) => !l.trim().startsWith("[OPTIONS]"))
    .join("\n")
    .replace(/\[ASSESSMENT_COMPLETE\][\s\S]*$/m, "")
    .trim();
}

export function extractAssessmentJson(text: string): { summary: string; raw: string } | null {
  const idx = text.indexOf("[ASSESSMENT_COMPLETE]");
  if (idx === -1) return null;
  const tail = text.slice(idx + "[ASSESSMENT_COMPLETE]".length).trim();
  try {
    const obj = JSON.parse(tail) as { summary?: string };
    return { summary: typeof obj.summary === "string" ? obj.summary : tail, raw: tail };
  } catch {
    return { summary: tail.slice(0, 4000), raw: tail };
  }
}

function buildSystemPrompt(patientContext?: string): string {
  if (!patientContext?.trim()) return SYSTEM;
  return `${SYSTEM}${NO_REPEAT}

----------- PATIENT RECORD (already collected; do not re-ask) -----------
${patientContext.trim()}
------------------------------------------------------------------------`;
}

export async function generateNeoReply(
  historyIncludingLatestUser: ChatTurn[],
  patientContext?: string
): Promise<string> {
  const key = getGroqApiKey();
  const userTurns = historyIncludingLatestUser.filter(
    (h) => h.role === "user" && !h.text.startsWith("[session]")
  );

  if (!key) {
    if (userTurns.length >= 3) {
      const last = userTurns.map((t) => t.text).join(" ");
      const base = patientContext ? `${patientContext}\n\nConversation: ${last}` : last;
      const summaryObj = {
        summary: base.slice(0, 4000),
        conditionCategory: "To be determined by clinician",
        severity: "Moderate",
        notesForDoctor: "Collected via Dr. Neo offline stub; verify with patient in consultation.",
      };
      return `Thank you for walking through this with me. I have captured enough detail for a NeoHomeo physician to continue your care.

[ASSESSMENT_COMPLETE]
${JSON.stringify(summaryObj)}`;
    }
    return `I am ready to listen. (Add VITE_GROQ_API_KEY for full AI.)

[OPTIONS] Headache | Skin issue | Digestive discomfort | Stress or anxiety | Something else`;
  }

  const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

  // Build messages array: system + chat history
  const prior = historyIncludingLatestUser.slice(0, -1);
  const latest = historyIncludingLatestUser[historyIncludingLatestUser.length - 1];

  if (!latest || latest.role !== "user") {
    throw new Error("Latest message must be from the patient.");
  }

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(patientContext) },
    ...prior.map((h) => ({
      role: (h.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: h.text,
    })),
    { role: "user", content: latest.text },
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return (completion.choices[0].message.content ?? "").trim();
}

export const LANGUAGE_BCP47: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
  Urdu: "ur-IN",
  Malayalam: "ml-IN",
};
