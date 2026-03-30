"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  parseBlocks,
  type OutputBlock,
  type VerdictBlock,
  type StepsBlock,
  type ChecklistBlock,
  type CodeBlock,
  type InsightBlock,
  type TableBlock,
  type StatusBlock,
  type ProgressBlock,
  type SignalBlock,
} from "./outputBlocks";

interface RenderedOutputProps {
  content: string;
  streaming?: boolean;
  tab?: string;
}

// ---------------------------------------------------------------------------
// Semantic color system
// ---------------------------------------------------------------------------
const C = {
  ok:      { dot: "#3d9b6e", text: "#2d7a56", bg: "rgba(0,80,0,0.10)",       stripe: "rgba(0,100,0,0.22)",    rowBg: "rgba(0,60,0,0.07)"   },
  warn:    { dot: "#ca8a04", text: "#92620a", bg: "rgba(202,138,4,0.08)",     stripe: "rgba(180,120,0,0.35)",  rowBg: "rgba(180,120,0,0.05)" },
  err:     { dot: "#dc2626", text: "#b91c1c", bg: "rgba(139,0,0,0.10)",       stripe: "rgba(180,0,0,0.40)",    rowBg: "rgba(139,0,0,0.07)"  },
  info:    { dot: "#8a8780", text: "#6b6966", bg: "transparent",              stripe: "rgba(138,135,128,0.25)", rowBg: "transparent"         },
  neutral: { dot: "#b8b5ae", text: "#8a8780", bg: "transparent",              stripe: "#d6d4cf",               rowBg: "transparent"         },
  active:  { dot: "#5b52e8", text: "#4a42cc", bg: "rgba(91,82,232,0.07)",     stripe: "rgba(91,82,232,0.30)",  rowBg: "rgba(91,82,232,0.04)" },
};

// Creation accent — green pulse, the build color
const CR = {
  accent:  "#3d9b6e",
  accent2: "#2d7a56",
  done:    "#3d9b6e",
  active:  "#5b52e8",
  pending: "#b8b5ae",
  bg:      "#f8faf9",
  border:  "#d4e8dd",
  rowAlt:  "#f2f7f4",
};

const INLINE = {
  type:  "#0e7490",
  amber: "#92620a",
  green: "#2d7a56",
  red:   "#b91c1c",
  muted: "#8a8780",
};

// ---------------------------------------------------------------------------
// Markdown paragraph — handles loose list wrapping in react-markdown v10
// ---------------------------------------------------------------------------
function MDParagraph({ children, node }: { children?: React.ReactNode; node?: { tagName?: string } }) {
  if (node?.tagName === "li") {
    return <span className="text-[13.5px] leading-[1.65] text-ruberra-text">{children}</span>;
  }
  return <p className="text-[13.5px] leading-[1.65] text-ruberra-text mb-2 last:mb-0">{children}</p>;
}

// Creation-specific paragraph: tighter, more editorial
function MDParagraphCreation({ children, node }: { children?: React.ReactNode; node?: { tagName?: string } }) {
  if (node?.tagName === "li") {
    return <span className="text-[13px] leading-[1.6] text-ruberra-text">{children}</span>;
  }
  return <p className="text-[13px] leading-[1.6] text-ruberra-text mb-1.5 last:mb-0">{children}</p>;
}

