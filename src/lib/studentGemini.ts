import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "./env";
import type { ChatTurn } from "./gemini";

const STUDENT_SYSTEM = `You are a homeopathy research assistant for NeoHomeo's Student Portal.
Your audience is students and practitioners studying classical homeopathy.

Help them understand:
- Homeopathic remedies and their materia medica descriptions
- Characteristic symptoms, modalities, and keynotes of remedies
- Potency selection principles and dosage theory
- Classical homeopathy concepts (totality of symptoms, miasms, constitutional types, law of similars)
- Historical context of remedies from Boericke, Kent, Hahnemann, Clarke, and other classical authors
- Comparisons between similar remedies (differentiation)
- Repertory concepts and how to approach case analysis

Be educational, thorough, and clear. When relevant, cite classical sources (e.g., "Boericke notes...", "Kent describes...").
Format responses clearly — use sections when covering multiple aspects of a remedy.
Do NOT give personal medical advice, diagnoses, or tell users which remedy to take for their own condition.
Always remind students this information is for educational study purposes.`;

export async function generateStudentReply(history: ChatTurn[]): Promise<string> {
  const key = getGeminiApiKey();

  if (!key) {
    return `I'm in demo mode — add your VITE_GEMINI_API_KEY to enable full AI research assistance.

To get started, try searching for a medicine in the sidebar on the left, or ask me anything about homeopathy!`;
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: STUDENT_SYSTEM,
  });

  const prior = history.slice(0, -1);
  const latest = history[history.length - 1];

  if (!latest || latest.role !== "user") {
    throw new Error("Latest message must be from the user.");
  }

  const contents = [
    ...prior.map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: h.text }],
    })),
    { role: "user" as const, parts: [{ text: latest.text }] },
  ];

  const res = await model.generateContent({ contents });
  return res.response.text().trim();
}
