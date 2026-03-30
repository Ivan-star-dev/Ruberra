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

\`\`\`block:signal
Confidence: High [ok]
Phase: Analysis [neutral]
Next: Review findings [warn]
\`\`\`
Use signal for compact metadata strips — confidence, phase, next action, session state.

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
    // Verdict + signal meta strip (● dot + * lines)
    "```block:verdict\nThe approach is structurally sound. Proceed to implementation. Primary risk is in the integration layer, not the core logic.\n```\n\n```block:signal\nConfidence: High [ok]\nPhase: Verdict [neutral]\nNext: Integration audit [warn]\n```",
    // Report — full-width diff rows (deep green/amber/red stripes)
    "Analysis complete. Three conditions require attention.\n\n```block:status\nok  Core hypothesis validated against available data\nok  Methodology is sound and reproducible\nwarn  Secondary variable not fully isolated — findings are provisional\nerr  Third data point conflicts with the model — flag for review\n```\n\n```block:insight\nThe conflict in the third data point is the highest-priority issue. Resolve before drawing final conclusions.\n```",
    // Table with semantic value coloring
    "Two competing interpretations emerge. The evidence favors A.\n\n```block:table\nInterpretation A: Structural coupling in the integration layer\nInterpretation B: Environmental variance masking the signal\nEvidence weight: A > B (3:1)\nStatus: Confirmed\nRecommended path: Isolate integration layer and retest\n```\n\n```block:signal\nConfidence: Medium [warn]\nModel: Differential [neutral]\nNext: Isolate and retest [active]\n```",
    // Progress bars with value-colored labels
    "Investigation complete. Current track status:\n\n```block:progress\nCore logic validation: 92\nIntegration layer review: 47\nEdge case coverage: 68\nDocumentation: 20\n```",
  ],
  school: [
    // Lesson — stateful steps with ● dots + └ connectors + (active) inline label
    "The concept operates through a three-stage mechanism.\n\n```block:steps\n1. Establish the foundational premise — what the concept assumes to be true [done]\n2. Identify the core mechanism — how cause produces effect [active]\n3. Trace second-order effects — what the mechanism produces over time\n4. Synthesize — build a working model you can reason from\n```\n\n```block:insight\nMost confusion about this concept comes from skipping step 2. The mechanism is the thing — not the premise, not the effect.\n```",
    // Progression + signal meta
    "Structured learning path for this subject.\n\n```block:steps\n1. Foundation: core vocabulary and basic mechanics [done]\n2. Mechanism: how the system operates under normal conditions [active]\n3. Boundary cases: where the model breaks and why\n4. Application: using the concept to reason about real problems\n5. Mastery: derive the concept from scratch without reference\n```\n\n```block:signal\nCurrent stage: Mechanism [active]\nDepth: Intermediate [neutral]\nNext checkpoint: Boundary cases [neutral]\n```",
    // Table with semantic value inline color
    "```block:table\nConcept: The mechanism connecting cause and effect\nPrerequisite: Understanding of the foundational premise\nCommon error: Confusing the mechanism with its output\nTest question: Can you derive the outcome from the mechanism alone?\nMastery signal: Yes, without reference material\nStatus: Confirmed\n```\n\n```block:insight\nThe clearest test of understanding: can you explain the mechanism to someone with no background, using only first principles?\n```",
    "The distinction you are drawing is precise and important.\n\nMost learners treat these as equivalent because their outputs often overlap. But the mechanisms are different, which means they fail in different ways — and those failure modes are the real knowledge.",
  ],
  creation: [
    // Checklist with ● dots + progress bar header + signal meta
    "Directive received. Current build state:\n\n```block:checklist\n[x] Scope and constraints defined\n[x] Components identified\n[ ] Core structure implementation\n[ ] Interface layer\n[ ] Integration and testing\n[ ] Output validation\n```\n\n```block:signal\nPhase: Build [active]\nBlocking issues: None [ok]\nSteps remaining: 3 [neutral]\n```",
    // Build sequence — stateful steps + table spec
    "Build sequence initialized. Each phase gates the next.\n\n```block:steps\n1. Define the data model and interface contract [done]\n2. Implement core business logic in isolation [active]\n3. Add the interface layer consuming the core\n4. Wire integration points and handle error states\n5. Validate output against the original directive\n```\n\n```block:table\nInput: The directive you provided\nOutput: Functional artifact matching the spec\nKey constraint: Interface must not depend on implementation details\nRisk: Warn\n```",
    // Review — full-width diff rows, one blocker
    "Review complete. One blocker.\n\n```block:status\nok  Core logic is correct and well-isolated\nok  Interface contract is clean\nwarn  Error handling is incomplete — three edge cases unhandled\nerr  Integration layer has a direct dependency on implementation\n```\n\n```block:insight\nFix the integration layer first. The direct dependency will cause cascade failures when the implementation changes.\n```",
    "Output complete.\n\n```block:signal\nArtifact: Generated [ok]\nConformance: High [ok]\nNext: Review and specify refinements [neutral]\n```",
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