// ---------------------------------------------------------------------------
// ProseRenderer
// ---------------------------------------------------------------------------
function ProseRenderer({ text, isCreation = false }: { text: string; isCreation?: boolean }) {
  const Para = isCreation ? MDParagraphCreation : MDParagraph;
  const liClass = isCreation
    ? "text-[13px] leading-[1.6] text-ruberra-text"
    : "text-[13.5px] leading-[1.65] text-ruberra-text";
  const codeInlineStyle = isCreation
    ? { background: "#f0f7f3", border: "1px solid #d4e8dd", color: CR.accent2 }
    : { background: "#ebe9e5", border: "1px solid #d6d4cf", color: INLINE.type };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p:          Para,
        strong:     ({ children }) => <strong className="font-semibold text-ruberra-text">{children}</strong>,
        em:         ({ children }) => <em className="italic text-ruberra-subtext">{children}</em>,
        ul:         ({ children }) => <ul className="my-1.5 space-y-0.5 pl-4 list-disc marker:text-ruberra-muted">{children}</ul>,
        ol:         ({ children }) => <ol className="my-1.5 space-y-0.5 pl-4 list-decimal marker:text-ruberra-muted">{children}</ol>,
        li:         ({ children }) => <li className={liClass}>{children}</li>,
        hr:         () => <hr className="my-3 border-ruberra-border" />,
        h1:         ({ children }) => <h1 className="text-[15px] font-semibold text-ruberra-text mt-3 mb-1.5 tracking-tight">{children}</h1>,
        h2:         ({ children }) => <h2 className="text-[14px] font-semibold text-ruberra-text mt-3 mb-1 tracking-tight">{children}</h2>,
        h3:         ({ children }) => <h3 className="text-[13px] font-medium text-ruberra-text mt-2 mb-1">{children}</h3>,
        blockquote: ({ children }) => <blockquote className="pl-3 my-2 text-ruberra-subtext text-[13px] leading-relaxed" style={{ borderLeft: "2px solid #d6d4cf" }}>{children}</blockquote>,
        a:          ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-75 transition-opacity" style={{ color: isCreation ? CR.accent : "#5b52e8" }}>{children}</a>,
        pre:        ({ children }) => <pre className="rounded px-4 py-3 overflow-x-auto my-2 font-mono" style={{ background: "#1a1916", border: "1px solid #2e2c29" }}>{children}</pre>,
        code:       ({ children, className }) => {
          if (!className) {
            return <code className="font-mono text-[11.5px] px-1.5 py-0.5 rounded align-baseline" style={codeInlineStyle}>{children}</code>;
          }
          return <code className="font-mono text-[12px] leading-relaxed" style={{ color: "#e2e0dc" }}>{children}</code>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

// ---------------------------------------------------------------------------
// VERDICT — dark terminal surface (same for all chambers)
// ---------------------------------------------------------------------------
function VerdictRenderer({ block }: { block: VerdictBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ background: "#1a1916", border: "1px solid #2e2c29" }}>
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderBottom: "1px solid #2e2c29" }}>
        <span className="text-[11px] font-mono" style={{ color: C.ok.dot }}>●</span>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: "#8a8780" }}>
          Verdict
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-[1.6] font-medium tracking-tight" style={{ color: "#e2e0dc" }}>
          {block.text}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INSIGHT — accent callout (same for all chambers)
// ---------------------------------------------------------------------------
function InsightRenderer({ block }: { block: InsightBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ background: C.active.bg, border: `1px solid ${C.active.stripe}` }}>
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderBottom: `1px solid ${C.active.stripe}` }}>
        <span className="text-[11px] font-mono" style={{ color: C.active.dot }}>●</span>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: C.active.text }}>
          Insight
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-[1.65] text-ruberra-text">{block.text}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CODE — dark terminal (same for all chambers)
// ---------------------------------------------------------------------------
function CodeRenderer({ block }: { block: CodeBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ background: "#1a1916", border: "1px solid #2e2c29" }}>
      <div className="flex items-center gap-2 px-3.5 py-1.5" style={{ borderBottom: "1px solid #2e2c29", background: "#141311" }}>
        <span className="flex gap-1 mr-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "#3a3835" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#3a3835" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#3a3835" }} />
        </span>
        {block.lang && block.lang !== "text" && (
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: INLINE.muted }}>
            {block.lang}
          </span>
        )}
      </div>
      <pre className="px-4 py-3.5 overflow-x-auto">
        <code className="text-[12px] font-mono leading-[1.75]" style={{ color: "#e2e0dc" }}>
          {block.text}
        </code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEPS — base version (Lab/School)
