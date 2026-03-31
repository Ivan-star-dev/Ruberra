/**
 * RUBERRA BlockRenderer — Metamorphosis Edition
 * Turns AI structured output into materialized visual surfaces.
 * Mineral white / structured / semantic / zero noise.
 */

import { useState } from "react";
import { type MessageBlock, type StatusFlag, type BlockType } from "./shell-types";

// ─── Status system ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR: Partial<Record<StatusFlag, string>> = {
  pass:     "var(--r-ok)",
  done:     "var(--r-ok)",
  live:     "var(--r-ok)",
  verified: "var(--r-ok)",
  active:   "var(--r-ok)",
  warn:     "var(--r-warn)",
  partial:  "var(--r-warn)",
  draft:    "var(--r-warn)",
  review:   "var(--r-warn)",
  current:  "var(--r-accent)",
  running:  "var(--r-accent)",
  fail:     "var(--r-err)",
  error:    "var(--r-err)",
  blocked:  "var(--r-err)",
  pending:  "var(--r-subtext)",
  locked:   "var(--r-dim)",
  skip:     "var(--r-dim)",
};

const STATUS_ICON: Partial<Record<StatusFlag, string>> = {
  pass: "✓", done: "✓", verified: "✓", live: "●", active: "●",
  current: "→", running: "◎",
  warn: "◐", partial: "◐", draft: "◐", review: "◐",
  fail: "✗", error: "✗", blocked: "✗",
  pending: "○", locked: "⌥", skip: "–",
};

function getStatusColor(s?: StatusFlag): string {
  return s ? (STATUS_COLOR[s] ?? "var(--r-dim)") : "var(--r-dim)";
}

function StatusDot({ status }: { status?: StatusFlag }) {
  const c = getStatusColor(status);
  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: status && ["pass","done","live","verified","active"].includes(status) ? c : "transparent",
        border: `1.5px solid ${c}`,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function StatusChip({ status }: { status: StatusFlag }) {
  const color = getStatusColor(status);
  const icon  = STATUS_ICON[status] ?? "·";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "1px 6px",
        borderRadius: "2px",
        border: `1px solid ${color}33`,
        background: `${color}12`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "9px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "8px" }}>{icon}</span>
      {status}
    </span>
  );
}

// ─── Block type → visual identity ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  verdict:   { label: "VERDICT",   color: "var(--r-accent)", icon: "⊞" },
  report:    { label: "REPORT",    color: "var(--r-accent)", icon: "≡" },
  execution: { label: "EXECUTION", color: "var(--r-warn)",   icon: "▸" },
  lesson:    { label: "LESSON",    color: "var(--r-ok)",     icon: "◈" },
  creation:  { label: "CREATION",  color: "var(--r-ok)",     icon: "◇" },
  signal:    { label: "SIGNAL",    color: "var(--r-subtext)",icon: "◉" },
  audit:     { label: "AUDIT",     color: "var(--r-warn)",   icon: "◻" },
  matrix:    { label: "MATRIX",    color: "var(--r-accent)", icon: "⊠" },
  tree:      { label: "TREE",      color: "var(--r-ok)",     icon: "⊢" },
  timeline:  { label: "TIMELINE",  color: "var(--r-subtext)",icon: "⊸" },
  evidence:  { label: "EVIDENCE",  color: "var(--r-ok)",     icon: "⊙" },
  dossier:   { label: "DOSSIER",   color: "var(--r-accent)", icon: "⊟" },
  blueprint: { label: "BLUEPRINT", color: "var(--r-warn)",   icon: "⊕" },
};

