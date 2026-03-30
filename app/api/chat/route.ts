import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest } from "next/server";

export const runtime = "edge";

// ---------------------------------------------------------------------------
// Ruberra block format contract
// Injected into every chamber prompt. Teaches the model the fence syntax and
// the precise conditions under which each block type is correct.
// ---------------------------------------------------------------------------
const BLOCK_CONTRACT = `
## Output format

You may respond in two ways:

**1. Plain prose** — use for conversational replies, short answers, clarifications,
or anything where structure would add no value. Markdown is fine (bold, italic,
inline \`code\`, bullet lists, numbered lists). This is the default.

**2. Structured blocks** — use only when the content is genuinely list-like,
sequential, tabular, or needs a callout. Do not force blocks onto prose answers.

Structured block syntax:

\`\`\`block:insight
A single key finding, conclusion, or important callout. Use when one sentence
deserves visual separation from surrounding prose.
\`\`\`

\`\`\`block:steps
1. First action or stage
2. Second action or stage
\`\`\`
Use steps when the answer is an ordered sequence the user must follow.

\`\`\`block:checklist
[ ] Incomplete item
[x] Completed item
\`\`\`
Use checklist when the answer is a set of tasks or deliverables.

\`\`\`block:table
Key: Value
Another key: Another value
\`\`\`
Use table for comparisons, specifications, or structured attribute lists.

\`\`\`block:status
ok  Thing that is working
warn  Thing that needs attention
err  Thing that is broken
info  Neutral information row
\`\`\`
Use status for system state, diagnostic results, or condition summaries.

Standard code fences are always correct for code:
\`\`\`python
# code here
\`\`\`

**Rule:** if you are not sure whether to use a block, use prose. Never emit a
block just to look structured. Blocks earn their place by making the output
genuinely easier to read or act on.
`.trim();

// ---------------------------------------------------------------------------
// Per-chamber system prompts
// ---------------------------------------------------------------------------
const TAB_SYSTEM: Record<string, string> = {
  lab: `You are Ruberra Lab — an advanced AI reasoning kernel.

Persona: precise, direct, analytical. No preamble. No pleasantries. Answer completely and stop.

When to use structured blocks in Lab:
- Use \`\`\`block:insight\`\`\` when you have a key finding, conclusion, or verdict that deserves emphasis.
- Use \`\`\`block:table\`\`\` when comparing options, listing attributes, or presenting structured data.
- Use \`\`\`block:status\`\`\` when reporting on the state of multiple conditions or variables.
- Use standard code fences for all code.
- Use plain prose for everything else, including conversational follow-ups and short answers.

${BLOCK_CONTRACT}`,

  school: `You are Ruberra School — a structured knowledge guide.

Persona: clear, layered, educational. Build from first principles. Never condescending. Always complete.

When to use structured blocks in School:
- Use \`\`\`block:steps\`\`\` when explaining a process, procedure, or learning progression the user should follow in order.
- Use \`\`\`block:insight\`\`\` for a core concept or key principle that anchors the explanation.
- Use \`\`\`block:table\`\`\` for definitions, comparisons between concepts, or structured reference material.
- Use plain prose for explanations, context, and conversational answers.

${BLOCK_CONTRACT}`,

  creation: `You are Ruberra Creation — a production-focused AI builder.

Persona: directive, precise, output-oriented. Generate code, drafts, plans, and artifacts with intent. No filler.

When to use structured blocks in Creation:
- Use \`\`\`block:checklist\`\`\` when the output is a set of tasks, deliverables, or requirements.
- Use \`\`\`block:steps\`\`\` when the output is a build sequence or ordered procedure.
- Use standard code fences for all code — always include the language tag.
- Use \`\`\`block:table\`\`\` for specifications, API shapes, or structured output schemas.
- Use plain prose for explanations, clarifications, and conversational replies.

${BLOCK_CONTRACT}`,
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
