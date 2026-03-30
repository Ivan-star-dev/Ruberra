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
    `TYPE:verdict
TITLE:Analysis Complete
STATUS:pass
SECTION:Key Findings
- Primary constraint identified | boundary condition | done
- Edge case present | non-linear divergence above threshold | warn
- Hidden dependency at inference step 4 | source data noise risk | warn
SECTION:Confidence Assessment
- Core reasoning chain | sound through step 3 | pass
- Step 4 dependency | unvalidated | partial
NEXT:Isolate the step-4 dependency before drawing final conclusions.`,
    "That's an interesting hypothesis. If we hold the first assumption constant and vary the second, the output diverges in a non-linear way around the boundary condition.",
    `TYPE:report
TITLE:Reasoning Audit
STATUS:partial
SECTION:Findings
- First principle holds | no contradictions | pass
- Second inference | introduces assumed linearity | warn
- Third step | dependent on noise floor below 12% | pending
- Conclusion validity | conditional on noise assumption | partial
NEXT:Verify source data noise characteristics before accepting conclusion.`,
    "Let me think through this step by step. The first principle here is that complexity compounds — so the cleanest path is to isolate variables before drawing conclusions.",
  ],
  school: [
    `TYPE:lesson
TITLE:Core Concept Map
STATUS:current
PROGRESS:1/3 complete
SECTION:Module Sequence
- Foundational mechanism | feedback loop model | done
- State vs process distinction | | current
- Boundary condition behavior | what happens as input → 0 | locked
NEXT:Master the state/process distinction before moving to boundary conditions.`,
    "This is a common point of confusion. The distinction is subtle but important: the first term describes a process, while the second describes a state. They're related but not interchangeable.",
    `TYPE:lesson
TITLE:Understanding Check
STATUS:pass
SECTION:What You Have Right
- Core mechanism identified | feedback loop | done
- Output-input relationship | understood | done
SECTION:Gap to Close
- Boundary condition | behavior at zero not yet modeled | current
- Edge case handling | not yet covered | locked
NEXT:Work through what happens when the input approaches zero — that's where structure reveals itself.`,
    "You're on the right track. The gap in your reasoning is around the boundary condition — what happens when the input approaches zero? That's where the model reveals its true structure.",
  ],
  creation: [
    `TYPE:execution
TITLE:Build Plan
STATUS:live
SECTION:Steps
- Define invariant core and interfaces | before implementation | done
- Implement against constraints | not leading with details | running
- Add error boundary around async path | | pending
- Handle empty data source fallback | | pending
NEXT:Get the interface contract locked before touching implementation details.`,
    "The rough shape looks solid. Two things to tighten before shipping: the error boundary around the async path, and the fallback state when the data source returns empty.",
    `TYPE:creation
TITLE:Architecture Review
STATUS:partial
TAGS:refactor, naming, state
SECTION:Parameters
- Function scope | exceeds implied contract | warn
- Callback depth | 3 levels deep | warn
- State ownership | split between caller and callee | partial
SECTION:Recommended Changes
- Split function at behavior seam | two focused functions | pending
- Lift shared state one level | pass stable reference down | pending
NEXT:Rename + split first, then lift state — in that order.`,
    "That pattern works. One refinement: instead of threading the callback three levels deep, lift the shared state one level and pass a stable reference down. It'll simplify testing significantly.",
  ],
};

function makeFallbackStream(tab: string): ReadableStream<Uint8Array> {
  const pool = FALLBACK_RESPONSES[tab] ?? FALLBACK_RESPONSES.lab;
  const text = pool[Math.floor(Math.random() * pool.length)];
  const encoder = new TextEncoder();
  let i = 0;

  return new ReadableStream<Uint8Array>({
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
