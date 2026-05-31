// Deno Edge Function — proxies requests to homeoint.org (CORS bypass)
// Deploy: supabase functions deploy medicine-proxy --no-verify-jwt

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const BASE_URL = "https://www.homeoint.org/books/boericmm";

// Allowed path pattern: e.g. "a/abies-c.htm"
const SAFE_PATH = /^[a-z]\/[a-z0-9-]+\.htm$/;

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractBetween(
  html: string,
  openTag: string,
  closeTag: string,
  fromIndex = 0
): { content: string; endIndex: number } | null {
  const start = html.indexOf(openTag, fromIndex);
  if (start === -1) return null;
  const end = html.indexOf(closeTag, start + openTag.length);
  if (end === -1) return null;
  return {
    content: html.slice(start + openTag.length, end),
    endIndex: end + closeTag.length,
  };
}

interface MedicineSection {
  heading: string;
  content: string;
}

interface MedicineData {
  title: string;
  intro: string;
  sections: MedicineSection[];
  dose: string;
}

function parseHtml(html: string): MedicineData {
  // ── Title ──
  let title = "";
  const titleMatch = extractBetween(html, "<title>", "</title>");
  if (titleMatch) {
    title = stripTags(titleMatch.content)
      .replace(/Boericke.*?medica/i, "")
      .replace(/[-|]/g, "")
      .trim();
  }

  // Also try h1
  const h1 = extractBetween(html, "<h1>", "</h1>") ??
              extractBetween(html, "<H1>", "</H1>");
  if (h1) {
    const h1Text = stripTags(h1.content).trim();
    if (h1Text.length > 0 && h1Text.length < 200) title = h1Text;
  }

  // ── Body ──
  let body = html;
  const bodyStart = html.toLowerCase().indexOf("<body");
  if (bodyStart !== -1) {
    const bodyTagEnd = html.indexOf(">", bodyStart);
    body = html.slice(bodyTagEnd + 1);
  }

  // Remove nav / footer cruft (copyright lines)
  body = body.replace(/<hr[^>]*>/gi, "\n").replace(/<HR[^>]*>/g, "\n");

  // ── Split body on <h2> / <H2> tags to get sections ──
  // Use a regex that handles both cases and attributes
  const sectionSplitRe = /<h2[^>]*>|<H2[^>]*>/gi;
  const parts = body.split(sectionSplitRe);

  // First part before any <h2> is the intro
  let intro = "";
  if (parts.length > 0) {
    // Remove the remedy name heading (h1) that's already captured
    const rawIntro = parts[0]
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
      .replace(/<H1[^>]*>[\s\S]*?<\/H1>/gi, "")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/p>/gi, "")
      .replace(/<br[^>]*>/gi, "\n")
      .replace(/<BR[^>]*>/gi, "\n");
    intro = stripTags(rawIntro).trim();
    // Trim to first few meaningful sentences
    const sentences = intro.split(/(?<=[.!?])\s+/);
    intro = sentences.slice(0, 6).join(" ").trim();
  }

  // ── Extract headings and content from section parts ──
  // We need to grab the heading text that came between the <h2> tags
  // Re-split using capture group to keep the headings
  const sectionParts: string[] = [];
  let remaining = body;
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>|<H2[^>]*>([\s\S]*?)<\/H2>/gi;
  let m: RegExpExecArray | null;
  let lastIndex = 0;

  while ((m = h2Re.exec(body)) !== null) {
    sectionParts.push("__HEADING__" + (m[1] ?? m[2] ?? ""));
    lastIndex = h2Re.lastIndex;
  }

  // Fallback: use <b> tags as headings if no <h2> found
  if (sectionParts.length === 0) {
    // Parse using <b> or <strong> tags for section headings
    const bRe = /<b[^>]*>([\s\S]*?)<\/b>|<strong[^>]*>([\s\S]*?)<\/strong>/gi;
    while ((m = bRe.exec(body)) !== null) {
      const hText = stripTags(m[1] ?? m[2] ?? "").trim();
      // Only treat as section heading if it's short and uppercase-ish
      if (hText.length > 2 && hText.length < 40 && hText === hText.toUpperCase()) {
        sectionParts.push("__HEADING__" + hText);
      }
    }
  }

  // Now build sections by re-parsing with h2 split including content
  remaining = body;
  const sections: MedicineSection[] = [];
  let dose = "";

  // Re-do: split on h2 open, collect heading via next close, then body text
  const fullH2Re = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|<\/body|$)/gi;
  while ((m = fullH2Re.exec(body)) !== null) {
    const heading = stripTags(m[1] ?? "").trim();
    const rawContent = (m[2] ?? "")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<\/p>/gi, "")
      .replace(/<br[^>]*>/gi, "\n")
      .replace(/<BR[^>]*>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<\/li>/gi, "");
    const content = stripTags(rawContent).trim();

    if (!heading) continue;

    if (heading.toLowerCase().includes("dose")) {
      dose = content;
      sections.push({ heading, content });
    } else {
      sections.push({ heading, content });
    }
  }

  // Fallback if regex found nothing — try a simpler split
  if (sections.length === 0) {
    const fallbackRe = /<[Hh]2[^>]*>(.*?)<\/[Hh]2>/g;
    let prevIdx = 0;
    const headings: Array<{ text: string; idx: number }> = [];
    while ((m = fallbackRe.exec(body)) !== null) {
      headings.push({ text: stripTags(m[1]).trim(), idx: m.index });
    }
    for (let i = 0; i < headings.length; i++) {
      const start = body.indexOf(">", headings[i].idx) + 1;
      const end = i + 1 < headings.length ? headings[i + 1].idx : body.length;
      const content = stripTags(body.slice(start, end)).trim();
      sections.push({ heading: headings[i].text, content });
    }
    void prevIdx; // suppress unused warning
  }

  return { title, intro, sections, dose };
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "";

  // SSRF guard
  if (!SAFE_PATH.test(path)) {
    return new Response(
      JSON.stringify({ error: "Invalid medicine path" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const targetUrl = `${BASE_URL}/${path}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NeoHomeo-Student-Bot/1.0; +https://neohomeo.com)",
        "Accept": "text/html",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${res.status}` }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();
    const data = parseHtml(html);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
