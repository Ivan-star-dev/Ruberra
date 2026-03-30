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

export const runtime = "edge";

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string;
}

interface RequestBody {
  tab: "lab" | "school" | "creation";
  messages: ChatMessage[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  lab:
    "You are a rigorous analytical intelligence inside Ruberra Lab. Think carefully, reason precisely, and expose hidden structure in problems. Be concise and substantive. No filler.",
  school:
    "You are a clear, patient teacher inside Ruberra School. Explain concepts from first principles, correct misconceptions directly, and build understanding step by step. Be warm but precise.",
  creation:
    "You are a senior builder inside Ruberra Creation. Help design, write, and construct real things. Push back on weak architecture, suggest concrete improvements, and think in systems. Be direct.",
};

const FALLBACK_RESPONSES: Record<string, string[]> = {
  lab: [
    "Analyzing the problem space. The key variables here are constrained by the underlying model — let me reason through the edge cases systematically.",
    "That's an interesting hypothesis. If we hold the first assumption constant and vary the second, the output diverges in a non-linear way around the boundary condition.",
    "Let me think through this step by step. The first principle here is that complexity compounds — so the cleanest path is to isolate variables before drawing conclusions.",
    "The reasoning checks out up to the third inference. The fourth step introduces a hidden dependency that may invalidate the chain if the source data has noise above 12%.",
  ],
  school: [
    "Great question. The core concept here builds on three foundational ideas — let me unpack each one before connecting them to your specific case.",
    "This is a common point of confusion. The distinction is subtle but important: the first term describes a process, while the second describes a state. They're related but not interchangeable.",
    "Think of it this way: the underlying mechanism is like a feedback loop. Once you understand that the output feeds back into the input, the rest of the behavior becomes predictable.",
    "You're on the right track. The gap in your reasoning is around the boundary condition — what happens when the input approaches zero? That's where the model reveals its true structure.",
  ],
  creation: [
    "Here's a strong structural approach: start with the invariant core, define the interfaces, then let the implementation details follow from the constraints rather than leading them.",
    "The rough shape looks solid. Two things to tighten before shipping: the error boundary around the async path, and the fallback state when the data source returns empty.",
    "I'd push back slightly on the naming — the function does more than its name implies, which will create maintenance confusion at scale. Consider splitting it at the seam where the behavior changes.",
    "That pattern works. One refinement: instead of threading the callback three levels deep, lift the shared state one level and pass a stable reference down. It'll simplify testing significantly.",
  ],
};

function makeFallbackStream(tab: string): ReadableStream<Uint8Array> {
  const pool = FALLBACK_RESPONSES[tab] ?? FALLBACK_RESPONSES.lab;
  const text = pool[Math.floor(Math.random() * pool.length)];
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
    start(controller) {
      // Brief "thinking" pause before first character
      setTimeout(function emit() {
        if (i < text.length) {
          controller.enqueue(encoder.encode(text[i]));
          i++;
          setTimeout(emit, 14);
        } else {
          controller.close();
        }
      }, 420);
    },
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { tab, messages } = body;

  // Real OpenAI path
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const systemMessage: ChatMessage = {
      role: "system",
      content: SYSTEM_PROMPTS[tab] ?? SYSTEM_PROMPTS.lab,
    };

    try {
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          stream: true,
          messages: [systemMessage, ...messages],
        }),
      });

      if (!upstream.ok) {
        // Fall through to fallback on upstream error
        console.error("OpenAI upstream error", upstream.status);
      } else if (upstream.body) {
        // Parse SSE and emit only the text content as a plain text stream
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                for (const line of chunk.split("\n")) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const data = trimmed.slice(5).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data) as {
                      choices?: { delta?: { content?: string } }[];
                    };
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch {
                    // Malformed SSE line — skip
                  }
                }
              }
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    } catch (err) {
      console.error("OpenAI fetch failed, using fallback", err);
    }
  }

  // Fallback: server-side simulated stream
  return new Response(makeFallbackStream(tab), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
