import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const TAB_SYSTEM: Record<string, string> = {
  lab:
    "You are Ruberra Lab — an advanced AI reasoning kernel. Respond with precision, depth, and directness. No preamble, no pleasantries. Think clearly and answer completely.",
  school:
    "You are Ruberra School — a structured knowledge guide. Break down concepts from first principles. Be clear, layered, and educational without being condescending.",
  creation:
    "You are Ruberra Creation — a production-focused AI builder. Respond with structured, actionable output. Generate code, drafts, or plans with intent and precision.",
};

const FALLBACK: Record<string, string[]> = {
  lab: [
    "Reasoning kernel active. Query received and processed against current context layer.",
    "Analysis complete. The pattern you identified holds under second-order examination. Derived output follows.",
    "Hypothesis registered. Cross-reference against session artifacts returns three relevant signals.",
    "Experimental branch confirmed. Confidence: high. Proceeding with result.",
  ],
  school: [
    "Concept loaded. Let me decompose this from first principles into structured knowledge nodes.",
    "The core mechanism here operates through three interconnected layers. Here is the structured breakdown.",
    "Study path generated. Two prerequisite concepts anchor this topic. Starting with the foundation.",
    "Understanding confirmed. Your framing is precise. Here is the extended explanation.",
  ],
  creation: [
    "Builder kernel active. Generating structured output from your directive now.",
    "Draft produced. Review the composition and specify refinements as needed.",
    "Creation artifact initialized. The output follows your intent with one interpretive expansion.",
    "Output complete. Artifact registered to the current session context.",
  ],
};

let fallbackCursors: Record<string, number> = {};

function getFallbackStream(tab: string): ReadableStream<Uint8Array> {
  const pool = FALLBACK[tab] ?? FALLBACK.lab;
  const cursor = fallbackCursors[tab] ?? 0;
  fallbackCursors[tab] = (cursor + 1) % pool.length;
  const text = pool[cursor];

  const encoder = new TextEncoder();
  let i = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= text.length) {
        controller.close();
        return;
      }
      // Emit one character at a time as plain text chunk
      controller.enqueue(encoder.encode(text[i]));
      i++;
      await new Promise((r) => setTimeout(r, 14));
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages, tab } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  // No key → return plain-text streaming fallback so the UI always works
  if (!apiKey) {
    const stream = getFallbackStream(tab ?? "lab");
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Ruberra-Mode": tab ?? "lab",
        "X-Ruberra-Source": "fallback",
      },
    });
  }

  const openai = createOpenAI({ apiKey });

  const systemPrompt =
    TAB_SYSTEM[tab as string] ?? TAB_SYSTEM.lab;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse({
    headers: {
      "X-Ruberra-Mode": tab ?? "lab",
      "X-Ruberra-Source": "openai",
    },
  });
}
