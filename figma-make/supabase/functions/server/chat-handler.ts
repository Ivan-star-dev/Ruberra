/**
 * RUBERRA Chat Handler — Supabase Edge Function
 * Streaming AI via OpenAI GPT-4o-mini with per-chamber system prompts.
 * Includes character-by-character fallback when no API key is set.
 *
 * Endpoint: POST /make-server-b9f46b68/chat
 * Body: { tab: "lab" | "school" | "creation", messages: { role, content }[] }
 */

const SYSTEM_PROMPTS: Record<string, string> = {
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

For conversational questions, respond in plain prose.`,

  school: `You are a clear, patient teacher inside Ruberra School. Explain concepts from first principles, correct misconceptions directly, and build understanding step by step.

When explaining a concept or learning path:
TYPE:lesson
TITLE:<topic>
PROGRESS:<n/total>
SECTION:<section>
- <item> | <detail> | <done|current|pending|locked>
NEXT:<next learning step>

For conversational questions, respond in plain prose.`,

  creation: `You are a senior builder inside Ruberra Creation. Help design, write, and construct real things. Push back on weak architecture, suggest improvements, think in systems.

For build/design requests:
TYPE:execution — step-by-step plans with per-step state
TYPE:creation  — architecture, specifications, artifact output

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
NEXT:Isolate the step-4 dependency before finalizing the conclusion.`,
    "That's an interesting hypothesis. If we hold the first assumption constant and vary the second, the output diverges in a non-linear way around the boundary condition — exactly where naive models fail.",
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
    "This is a common point of confusion. The distinction is subtle but important: the first term describes a process, while the second describes a state. Conflating them produces reasoning errors at scale.",
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
NEXT:Lock the interface contract before touching implementation.`,
    "The rough shape looks solid. Two things to tighten: the error boundary around the async path (currently unhandled), and the fallback state when data source returns empty.",
  ],
};

export function makeFallbackStream(tab: string): ReadableStream<Uint8Array> {
  const pool = FALLBACK_RESPONSES[tab] ?? FALLBACK_RESPONSES["lab"];
  const text = pool[Math.floor(Math.random() * pool.length)];
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    start(controller) {
      setTimeout(function emit() {
        if (i < text.length) { controller.enqueue(encoder.encode(text[i])); i++; setTimeout(emit, 14); }
        else { controller.close(); }
      }, 420);
    },
  });
}

export async function handleChatRequest(body: { tab: string; messages: { role: string; content: string }[] }, apiKey: string | undefined) {
  const { tab, messages } = body;

  if (apiKey) {
    const systemMessage = { role: "system", content: SYSTEM_PROMPTS[tab] ?? SYSTEM_PROMPTS["lab"] };
    try {
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o-mini", stream: true, messages: [systemMessage, ...messages] }),
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
                  try { const parsed = JSON.parse(data); const content = parsed.choices?.[0]?.delta?.content; if (content) controller.enqueue(encoder.encode(content)); } catch { /* skip */ }
                }
              }
            } finally { controller.close(); reader.releaseLock(); }
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
      }
    } catch (err) { console.log("[Ruberra] OpenAI fetch failed, using fallback:", err); }
  }

  return new Response(makeFallbackStream(tab), { headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
}
