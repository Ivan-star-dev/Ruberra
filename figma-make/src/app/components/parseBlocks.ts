/**
 * RUBERRA parseBlocks — structured AI response parser
 * Parses TYPE:verdict / TYPE:lesson / TYPE:execution / TYPE:creation / TYPE:report / TYPE:signal
 */

import { type BlockType, type StatusFlag, type BlockItem, type BlockSection, type MessageBlock } from "./shell-types";

const VALID_TYPES  = new Set<string>(["verdict","execution","lesson","creation","report","signal"]);
const VALID_STATUS = new Set<string>(["pass","partial","fail","live","done","warn","skip","running","pending","locked","current"]);

function toBlockType(s: string): BlockType | undefined { const v = s.trim().toLowerCase(); return VALID_TYPES.has(v) ? (v as BlockType) : undefined; }
function toStatusFlag(s: string): StatusFlag | undefined { const v = s.trim().toLowerCase(); return VALID_STATUS.has(v) ? (v as StatusFlag) : undefined; }
function parseItem(raw: string): BlockItem {
  const parts = raw.split("|").map(p => p.trim());
  const label = parts[0] ?? "";
  const value = parts[1] ?? undefined;
  const status = parts[2] ? toStatusFlag(parts[2]) : undefined;
  return { label, ...(value !== undefined ? { value } : {}), ...(status ? { status } : {}) };
}

export function parseBlocks(content: string): MessageBlock[] {
  if (!content.includes("TYPE:")) return [];
  const lines = content.split("\n");
  const blocks: MessageBlock[] = [];
  let current: MessageBlock | null = null;
  let currentSection: BlockSection | null = null;

  function flushSection() { if (current && currentSection) { current.sections.push(currentSection); currentSection = null; } }
  function flushBlock() { flushSection(); if (current) { blocks.push(current); current = null; } }

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("TYPE:"))    { flushBlock(); const type = toBlockType(t.slice(5)); if (type) current = { type, sections: [] }; continue; }
    if (!current) continue;
    if (t.startsWith("TITLE:"))   { current.title = t.slice(6).trim(); continue; }
    if (t.startsWith("STATUS:"))  { const s = toStatusFlag(t.slice(7)); if (s) current.status = s; continue; }
    if (t.startsWith("SECTION:")) { flushSection(); currentSection = { heading: t.slice(8).trim(), items: [] }; continue; }
    if (t.startsWith("NEXT:"))    { current.meta = { ...current.meta, next: t.slice(5).trim() }; continue; }
    if (t.startsWith("TAGS:"))    { current.meta = { ...current.meta, tags: t.slice(5).split(",").map(x => x.trim()).filter(Boolean) }; continue; }
    if (t.startsWith("PROGRESS:")){ current.meta = { ...current.meta, progress: t.slice(9).trim() }; continue; }
    if (t.startsWith("- ")) {
      const item = parseItem(t.slice(2));
      if (currentSection) currentSection.items.push(item);
      else currentSection = { heading: "", items: [item] };
      continue;
    }
  }
  flushBlock();
  return blocks;
}
