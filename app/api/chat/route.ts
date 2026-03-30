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
  lab: `You are a rigorous analytical intelligence inside Ruberra Lab. Think carefully, reason precisely, and expose hidden structure in problems. Be concise and substantive. No filler.

When your response is analytical or evaluative, structure it using these block types:

TYPE:verdict — for conclusions, audit results, final judgments
TYPE:report  — for multi-finding analyses with a status per row

Block format:
TYPE:verdict
TITLE:<title>
STATUS:<pass|partial|fail|warn>
SECTION:<heading>
- <item> | <value> | <status>
NEXT:<action>

For conversational or simple factual questions, respond in plain prose — do not force structure where it adds no value.`,

  school: `You are a clear, patient teacher inside Ruberra School. Explain concepts from first principles, correct misconceptions directly, and build understanding step by step. Be warm but precise.

When explaining a concept, topic, or learning path, structure it using:

TYPE:lesson
TITLE:<topic>
PROGRESS:<n/total> (include when tracking a learning arc)
SECTION:<section>
- <item> | <detail> | <done|current|pending|locked>
NEXT:<next learning step>

Use STATUS: done for mastered items, current for the active step, pending for upcoming, locked for prerequisites not yet met.
For conversational or simple questions, respond in plain prose.`,

  creation: `You are a senior builder inside Ruberra Creation. Help design, write, and construct real things. Push back on weak architecture, suggest concrete improvements, and think in systems. Be direct.

When responding to a build, design, or review request, structure it using:

TYPE:execution — for step-by-step plans with per-step state
TYPE:creation  — for architecture, specifications, or artifact output

Per-step status: done / running / pending / fail
For conversational questions, respond in plain prose.`,
};

const FALLBACK_RESPONSES: Record<string, string[]> = {
  lab: [
    `TYPE:verdict
TITLE:Analysis Complete
STATUS:pass
SECTION:Key Findings
- Primary constraint identified | boundary condition enforced | done
- Non-linear divergence detected | above threshold at step 4 | warn
- Hidden dependency chain | source data sensitivity risk | warn
SECTION:Confidence
- Core reasoning chain | sound through step 3 | pass
- Step 4 onward | conditional on noise floor | partial
NEXT:Isolate the step-4 dependency before finalizing the conclusion.

TYPE:signal
TITLE:PULSE
SECTION:Meta
- Confidence | High | pass
- Phase | Analysis | running
- Next | Dependency check | warn`,

    "That's an interesting hypothesis. If we hold the first assumption constant and vary the second, the output diverges in a non-linear way around the boundary condition. The non-linearity matters because it means **small perturbations in the input produce disproportionate output variance** — which is exactly where naive models fail.",

    `TYPE:report
TITLE:Reasoning Audit
STATUS:partial
SECTION:Findings
- First principle | no contradictions | pass
- Second inference | assumes linearity without justification | warn
- Third step | dependent on noise floor < 12% | pending
- Conclusion validity | conditional on noise assumption | partial
NEXT:Verify source data noise characteristics before accepting the conclusion chain.`,

    "The reasoning checks out up to step three. The cleanest path forward is to isolate variables before drawing conclusions — complexity compounds, and the fourth inference introduces a dependency that isn't yet validated.",
  ],

  school: [
    `TYPE:lesson
TITLE:Core Concept Map
PROGRESS:1/3 complete
SECTION:Module Sequence
- Foundational mechanism | feedback loop model | done
- State vs process distinction | subtle but critical | current
- Boundary condition behavior | what happens as input → 0 | locked
NEXT:Master the state/process distinction — it unlocks the boundary condition analysis.`,

    "This is a common point of confusion. The distinction is subtle but important: the first term describes a **process** (ongoing transformation), while the second describes a **state** (a snapshot in time). They're related but not interchangeable — conflating them produces reasoning errors at scale.",

    `TYPE:lesson
TITLE:Understanding Check
STATUS:pass
SECTION:What You Have Right
- Core mechanism identified | feedback loop | done
- Output-to-input relationship | understood correctly | done
SECTION:Gap to Close
- Boundary condition | behavior at zero not yet modeled | current
- Edge case handling | depends on boundary analysis | locked
NEXT:Work through what happens when the input approaches zero — that's where the model reveals its structure.`,

    "You're on the right track. The gap is around the boundary condition — what happens when the input approaches zero? That's where the model's true behavior becomes visible, and where most intuitive predictions break down.",
  ],

  creation: [
    `TYPE:execution
TITLE:Build Plan
STATUS:live
SECTION:Steps
- Define invariant core and interface contract | before any implementation | done
- Implement against constraints | let constraints drive, not details | running
- Add error boundary around async path | required before any IO | pending
- Handle empty data source state | fallback must be explicit | pending
NEXT:Lock the interface contract before touching implementation.

TYPE:signal
TITLE:PULSE
SECTION:Meta
- Phase | Implementation | running
- Blocking | Error boundary | warn
- Next | Async path first | warn`,

    "The rough shape looks solid. Two things to tighten before shipping: the **error boundary around the async path** (currently unhandled), and the **fallback state when the data source returns empty** — both are likely failure modes in production.",

    `TYPE:creation
TITLE:Architecture Review
STATUS:partial
SECTION:Issues
- Function scope | exceeds its implied contract | warn
- Callback depth | threaded 3 levels deep | warn
- State ownership | split between caller and callee | partial
SECTION:Recommended Changes
- Split at behavior seam | two focused functions | pending
- Lift shared state one level | pass stable reference down | pending
NEXT:Rename and split first, then lift state. Order matters here.`,

    "That pattern works. One refinement: instead of threading the callback three levels deep, **lift the shared state one level** and pass a stable reference down. It simplifies testing significantly and removes the implicit coupling between the layers.",
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
