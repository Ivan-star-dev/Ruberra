/**
 * Metamorphic Output Block system.
 *
 * Supported block types:
 *   prose      — plain paragraph text (default, implicit)
 *   code       — monospace code with optional language tag
 *   verdict    — prominent conclusion/decision callout (Lab)
 *   insight    — secondary highlighted finding (Lab/School)
 *   steps      — numbered sequential steps (School/Creation) with optional state
 *   checklist  — checkbox task items (Creation)
 *   table      — compact key/value rows
 *   status     — named status rows with state indicator
 *   progress   — labeled progress bars (Lab/Creation)
 *   signal     — compact horizontal signal strip (Lab: confidence, phase, next)
 */

export type BlockType =
  | "prose"
  | "code"
  | "verdict"
  | "insight"
  | "steps"
  | "checklist"
  | "table"
  | "status"
  | "progress"
  | "signal";

export interface ProseBlock     { type: "prose";    text: string }
export interface CodeBlock      { type: "code";     lang: string; text: string }
export interface VerdictBlock   { type: "verdict";  text: string }
export interface InsightBlock   { type: "insight";  text: string }

// Steps item can carry an optional state marker: "done", "active", "blocked", or undefined (pending)
export interface StepItem { text: string; state?: "done" | "active" | "blocked" }
export interface StepsBlock     { type: "steps";    items: StepItem[] }

export interface ChecklistBlock { type: "checklist"; items: { done: boolean; text: string }[] }
export interface TableBlock     { type: "table";    rows: { key: string; value: string }[] }
export interface StatusBlock    { type: "status";   rows: { label: string; state: "ok" | "warn" | "err" | "info" }[] }
export interface ProgressBlock  { type: "progress"; rows: { label: string; value: number }[] }

// Signal strip: compact horizontal key→value metadata row (confidence, phase, etc.)
export interface SignalBlock    { type: "signal";   pairs: { key: string; value: string; tone?: "ok" | "warn" | "err" | "info" | "neutral" }[] }

export type OutputBlock =
  | ProseBlock
  | CodeBlock
  | VerdictBlock
  | InsightBlock
  | StepsBlock
  | ChecklistBlock
  | TableBlock
  | StatusBlock
  | ProgressBlock
  | SignalBlock;

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

const FENCE_OPEN  = /^```block:(\S*)\s*$/;
const CODE_OPEN   = /^```(\w*)$/;
const FENCE_CLOSE = /^```\s*$/;

export function parseBlocks(raw: string): OutputBlock[] {
  if (!raw.trim()) return [];

  const lines = raw.split("\n");
  const blocks: OutputBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Named block fence: ```block:<type>
    const namedMatch = FENCE_OPEN.exec(line);
    if (namedMatch) {
      const typeTag = namedMatch[1].toLowerCase() as BlockType;
      i++;
      const body: string[] = [];
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      const bodyText = body.join("\n").trim();
      blocks.push(...parseTypedBody(typeTag, bodyText));
      continue;
    }

    // Plain code fence: ```lang
    const codeMatch = CODE_OPEN.exec(line);
    if (codeMatch) {
      const lang = codeMatch[1] || "text";
      i++;
      const body: string[] = [];
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", lang, text: body.join("\n") });
      continue;
    }

    // Accumulate prose lines
    const proseLines: string[] = [];
    while (
      i < lines.length &&
      !FENCE_OPEN.test(lines[i]) &&
      !CODE_OPEN.test(lines[i])
    ) {
      proseLines.push(lines[i]);
      i++;
    }
    const prose = proseLines.join("\n").trim();
    if (prose) blocks.push({ type: "prose", text: prose });
  }

  return blocks;
}

function parseTypedBody(type: BlockType, body: string): OutputBlock[] {
  switch (type) {
    case "steps": {
      // Supports optional state suffix: "Step text [done]", "Step text [active]", "Step text [blocked]"
      const items = body
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .map((l) => {
          const stateMatch = /\[(done|active|blocked)\]\s*$/i.exec(l);
          if (stateMatch) {
            return {
              text: l.slice(0, stateMatch.index).trim(),
              state: stateMatch[1].toLowerCase() as "done" | "active" | "blocked",
            };
          }
          return { text: l };
        });
      return [{ type: "steps", items }];
    }

    case "checklist": {
      const items = body.split("\n").filter(Boolean).map((l) => {
        const done = /^\[x\]/i.test(l.trim());
        const text = l.replace(/^\[[ x]\]\s*/i, "").trim();
        return { done, text };
      });
      return [{ type: "checklist", items }];
    }

    case "verdict":
      return [{ type: "verdict", text: body }];

    case "insight":
      return [{ type: "insight", text: body }];

    case "table": {
      const rows = body.split("\n").filter(Boolean).map((l) => {
        const sep = l.indexOf(":");
        if (sep === -1) return { key: l.trim(), value: "" };
        return { key: l.slice(0, sep).trim(), value: l.slice(sep + 1).trim() };
      });
      return [{ type: "table", rows }];
    }

    case "status": {
      const rows = body.split("\n").filter(Boolean).map((l) => {
        const match = /^(ok|warn|err|info)\s+(.+)$/i.exec(l.trim());
        if (match) {
          return {
            state: match[1].toLowerCase() as "ok" | "warn" | "err" | "info",
            label: match[2].trim(),
          };
        }
        return { state: "info" as const, label: l.trim() };
      });
      return [{ type: "status", rows }];
    }

    case "progress": {
      const rows = body.split("\n").filter(Boolean).map((l) => {
        const sep = l.lastIndexOf(":");
        if (sep === -1) return { label: l.trim(), value: 0 };
        const raw = l.slice(sep + 1).trim();
        const value = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));
        return { label: l.slice(0, sep).trim(), value };
      });
      return [{ type: "progress", rows }];
    }

    case "signal": {
      // Format: "Key: value [tone]" — tone is optional: ok|warn|err|info|neutral
      const pairs = body.split("\n").filter(Boolean).map((l) => {
        const toneMatch = /\[(ok|warn|err|info|neutral)\]\s*$/i.exec(l);
        const tone = toneMatch
          ? (toneMatch[1].toLowerCase() as "ok" | "warn" | "err" | "info" | "neutral")
          : undefined;
        const clean = toneMatch ? l.slice(0, toneMatch.index).trim() : l.trim();
        const sep = clean.indexOf(":");
        if (sep === -1) return { key: clean, value: "", tone };
        return { key: clean.slice(0, sep).trim(), value: clean.slice(sep + 1).trim(), tone };
      });
      return [{ type: "signal", pairs }];
    }

    case "code":
      return [{ type: "code", lang: "text", text: body }];

    case "prose":
    default:
      return body ? [{ type: "prose", text: body }] : [];
  }
}