function BlockHeader({ block }: { block: MessageBlock }) {
  const cfg = TYPE_CONFIG[block.type] ?? { label: block.type.toUpperCase(), color: "var(--r-subtext)", icon: "·" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid var(--r-border-soft)", background: "var(--r-elevated)", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
        <span style={{ color: cfg.color, fontSize: "10px", lineHeight: 1, flexShrink: 0 }}>{cfg.icon}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
        {block.title && (
          <>
            <span style={{ color: "var(--r-border)", fontSize: "10px", flexShrink: 0 }}>│</span>
            <span style={{ fontSize: "11.5px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {block.title}
            </span>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {block.meta?.progress && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--r-subtext)", letterSpacing: "0.05em" }}>{block.meta.progress}</span>
        )}
        {block.status && <StatusChip status={block.status} />}
      </div>
    </div>
  );
}

function ProgressBarInline({ status }: { status?: StatusFlag }) {
  if (!status) return null;
  const pct =
    status === "done"    ? 100 :
    status === "current" || status === "running" ? 55 :
    status === "partial" || status === "review"  ? 40 :
    status === "pending" ? 15 :
    status === "locked"  ? 0  : null;
  if (pct === null) return null;
  const color = getStatusColor(status);
  return (
    <div style={{ width: "48px", height: "3px", background: "var(--r-border)", borderRadius: "1.5px", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "1.5px", transition: "width 0.6s ease" }} />
    </div>
  );
}

function ItemRow({ item, isLast, showBar }: { item: { label: string; value?: string; status?: StatusFlag }; isLast: boolean; showBar?: boolean; }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: isLast ? "none" : "1px solid var(--r-border-soft)", minHeight: "28px" }}>
      <StatusDot status={item.status} />
      <span style={{ fontSize: "12px", color: item.status === "locked" ? "var(--r-dim)" : "var(--r-text)", flex: 1, fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.45", letterSpacing: "-0.005em" }}>
        {item.label}
      </span>
      {item.value && (
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--r-subtext)", flexShrink: 0, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.value}
        </span>
      )}
      {showBar && <ProgressBarInline status={item.status} />}
      {item.status && <StatusChip status={item.status} />}
    </div>
  );
}

function SectionDefault({ section, showBars }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; showBars?: boolean; }) {
  return (
    <div style={{ padding: "8px 14px 4px" }}>
      {section.heading && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", marginBottom: "4px" }}>{section.heading}</p>
      )}
      {section.items.map((item, i) => (
        <ItemRow key={i} item={item} isLast={i === section.items.length - 1} showBar={showBars} />
      ))}
    </div>
  );
}

function SectionExecution({ section }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; }) {
  return (
    <div style={{ padding: "8px 14px 4px" }}>
      {section.heading && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", marginBottom: "6px" }}>{section.heading}</p>
      )}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "8px", top: "10px", bottom: "10px", width: "1px", background: "var(--r-border-soft)" }} />
        {section.items.map((item, i) => {
          const color = getStatusColor(item.status);
          return (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "4px 0", position: "relative" }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: ["pass","done","live","active"].includes(item.status ?? "") ? color : "var(--r-surface)", border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", color: ["pass","done","live","active"].includes(item.status ?? "") ? "white" : color, flexShrink: 0, marginTop: "2px", zIndex: 1 }}>
                {["pass","done"].includes(item.status ?? "") ? "✓" : ""}
              </span>
              <div style={{ flex: 1, paddingBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: item.status === "current" || item.status === "running" ? 500 : 400, color: item.status === "locked" ? "var(--r-dim)" : "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", flex: 1 }}>{item.label}</span>
                  {item.status && <StatusChip status={item.status} />}
                </div>
                {item.value && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--r-subtext)", display: "block", marginTop: "2px" }}>{item.value}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionAudit({ section }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; }) {
  const passes = section.items.filter(i => i.status === "pass" || i.status === "done").length;
  const fails  = section.items.filter(i => i.status === "fail" || i.status === "error" || i.status === "blocked").length;
  const warns  = section.items.filter(i => i.status === "warn" || i.status === "partial").length;
  return (
    <div style={{ padding: "8px 14px 4px" }}>
      {section.heading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", margin: 0 }}>{section.heading}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {passes > 0 && <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-ok)" }}>{passes} pass</span>}
            {warns  > 0 && <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-warn)" }}>{warns} warn</span>}
            {fails  > 0 && <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-err)" }}>{fails} fail</span>}
          </div>
        </div>
      )}
      {section.items.map((item, i) => {
        const color = getStatusColor(item.status);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 8px", marginBottom: "3px", borderRadius: "3px", background: item.status === "fail" || item.status === "error" ? `${color}09` : item.status === "warn" ? `${color}08` : item.status === "pass" || item.status === "done" ? `${color}07` : "transparent", borderLeft: `2px solid ${color}44` }}>
            <span style={{ color, fontFamily: "monospace", fontSize: "11px", flexShrink: 0 }}>{STATUS_ICON[item.status ?? "pending"] ?? "·"}</span>
            <span style={{ fontSize: "12px", color: "var(--r-text)", flex: 1, fontFamily: "'Inter', system-ui, sans-serif" }}>{item.label}</span>
            {item.value && <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "monospace", flexShrink: 0 }}>{item.value}</span>}
            {item.status && <StatusChip status={item.status} />}
          </div>
        );
      })}
    </div>
  );
}

