import Groq from "groq-sdk";
import { getGroqApiKey } from "./env";
import type { ChatTurn } from "./gemini";

const MODEL = "llama-3.3-70b-versatile";

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
  const key = getGroqApiKey();

  if (!key) {
    return `I'm in demo mode — add your VITE_GROQ_API_KEY to enable full AI research assistance.

To get started, try searching for a medicine in the sidebar on the left, or ask me anything about homeopathy!`;
  }

  const latest = history[history.length - 1];
  if (!latest || latest.role !== "user") {
    throw new Error("Latest message must be from the user.");
  }

  const prior = history.slice(0, -1);

  const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: STUDENT_SYSTEM },
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
    max_tokens: 2048,
  });

  return (completion.choices[0].message.content ?? "").trim();
}
