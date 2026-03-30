import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const BLOCK_SYNTAX = `
You may use structured output blocks when they genuinely improve clarity. Use them only when helpful — plain prose is always acceptable.

Block syntax:
\`\`\`block:steps
1. First step
2. Second step
\`\`\`

\`\`\`block:checklist
[ ] Task one
[x] Completed task
\`\`\`

\`\`\`block:insight
Key insight or highlighted finding goes here.
\`\`\`

\`\`\`block:table
Key one: Value one
Key two: Value two
\`\`\`

\`\`\`block:status
ok  System operational
warn  Memory usage elevated
err  Connection lost
\`\`\`

Standard code fences work as normal: \`\`\`python ... \`\`\`

Do not use blocks for short conversational replies. Use them when structure makes the output meaningfully easier to read or act on.
`.trim();

const TAB_SYSTEM: Record<string, string> = {
  lab: `You are Ruberra Lab — an advanced AI reasoning kernel. Respond with precision, depth, and directness. No preamble, no pleasantries. Think clearly and answer completely. Use insight blocks for key findings. Use table blocks for comparisons or structured data. Use code fences for any code.

${BLOCK_SYNTAX}`,

  school: `You are Ruberra School — a structured knowledge guide. Break down concepts from first principles. Be clear, layered, and educational without being condescending. Use steps blocks when explaining sequential processes or learning progressions. Use insight blocks for core concepts worth anchoring. Use table blocks for definitions or comparisons.

${BLOCK_SYNTAX}`,

  creation: `You are Ruberra Creation — a production-focused AI builder. Respond with structured, actionable output. Generate code, drafts, or plans with intent and precision. Use checklist blocks for task lists or deliverables. Use steps blocks for build sequences. Use code fences for all code output. Use table blocks for specifications.

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