function SectionMatrix({ section }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; }) {
  return (
    <div style={{ padding: "8px 0 4px" }}>
      {section.heading && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", margin: "0 14px 6px" }}>{section.heading}</p>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
          <tbody>
            {section.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: i < section.items.length - 1 ? "1px solid var(--r-border-soft)" : "none" }}>
                <td style={{ padding: "5px 14px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", width: "38%", verticalAlign: "top" }}>{item.label}</td>
                <td style={{ padding: "5px 8px", color: "var(--r-subtext)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", verticalAlign: "top" }}>{item.value ?? "—"}</td>
                <td style={{ padding: "5px 14px 5px 0", textAlign: "right", verticalAlign: "top", width: "80px" }}>{item.status && <StatusChip status={item.status} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionTimeline({ section }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; }) {
  return (
    <div style={{ padding: "8px 14px 4px" }}>
      {section.heading && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", marginBottom: "8px" }}>{section.heading}</p>
      )}
      {section.items.map((item, i) => {
        const color = getStatusColor(item.status);
        const isLast = i === section.items.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: "12px", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: ["done","pass","live"].includes(item.status ?? "") ? color : "var(--r-surface)", border: `2px solid ${color}`, flexShrink: 0, marginTop: "3px" }} />
              {!isLast && <div style={{ width: "1px", flex: 1, background: "var(--r-border-soft)", marginTop: "3px", minHeight: "20px" }} />}
            </div>
            <div style={{ paddingBottom: isLast ? "4px" : "12px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", fontWeight: item.status === "current" || item.status === "running" ? 500 : 400 }}>{item.label}</span>
                {item.status && <StatusChip status={item.status} />}
              </div>
              {item.value && <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "'JetBrains Mono', monospace", display: "block", marginTop: "2px" }}>{item.value}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionEvidence({ section }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; }) {
  return (
    <div style={{ padding: "8px 14px 4px" }}>
      {section.heading && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-subtext)", marginBottom: "6px" }}>{section.heading}</p>
      )}
      {section.items.map((item, i) => {
        const color = getStatusColor(item.status);
        return (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "6px 0", borderBottom: i < section.items.length - 1 ? "1px solid var(--r-border-soft)" : "none", alignItems: "flex-start" }}>
            <div style={{ width: "2px", alignSelf: "stretch", borderRadius: "1px", background: color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5, display: "block" }}>{item.label}</span>
              {item.value && <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "'JetBrains Mono', monospace", display: "block", marginTop: "2px" }}>{item.value}</span>}
            </div>
            {item.status && <StatusChip status={item.status} />}
          </div>
        );
      })}
    </div>
  );
}

function BlockSection({ section, blockType }: { section: { heading: string; items: { label: string; value?: string; status?: StatusFlag }[] }; blockType: BlockType; }) {
  switch (blockType) {
    case "execution": return <SectionExecution section={section} />;
    case "audit":     return <SectionAudit section={section} />;
    case "matrix":    return <SectionMatrix section={section} />;
    case "timeline":  return <SectionTimeline section={section} />;
    case "evidence":  return <SectionEvidence section={section} />;
    case "lesson":    return <SectionDefault section={section} showBars />;
    default:          return <SectionDefault section={section} />;
  }
}

