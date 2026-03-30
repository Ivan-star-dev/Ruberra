/**
 * Metamorphic Output Block system.
 *
 * Contract:
 *   Assistant responses may contain zero or more typed blocks using a
 *   lightweight fence syntax:
 *
 *     ```block:<type>
 *     ...content...
 *     ```
 *
 *   Everything outside a fence is treated as a prose block.
 *   The parser is non-destructive — unrecognized fences fall through as prose.
 *
 * Supported block types:
 *   prose      — plain paragraph text (default, implicit)
 *   code       — monospace code with optional language tag
 *   steps      — numbered sequential steps (School chamber)
 *   checklist  — checkbox items (Creation chamber)
 *   insight    — highlighted callout (Lab chamber)
 *   table      — compact key/value rows
 *   status     — named status rows with optional indicator
 */

export type BlockType =
  | "prose"
  | "code"
  | "steps"
  | "checklist"
  | "insight"
  | "table"
  | "status";

export interface ProseBlock   { type: "prose";     text: string }
export interface CodeBlock    { type: "code";      lang: string; text: string }
export interface StepsBlock   { type: "steps";     items: string[] }
export interface ChecklistBlock { type: "checklist"; items: { done: boolean; text: string }[] }
export interface InsightBlock { type: "insight";   text: string }
export interface TableBlock   { type: "table";     rows: { key: string; value: string }[] }
export interface StatusBlock  { type: "status";    rows: { label: string; state: "ok" | "warn" | "err" | "info" }[] }

export type OutputBlock =
  | ProseBlock
  | CodeBlock
  | StepsBlock
  | ChecklistBlock
  | InsightBlock
  | TableBlock
  | StatusBlock;

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
      const items = body
        .split("\n")
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
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

    case "code":
      return [{ type: "code", lang: "text", text: body }];

    case "prose":
    default:
      return body ? [{ type: "prose", text: body }] : [];
  }
}
