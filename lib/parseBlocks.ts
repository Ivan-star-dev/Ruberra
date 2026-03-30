import {
  type BlockType,
  type StatusFlag,
  type BlockItem,
  type BlockSection,
  type MessageBlock,
} from "@/components/shell/types";

const VALID_TYPES = new Set<string>(["verdict", "execution", "lesson", "creation", "report"]);

const VALID_STATUSES = new Set<string>([
  "pass", "partial", "fail", "live", "done", "warn",
  "skip", "running", "pending", "locked", "current",
]);

function toBlockType(s: string): BlockType | undefined {
  const v = s.trim().toLowerCase();
  return VALID_TYPES.has(v) ? (v as BlockType) : undefined;
}

function toStatusFlag(s: string): StatusFlag | undefined {
  const v = s.trim().toLowerCase();
  return VALID_STATUSES.has(v) ? (v as StatusFlag) : undefined;
}

function parseItem(raw: string): BlockItem {
  const parts = raw.split("|").map((p) => p.trim());
  const label  = parts[0] ?? "";
  const value  = parts[1] ?? undefined;
  const status = parts[2] ? toStatusFlag(parts[2]) : undefined;
  return { label, ...(value !== undefined ? { value } : {}), ...(status ? { status } : {}) };
}

export function parseBlocks(content: string): MessageBlock[] {
  // Fast-path: only run if a TYPE: directive is present
  if (!content.includes("TYPE:")) return [];

  const lines  = content.split("\n");
  const blocks: MessageBlock[] = [];

  let current: MessageBlock | null = null;
  let currentSection: BlockSection | null = null;

  function flushSection() {
    if (current && currentSection) {
      current.sections.push(currentSection);
      currentSection = null;
    }
  }

  function flushBlock() {
    flushSection();
    if (current) {
      blocks.push(current);
      current = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("TYPE:")) {
      flushBlock();
      const type = toBlockType(trimmed.slice(5));
      if (type) {
        current = { type, sections: [] };
      }
      continue;
    }

    if (!current) continue;

    if (trimmed.startsWith("TITLE:")) {
      current.title = trimmed.slice(6).trim();
      continue;
    }

    if (trimmed.startsWith("STATUS:")) {
      const s = toStatusFlag(trimmed.slice(7));
      if (s) current.status = s;
      continue;
    }

    if (trimmed.startsWith("SECTION:")) {
      flushSection();
      currentSection = { heading: trimmed.slice(8).trim(), items: [] };
      continue;
    }

    if (trimmed.startsWith("NEXT:")) {
      current.meta = { ...current.meta, next: trimmed.slice(5).trim() };
      continue;
    }

    if (trimmed.startsWith("TAGS:")) {
      const tags = trimmed
        .slice(5)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      current.meta = { ...current.meta, tags };
      continue;
    }

    if (trimmed.startsWith("PROGRESS:")) {
      current.meta = { ...current.meta, progress: trimmed.slice(9).trim() };
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const item = parseItem(trimmed.slice(2));
      if (currentSection) {
        currentSection.items.push(item);
      } else {
        // Implicitly open a section for items without a heading
        currentSection = { heading: "", items: [item] };
      }
      continue;
    }
  }

  flushBlock();
  return blocks;
}
