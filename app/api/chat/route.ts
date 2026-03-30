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
    "You are the Ruberra Lab kernel — a rigorous analytical intelligence. Think carefully, expose hidden structure, reason precisely, and be substantive. No filler, no preamble. Precision above comfort.",
  school:
    "You are the Ruberra School guide — a clear, structured teacher. Explain from first principles, correct misconceptions directly, build layered understanding. Be warm but precise. Pedagogy without condescension.",
  creation:
    "You are the Ruberra Creation forge — a senior builder AI. Help design, draft, and construct real things. Push back on weak architecture, suggest concrete improvements. Think in systems. Be direct and artifact-oriented.",
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
      controller.enqueue(encoder.encode(text[i]));
      i++;
      await new Promise((r) => setTimeout(r, 14));
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

      if (upstream.ok && upstream.body) {
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
                    if (content) controller.enqueue(encoder.encode(content));
                  } catch {
                    // malformed SSE line — skip
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
      console.error("[Ruberra] OpenAI fetch failed, using fallback", err);
    }
  }

  return new Response(makeFallbackStream(tab), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
