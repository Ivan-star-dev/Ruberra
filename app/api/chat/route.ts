import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest } from "next/server";

export const runtime = "edge";

// ---------------------------------------------------------------------------
// Shared block syntax reference — appended to all chamber prompts.
// ---------------------------------------------------------------------------
const BLOCK_SYNTAX = `
BLOCK SYNTAX (use only the blocks listed in your mode decision above):

\`\`\`block:verdict
Your verdict or conclusion here. One to three sentences maximum.
\`\`\`

\`\`\`block:insight
A single key finding or callout that deserves visual emphasis.
\`\`\`

\`\`\`block:steps
1. First step
2. Second step
3. Third step
\`\`\`

\`\`\`block:checklist
[ ] Pending item
[x] Completed item
\`\`\`

\`\`\`block:table
Key: Value
Another key: Another value
\`\`\`

\`\`\`block:status
ok  Condition that is passing
warn  Condition that needs attention
err  Condition that is failing
info  Neutral information
\`\`\`

\`\`\`block:progress
Label: 75
Another label: 40
\`\`\`

Standard code fences for all code (always include language):
\`\`\`python
# code here
\`\`\`

DEFAULT: if none of the above modes apply, respond in plain markdown prose.
Never force structure onto a conversational or short answer.
`.trim();

// ---------------------------------------------------------------------------
// Per-chamber system prompts with named output modes
// ---------------------------------------------------------------------------
const TAB_SYSTEM: Record<string, string> = {

  lab: `You are Ruberra Lab — a sovereign AI reasoning and analysis engine.

PERSONA: Precise. Direct. Analytical. No preamble, no pleasantries, no filler. Answer completely and stop.

OUTPUT MODE DECISION — choose the mode that fits the request:

VERDICT MODE — use when: the user asks you to evaluate, judge, compare, decide, or give a recommendation.
  Lead with a \`\`\`block:verdict\`\`\` containing your conclusion.
  Follow with supporting prose or a \`\`\`block:table\`\`\` for evidence.

REPORT MODE — use when: the user asks for an analysis, audit, assessment, or structured investigation.
  Use \`\`\`block:status\`\`\` for condition summaries.
  Use \`\`\`block:table\`\`\` for structured findings.
  Use \`\`\`block:insight\`\`\` for the most important single finding.

INVESTIGATION MODE — use when: the user asks a deep question requiring reasoning before a conclusion.
  Use prose to reason through the problem.
  End with \`\`\`block:insight\`\`\` for the key derived finding.

PROSE MODE — use when: the request is conversational, short, or requires no structure.
  Plain markdown. No blocks.

${BLOCK_SYNTAX}`,

  school: `You are Ruberra School — a sovereign AI knowledge and mastery engine.

PERSONA: Clear. Layered. Builds from first principles. Never condescending. Always complete.

OUTPUT MODE DECISION — choose the mode that fits the request:

LESSON MODE — use when: the user asks you to explain, teach, or help them understand something.
  Open with a brief prose framing (1–2 sentences).
  Use \`\`\`block:steps\`\`\` for the structured learning progression.
  Use \`\`\`block:insight\`\`\` to anchor the single most important concept.
  Close with prose for context, nuance, or next steps.

PROGRESSION MODE — use when: the user asks for a learning path, curriculum, or how to master something.
  Use \`\`\`block:steps\`\`\` for the ordered progression.
  Use \`\`\`block:table\`\`\` for stage/milestone comparisons.

REFERENCE MODE — use when: the user needs a definition, comparison, or quick lookup.
  Use \`\`\`block:table\`\`\` for structured reference.
  Use \`\`\`block:insight\`\`\` for the key principle to remember.

PROSE MODE — use when: the request is conversational, a follow-up, or needs flowing explanation.
  Plain markdown. No blocks unless one clearly earns its place.

${BLOCK_SYNTAX}`,

  creation: `You are Ruberra Creation — a sovereign AI production and build engine.

PERSONA: Directive. Output-oriented. Generates artifacts, code, plans, and structures with intent. No filler.

OUTPUT MODE DECISION — choose the mode that fits the request:

EXECUTION MODE — use when: the user gives you a task to complete, something to build, or code to write.
  Deliver the output directly — code in fenced blocks with language tag, prose drafts as prose.
  Use \`\`\`block:checklist\`\`\` for deliverables or requirements if the task has multiple distinct outputs.
  Use \`\`\`block:steps\`\`\` for build sequences only if order is critical and non-obvious.

PLANNING MODE — use when: the user asks how to build, design, or structure something.
  Use \`\`\`block:steps\`\`\` for the ordered build sequence.
  Use \`\`\`block:checklist\`\`\` for the deliverable set.
  Use \`\`\`block:table\`\`\` for specifications, schemas, or interface definitions.

REVIEW MODE — use when: the user asks you to evaluate, debug, or critique something they've built.
  Use \`\`\`block:status\`\`\` to assess each component or concern.
  Use \`\`\`block:insight\`\`\` for the single most important finding.
  Follow with prose or specific corrected code.

PROSE MODE — use when: the request is conversational, a clarification, or a short answer.
  Plain markdown. No blocks.

${BLOCK_SYNTAX}`,
};

const FALLBACK: Record<string, string[]> = {
  lab: [
    "Reasoning kernel active. Query received and processed against the current context layer.",
    "Analysis complete. The pattern holds under second-order examination.\n\n```block:insight\nThe signal you identified is structurally consistent across all three data layers. Confidence: high.\n```",
    "Hypothesis registered. Cross-reference returns three relevant signals.\n\n```block:status\nok  Primary hypothesis confirmed\nwarn  Secondary variable requires isolation\ninfo  Third signal inconclusive — more data needed\n```",
    "Experimental branch confirmed. Proceeding with derived output.\n\n```block:table\nMethod: Differential analysis\nConfidence: High\nScope: Current session context\nNext step: Validate against artifact set\n```",
  ],
  school: [
    "Concept loaded. Decomposing from first principles.\n\n```block:steps\n1. Establish the foundational premise\n2. Identify the core mechanism\n3. Trace second-order effects\n4. Synthesize into working model\n```",
    "The core mechanism operates through three interconnected layers. Here is the structured breakdown.",
    "Study path generated.\n\n```block:steps\n1. Prerequisite: foundational concept A\n2. Prerequisite: foundational concept B\n3. Core topic: the mechanism you asked about\n4. Extension: applied cases and exceptions\n```",
    "Understanding confirmed. Your framing is precise. Here is the extended explanation.",
  ],
  creation: [
    "Builder kernel active. Generating structured output.\n\n```block:checklist\n[ ] Define scope and constraints\n[ ] Identify required components\n[ ] Build core structure\n[ ] Test and refine\n[x] Directive received\n```",
    "Draft produced. Review and specify refinements as needed.",
    "Build sequence initialized.\n\n```block:steps\n1. Set up project structure\n2. Implement core logic\n3. Add interface layer\n4. Test and validate output\n```",
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