function BlockFooter({ block }: { block: MessageBlock }) {
  if (!block.meta?.next && !block.meta?.tags?.length) return null;
  return (
    <div style={{ padding: "7px 14px", borderTop: "1px solid var(--r-border-soft)", background: "var(--r-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
      {block.meta?.next && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.10em", color: "var(--r-dim)", textTransform: "uppercase", flexShrink: 0 }}>NEXT</span>
          <span style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.4 }}>{block.meta.next}</span>
        </div>
      )}
      {block.meta?.tags?.length ? (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", flexShrink: 0 }}>
          {block.meta.tags.map((tag) => (
            <span key={tag} style={{ padding: "1px 6px", borderRadius: "2px", border: "1px solid var(--r-border)", fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.06em", color: "var(--r-dim)" }}>{tag}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SingleBlock({ block }: { block: MessageBlock }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ border: "1px solid var(--r-border)", borderRadius: "4px", overflow: "hidden", background: "var(--r-surface)" }}>
      <div role="button" tabIndex={0} onClick={() => block.sections.length > 0 && setCollapsed(c => !c)} style={{ cursor: block.sections.length > 0 ? "pointer" : "default" }} onKeyDown={e => { if (e.key === "Enter") setCollapsed(c => !c); }}>
        <BlockHeader block={block} />
      </div>
      {!collapsed && block.sections.map((section, j) => (
        <div key={j} style={{ borderBottom: j < block.sections.length - 1 ? "1px solid var(--r-border-soft)" : "none" }}>
          <BlockSection section={section} blockType={block.type as BlockType} />
        </div>
      ))}
      <BlockFooter block={block} />
    </div>
  );
}

// ─── Inline markdown renderer ───────────────────────────────────────────────────────────────────

function RenderInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{ fontWeight: 600, color: "var(--r-text)" }}>{part.slice(2, -2)}</strong>;
        if (/^`[^`]+`$/.test(part)) return <code key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11.5px", background: "var(--r-elevated)", border: "1px solid var(--r-border-soft)", padding: "0 4px", borderRadius: "3px", color: "var(--r-accent-soft)" }}>{part.slice(1, -1)}</code>;
        if (/^\*[^*]+\*$/.test(part)) return <em key={i} style={{ fontStyle: "italic", color: "var(--r-subtext)" }}>{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function InlineMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: "8px" }} />;
        if (/^#{1,3}\s/.test(trimmed)) {
          const text = trimmed.replace(/^#+\s/, "");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 4px" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--r-subtext)" }}>{text}</span>
              <div style={{ flex: 1, height: "1px", background: "var(--r-border-soft)" }} />
            </div>
          );
        }
        if (/^\[x\]\s/i.test(trimmed)) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "2px 0" }}>
              <span style={{ color: "var(--r-ok)", fontSize: "10px", fontFamily: "monospace", flexShrink: 0, marginTop: "3px" }}>✓</span>
              <span style={{ fontSize: "13px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.6", textDecoration: "line-through" }}>{trimmed.replace(/^\[x\]\s/i, "")}</span>
            </div>
          );
        }
        if (/^\[ \]\s/.test(trimmed)) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "2px 0" }}>
              <span style={{ color: "var(--r-dim)", fontSize: "10px", fontFamily: "monospace", flexShrink: 0, marginTop: "3px" }}>○</span>
              <span style={{ fontSize: "13px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.6" }}>{trimmed.replace(/^\[ \]\s/, "")}</span>
            </div>
          );
        }
        if (/^[-*•]\s/.test(trimmed)) {
          const text = trimmed.replace(/^[-*•]\s/, "");
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "2px 0" }}>
              <span style={{ color: "var(--r-dim)", fontSize: "9px", fontFamily: "monospace", flexShrink: 0, marginTop: "5px" }}>–</span>
              <span style={{ fontSize: "13px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.6" }}><RenderInline text={text} /></span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const num  = trimmed.match(/^(\d+)/)?.[1];
          const text = trimmed.replace(/^\d+\.\s/, "");
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "2px 0" }}>
              <span style={{ color: "var(--r-subtext)", fontSize: "10px", fontFamily: "monospace", flexShrink: 0, marginTop: "3px", minWidth: "16px" }}>{num}.</span>
              <span style={{ fontSize: "13px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.6" }}><RenderInline text={text} /></span>
            </div>
          );
        }
        return (
          <p key={i} style={{ fontSize: "13.5px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: "1.72", margin: "2px 0" }}>
            <RenderInline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

// ─── Main renderer ─────────────────────────────────────────────────────────────────────────────────

export function BlockRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {blocks.map((block, i) => (
        <SingleBlock key={i} block={block} />
      ))}
    </div>
  );
}
