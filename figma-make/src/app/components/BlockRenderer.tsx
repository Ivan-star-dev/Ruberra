/**
 * RUBERRA BlockRenderer
 * Renders structured MessageBlock responses. Mineral white, no neon.
 */

import { type MessageBlock, type StatusFlag } from "./shell-types";

const STATUS_COLOR: Record<StatusFlag, string> = {
  pass: "var(--r-ok)", done: "var(--r-ok)", live: "var(--r-ok)",
  warn: "var(--r-warn)", partial: "var(--r-warn)",
  current: "var(--r-accent)", running: "var(--r-accent)",
  fail: "var(--r-err)", error: "var(--r-err)",
  pending: "var(--r-subtext)", locked: "var(--r-dim)", skip: "var(--r-dim)",
} as Record<StatusFlag, string>;

function StatusChip({ status }: { status: StatusFlag }) {
  const color = STATUS_COLOR[status] ?? "var(--r-dim)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "1px 6px", borderRadius: "2px", border: `1px solid ${color}44`, background: `color-mix(in srgb, ${color} 10%, transparent)`, fontFamily: "monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color, flexShrink: 0 }}>
      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      {status}
    </span>
  );
}

export function BlockRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {blocks.map((block, i) => {
        const typeLabel = block.type.toUpperCase();
        const typeColor = block.type === "verdict" || block.type === "report" ? "var(--r-accent)" : block.type === "lesson" || block.type === "creation" ? "var(--r-ok)" : block.type === "execution" ? "var(--r-warn)" : "var(--r-subtext)";
        return (
          <div key={i} style={{ border: "1px solid var(--r-border)", borderRadius: "2px", overflow: "hidden", background: "var(--r-surface)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--r-border-soft)", background: "var(--r-elevated)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", color: typeColor }}>{typeLabel}</span>
                {block.title && <><span style={{ color: "var(--r-dim)", fontSize: "9px" }}>·</span><span style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "Inter, sans-serif" }}>{block.title}</span></>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {block.meta?.progress && <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-subtext)" }}>{block.meta.progress}</span>}
                {block.status && <StatusChip status={block.status} />}
              </div>
            </div>
            {/* Sections */}
            {block.sections.map((section, j) => (
              <div key={j} style={{ padding: "8px 12px 4px" }}>
                {section.heading && <p style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--r-subtext)", marginBottom: "6px" }}>{section.heading}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {section.items.map((item, k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "3px 0", borderBottom: k < section.items.length - 1 ? "1px solid var(--r-border-soft)" : "none" }}>
                      <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--r-dim)", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--r-text)", flex: 1, fontFamily: "Inter, sans-serif" }}>{item.label}</span>
                      {item.value && <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--r-subtext)", flexShrink: 0 }}>{item.value}</span>}
                      {item.status && <StatusChip status={item.status} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Footer */}
            {(block.meta?.next || block.meta?.tags?.length) && (
              <div style={{ padding: "6px 12px", borderTop: "1px solid var(--r-border-soft)", background: "var(--r-elevated)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {block.meta?.next && <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-subtext)" }}><span style={{ color: "var(--r-dim)", marginRight: "4px" }}>NEXT</span>{block.meta.next}</span>}
                {block.meta?.tags?.map(tag => <span key={tag} style={{ padding: "1px 6px", borderRadius: "2px", border: "1px solid var(--r-border)", fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)" }}>{tag}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