// ---------------------------------------------------------------------------
function StepsRenderer({ block }: { block: StepsBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
          Steps
        </span>
        <span className="text-[9px] font-mono text-ruberra-muted/40 ml-auto tabular-nums">{block.items.length}</span>
      </div>
      <div className="px-4 py-2.5 space-y-0">
        {block.items.map((item, i) => {
          const isLast = i === block.items.length - 1;
          const s = item.state;
          const dotColor = s === "done" ? C.ok.dot : s === "active" ? C.active.dot : s === "blocked" ? C.err.dot : "#d6d4cf";
          const textClass = s === "done" ? "line-through" : s === "blocked" ? "opacity-50" : "";
          const textColor = s === "done" ? INLINE.green : s === "blocked" ? INLINE.red : "inherit";
          const stateLabel =
            s === "active"  ? <span className="font-mono text-[10px]" style={{ color: INLINE.amber }}>(active)</span> :
            s === "blocked" ? <span className="font-mono text-[10px]" style={{ color: INLINE.red }}>(blocked)</span> :
            null;
          return (
            <div key={i} className="py-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] shrink-0 select-none" style={{ color: dotColor }}>●</span>
                <span className={`text-[13px] leading-[1.6] text-ruberra-text flex-1 ${textClass}`} style={{ color: textColor !== "inherit" ? textColor : undefined }}>{item.text}</span>
                {stateLabel && <span className="shrink-0">{stateLabel}</span>}
              </div>
              {!isLast && (
                <div className="flex items-stretch gap-2 mt-0 min-h-[10px]">
                  <span className="font-mono text-[11px] shrink-0 select-none self-stretch flex items-start pt-0" style={{ color: "#d6d4cf", lineHeight: "10px" }}>└</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// STEPS — Creation variant: numbered phase pills, clean build-rail feel
function StepsCreationRenderer({ block }: { block: StepsBlock }) {
  const totalDone = block.items.filter((i) => i.state === "done").length;
  const totalActive = block.items.filter((i) => i.state === "active").length;
  const allDone = totalDone === block.items.length;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${CR.border}`, background: CR.bg }}>
      {/* Phase header */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: `1px solid ${CR.border}`, background: "#f0f7f3" }}
      >
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: CR.accent2 }}>
          Build phases
        </span>
        <div className="ml-auto flex items-center gap-2">
          {totalDone > 0 && (
            <span className="font-mono text-[9.5px]" style={{ color: CR.done }}>{totalDone} done</span>
          )}
          {totalActive > 0 && (
            <span className="font-mono text-[9.5px]" style={{ color: CR.active }}>{totalActive} active</span>
          )}
          {allDone && (
            <span className="font-mono text-[9.5px] font-semibold" style={{ color: CR.done }}>✓ complete</span>
          )}
        </div>
      </div>

      {/* Phase list */}
      <div className="divide-y" style={{ borderColor: CR.border }}>
        {block.items.map((item, i) => {
          const s = item.state ?? "pending";
          const isDone    = s === "done";
          const isActive  = s === "active";
          const isBlocked = s === "blocked";

          const numBg =
            isDone    ? CR.done :
            isActive  ? CR.active :
            isBlocked ? C.err.dot :
            "#d6d4cf";

          const rowBg =
            isActive  ? "rgba(91,82,232,0.03)" :
            isDone    ? "rgba(61,155,110,0.03)" :
            "transparent";

          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: rowBg, borderColor: CR.border }}
            >
              {/* Phase number pill */}
              <span
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold select-none"
                style={{ background: numBg, color: "#fff" }}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span
                className={`text-[13px] leading-[1.55] flex-1 ${isDone ? "line-through" : ""}`}
                style={{ color: isDone ? INLINE.muted : isBlocked ? INLINE.red : "#1a1916" }}
              >
                {item.text}
              </span>
              {isActive && (
                <span
                  className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(91,82,232,0.10)", color: CR.active }}
                >
                  running
                </span>
              )}
              {isBlocked && (
                <span
                  className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(220,38,38,0.08)", color: C.err.dot }}
                >
                  blocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHECKLIST — base version (Lab/School)
// ---------------------------------------------------------------------------
function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  const doneCount = block.items.filter((i) => i.done).length;
  const total = block.items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="px-4 pt-2.5 pb-2" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">Checklist</span>
          <span className="ml-auto font-mono text-[9.5px] text-ruberra-muted tabular-nums">{doneCount}/{total}</span>
          {allDone && <span className="font-mono text-[10px]" style={{ color: INLINE.green }}>✓ complete</span>}
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: allDone ? C.ok.dot : C.active.dot, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div className="px-4 py-2.5 space-y-0.5">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 py-0.5">
            <span className="font-mono text-[11px] shrink-0 select-none" style={{ color: item.done ? C.ok.dot : "#d6d4cf" }}>●</span>
            <span className={`text-[13px] leading-[1.6] flex-1 ${item.done ? "line-through" : ""}`} style={{ color: item.done ? INLINE.muted : "inherit" }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// CHECKLIST — Creation variant: square checks, segmented progress, clean artifact feel
function ChecklistCreationRenderer({ block }: { block: ChecklistBlock }) {
  const doneCount = block.items.filter((i) => i.done).length;
  const total = block.items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  // Segmented bar: N segments for N items
  const segments = block.items.map((item) => item.done);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${CR.border}` }}>
      {/* Header with segmented bar */}
      <div className="px-4 pt-3 pb-2.5" style={{ background: "#f0f7f3", borderBottom: `1px solid ${CR.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: CR.accent2 }}>
            Deliverables
          </span>
          <span className="ml-auto font-mono text-[9.5px] tabular-nums" style={{ color: CR.accent2 }}>
            {doneCount}/{total}
          </span>
          {allDone && (
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded" style={{ background: "rgba(61,155,110,0.12)", color: CR.done }}>
              ready
            </span>
          )}
        </div>
        {/* Segmented progress — rect geometry */}
        <div className="flex items-center gap-0.5">
          {segments.map((done, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 first:rounded-l last:rounded-r"
              style={{ background: done ? CR.done : "#e2e0dc", transition: "background 0.3s ease" }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-mono text-[9px]" style={{ color: CR.accent2 }}>{pct}% complete</span>
        </div>
      </div>

      {/* Items — square check marks */}
      <div className="px-4 py-3 space-y-1">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            {/* Square check */}
            <span
              className="shrink-0 w-4 h-4 flex items-center justify-center mt-0.5 rounded-sm text-[9px] font-bold select-none"
              style={{
                background: item.done ? "rgba(61,155,110,0.12)" : "transparent",
                border: `1.5px solid ${item.done ? CR.done : "#d6d4cf"}`,
                color: CR.done,
              }}
            >
              {item.done ? "✓" : ""}
            </span>
            <span
              className={`text-[13px] leading-[1.55] flex-1 ${item.done ? "line-through" : ""}`}
              style={{ color: item.done ? INLINE.muted : "#1a1916" }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TABLE — base version (all chambers)
// ---------------------------------------------------------------------------
function inferValueTone(value: string): string | null {
  const v = value.toLowerCase();
  if (/^(yes|confirmed|pass|complete|done|true|high|ok|✓)/.test(v)) return INLINE.green;
  if (/^(no|fail|false|blocked|err|error|critical)/.test(v))          return INLINE.red;
  if (/^(warn|warning|partial|medium|pending|tbd|unknown)/.test(v))   return INLINE.amber;
  if (/^[A-Z][a-zA-Z]+\s*[{<([]/.test(value) || /^React\.|^Node\.|^string$|^number$|^boolean$|^void$/.test(value)) return INLINE.type;
  return null;
}

function TableRenderer({ block, isCreation = false }: { block: TableBlock; isCreation?: boolean }) {
  const headerLabel = isCreation ? "Spec" : "Data";
  const headerBg    = isCreation ? "#f0f7f3" : "#f5f4f2";
  const headerBorder = isCreation ? CR.border : "#e2e0dc";
  const outerBorder = isCreation ? CR.border : "#e2e0dc";
  const rowSep      = isCreation ? CR.border : "#ebe9e5";

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${outerBorder}` }}>
      <div className="flex items-center px-4 py-1.5" style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
        <span
          className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none"
          style={{ color: isCreation ? CR.accent2 : "#8a8780" }}
        >
          {headerLabel}
        </span>
        <span className="ml-auto font-mono text-[9px] text-ruberra-muted/40 tabular-nums">{block.rows.length}</span>
      </div>
      <table className="w-full">
        <tbody>
          {block.rows.map((row, i) => {
            const valueTone = inferValueTone(row.value);
            return (
              <tr key={i} style={{ borderBottom: i < block.rows.length - 1 ? `1px solid ${rowSep}` : undefined }}>
                <td
                  className="px-4 py-2 text-[11.5px] font-medium w-[36%] align-top leading-relaxed"
                  style={{ background: isCreation ? (i % 2 === 0 ? "#f8faf9" : CR.bg) : (i % 2 === 0 ? "#fafaf8" : "#f7f6f4"), color: isCreation ? CR.accent2 : "#8a8780" }}
                >
                  {row.key}
                </td>
                <td className="px-4 py-2 text-[13px] align-top leading-relaxed" style={{ color: valueTone ?? "#1a1916" }}>
                  {row.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATUS — same for all chambers (full-width diff rows)
// ---------------------------------------------------------------------------
const STATUS_STRIPE: Record<string, { leftStripe: string; rowBg: string; dotColor: string; labelColor: string; badge: string }> = {
  ok:   { leftStripe: C.ok.stripe,   rowBg: C.ok.rowBg,   dotColor: C.ok.dot,   labelColor: "#1a1916", badge: "ok"   },
  warn: { leftStripe: C.warn.stripe, rowBg: C.warn.rowBg, dotColor: C.warn.dot, labelColor: "#1a1916", badge: "warn" },
  err:  { leftStripe: C.err.stripe,  rowBg: C.err.rowBg,  dotColor: C.err.dot,  labelColor: "#1a1916", badge: "err"  },
  info: { leftStripe: C.info.stripe, rowBg: C.info.rowBg, dotColor: C.info.dot, labelColor: "#6b6966", badge: "info" },
};

function StatusRenderer({ block }: { block: StatusBlock }) {
  const counts = block.rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">Status</span>
        <div className="ml-auto flex items-center gap-3">
          {counts.ok   && <span className="font-mono text-[10px]" style={{ color: INLINE.green }}>{counts.ok} ok</span>}
          {counts.warn && <span className="font-mono text-[10px]" style={{ color: INLINE.amber }}>{counts.warn} warn</span>}
          {counts.err  && <span className="font-mono text-[10px]" style={{ color: INLINE.red   }}>{counts.err} err</span>}
        </div>
      </div>
      {block.rows.map((row, i) => {
        const s = STATUS_STRIPE[row.state] ?? STATUS_STRIPE.info;
        return (
          <div key={i} className="flex items-center gap-3 px-0" style={{ background: s.rowBg, borderBottom: i < block.rows.length - 1 ? "1px solid rgba(26,25,22,0.06)" : undefined, borderLeft: `3px solid ${s.leftStripe}` }}>
            <span className="font-mono text-[11px] pl-3 shrink-0 select-none" style={{ color: s.dotColor }}>●</span>
            <span className="text-[13px] leading-relaxed flex-1 py-2" style={{ color: s.labelColor }}>{row.label}</span>
            <span className="font-mono text-[10px] pr-4 shrink-0 select-none" style={{ color: s.dotColor }}>{s.badge}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS — base version (Lab/School)
// ---------------------------------------------------------------------------
function ProgressRenderer({ block }: { block: ProgressBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="flex items-center px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">Progress</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {block.rows.map((row, i) => {
          const barColor = row.value >= 80 ? C.ok.dot : row.value >= 40 ? C.active.dot : C.warn.dot;
          const valColor = row.value >= 80 ? INLINE.green : row.value >= 40 ? C.active.text : INLINE.amber;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-ruberra-subtext">{row.label}</span>
                <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: valColor }}>{row.value}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
                <div className="h-full rounded-full" style={{ width: `${row.value}%`, background: barColor, transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PROGRESS — Creation variant: rectangular bars, clean studio readiness feel
function ProgressCreationRenderer({ block }: { block: ProgressBlock }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${CR.border}` }}>
      <div className="flex items-center px-4 py-1.5" style={{ background: "#f0f7f3", borderBottom: `1px solid ${CR.border}` }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: CR.accent2 }}>
          Readiness
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {block.rows.map((row, i) => {
          const barColor =
            row.value >= 80 ? CR.done :
            row.value >= 40 ? CR.active :
            C.warn.dot;
          const valColor =
            row.value >= 80 ? CR.accent2 :
            row.value >= 40 ? CR.active :
            INLINE.amber;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px]" style={{ color: "#1a1916" }}>{row.label}</span>
                <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: valColor }}>{row.value}%</span>
              </div>
              {/* Rectangular bar — no border-radius, studio feel */}
              <div className="h-1.5 overflow-hidden" style={{ background: "#e2e0dc", borderRadius: "2px" }}>
                <div
                  className="h-full"
                  style={{ width: `${row.value}%`, background: barColor, borderRadius: "2px", transition: "width 0.4s ease" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SIGNAL — base version (Lab/School): borderless * strip
// ---------------------------------------------------------------------------
function SignalRenderer({ block }: { block: SignalBlock }) {
  const toneColor = (tone: string | undefined): string => {
    switch (tone) {
      case "ok":     return INLINE.green;
      case "warn":   return INLINE.amber;
      case "err":    return INLINE.red;
      case "active": return C.active.text;
      case "info":   return INLINE.muted;
      default:       return INLINE.muted;
    }
  };
  return (
    <div className="space-y-0.5 py-0.5">
      {block.pairs.map((pair, i) => (
        <div key={i} className="flex items-baseline gap-2 font-mono text-[12px]">
          <span className="shrink-0 select-none" style={{ color: INLINE.amber }}>*</span>
          <span className="shrink-0 select-none" style={{ color: INLINE.muted }}>{pair.key}</span>
          <span style={{ color: toneColor(pair.tone) }}>{pair.value}</span>
        </div>
      ))}
    </div>
  );
}

// SIGNAL — Creation variant: compact parameter summary panel
function SignalCreationRenderer({ block }: { block: SignalBlock }) {
  const toneColor = (tone: string | undefined): string => {
    switch (tone) {
      case "ok":     return CR.done;
      case "warn":   return INLINE.amber;
      case "err":    return INLINE.red;
      case "active": return CR.active;
      case "info":   return INLINE.muted;
      default:       return "#1a1916";
    }
  };
  return (
    <div
      className="rounded-lg px-3.5 py-2.5"
      style={{ background: CR.bg, border: `1px solid ${CR.border}` }}
    >
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {block.pairs.map((pair, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.07em] select-none" style={{ color: CR.accent2 }}>
              {pair.key}
            </span>
            <span className="font-mono text-[11px]" style={{ color: toneColor(pair.tone) }}>
              {pair.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatch — chamber-aware
// ---------------------------------------------------------------------------
function BlockRenderer({ block, isCreation }: { block: OutputBlock; isCreation: boolean }) {
  switch (block.type) {
    case "prose":     return <ProseRenderer text={block.text} isCreation={isCreation} />;
    case "verdict":   return <VerdictRenderer block={block} />;
    case "insight":   return <InsightRenderer block={block} />;
    case "code":      return <CodeRenderer block={block} />;
    case "steps":     return isCreation ? <StepsCreationRenderer block={block} /> : <StepsRenderer block={block} />;
    case "checklist": return isCreation ? <ChecklistCreationRenderer block={block} /> : <ChecklistRenderer block={block} />;
    case "table":     return <TableRenderer block={block} isCreation={isCreation} />;
    case "status":    return <StatusRenderer block={block} />;
    case "progress":  return isCreation ? <ProgressCreationRenderer block={block} /> : <ProgressRenderer block={block} />;
    case "signal":    return isCreation ? <SignalCreationRenderer block={block} /> : <SignalRenderer block={block} />;
    default:          return null;
  }
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function RenderedOutput({ content, streaming, tab }: RenderedOutputProps) {
  const blocks = parseBlocks(content);
  const isCreation = tab === "creation";

  if (blocks.length === 0) {
    return (
      <p
        className="whitespace-pre-wrap"
        style={{
          fontSize: isCreation ? "13px" : "13.5px",
          lineHeight: isCreation ? "1.6" : "1.65",
          color: "#1a1916",
        }}
      >
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} isCreation={isCreation} />
      ))}
      {streaming && (
        <span className="inline-flex gap-0.5 items-end pb-0.5 ml-0.5">
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/50 animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/50 animate-bounce [animation-delay:120ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/50 animate-bounce [animation-delay:240ms]" />
        </span>
      )}
    </div>
  );
}
