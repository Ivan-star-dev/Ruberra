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
}

// ---------------------------------------------------------------------------
// Semantic color system — Claude Code DNA palette
// ---------------------------------------------------------------------------
const C = {
  ok:      { dot: "#3d9b6e", text: "#2d7a56", bg: "rgba(0,80,0,0.10)",        stripe: "rgba(0,100,0,0.22)",    rowBg: "rgba(0,60,0,0.07)"   },
  warn:    { dot: "#ca8a04", text: "#92620a", bg: "rgba(202,138,4,0.08)",      stripe: "rgba(180,120,0,0.35)",  rowBg: "rgba(180,120,0,0.05)" },
  err:     { dot: "#dc2626", text: "#b91c1c", bg: "rgba(139,0,0,0.10)",        stripe: "rgba(180,0,0,0.40)",    rowBg: "rgba(139,0,0,0.07)"  },
  info:    { dot: "#8a8780", text: "#6b6966", bg: "transparent",               stripe: "rgba(138,135,128,0.25)", rowBg: "transparent"         },
  neutral: { dot: "#b8b5ae", text: "#8a8780", bg: "transparent",               stripe: "#d6d4cf",               rowBg: "transparent"         },
  active:  { dot: "#5b52e8", text: "#4a42cc", bg: "rgba(91,82,232,0.07)",      stripe: "rgba(91,82,232,0.30)",  rowBg: "rgba(91,82,232,0.04)" },
};

// Inline value colors — cyan for type/identifier, amber for warn, green for ok, red for err
const INLINE = {
  type:    "#0e7490",   // cyan — identifiers, types
  amber:   "#92620a",   // amber — warnings, pending
  green:   "#2d7a56",   // green — confirmed, passing
  red:     "#b91c1c",   // red — errors, blocked
  muted:   "#8a8780",   // neutral values
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

// ---------------------------------------------------------------------------
// ProseRenderer — react-markdown with GFM
// ---------------------------------------------------------------------------
function ProseRenderer({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p:          MDParagraph,
        strong:     ({ children }) => <strong className="font-semibold text-ruberra-text">{children}</strong>,
        em:         ({ children }) => <em className="italic text-ruberra-subtext">{children}</em>,
        ul:         ({ children }) => <ul className="my-1.5 space-y-0.5 pl-4 list-disc marker:text-ruberra-muted">{children}</ul>,
        ol:         ({ children }) => <ol className="my-1.5 space-y-0.5 pl-4 list-decimal marker:text-ruberra-muted">{children}</ol>,
        li:         ({ children }) => <li className="text-[13.5px] leading-[1.65] text-ruberra-text">{children}</li>,
        hr:         () => <hr className="my-3 border-ruberra-border" />,
        h1:         ({ children }) => <h1 className="text-[15px] font-semibold text-ruberra-text mt-3 mb-1.5 tracking-tight">{children}</h1>,
        h2:         ({ children }) => <h2 className="text-[14px] font-semibold text-ruberra-text mt-3 mb-1 tracking-tight">{children}</h2>,
        h3:         ({ children }) => <h3 className="text-[13.5px] font-medium text-ruberra-text mt-2.5 mb-1">{children}</h3>,
        blockquote: ({ children }) => <blockquote className="pl-3 my-2 text-ruberra-subtext text-[13px] leading-relaxed" style={{ borderLeft: "2px solid #d6d4cf" }}>{children}</blockquote>,
        a:          ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-ruberra-accent underline underline-offset-2 hover:opacity-75 transition-opacity">{children}</a>,
        pre:        ({ children }) => <pre className="rounded px-4 py-3 overflow-x-auto my-2 font-mono" style={{ background: "#1a1916", border: "1px solid #2e2c29" }}>{children}</pre>,
        code:       ({ children, className }) => {
          if (!className) {
            return <code className="font-mono text-[11.5px] px-1.5 py-0.5 rounded align-baseline" style={{ background: "#ebe9e5", border: "1px solid #d6d4cf", color: INLINE.type }}>{children}</code>;
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
// VERDICT — tribunal weight, dark terminal surface
// ---------------------------------------------------------------------------
function VerdictRenderer({ block }: { block: VerdictBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ background: "#1a1916", border: "1px solid #2e2c29" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ borderBottom: "1px solid #2e2c29" }}>
        <span className="text-[11px] font-mono" style={{ color: C.ok.dot }}>●</span>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: "#8a8780" }}>
          Verdict
        </span>
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-[1.6] font-medium tracking-tight" style={{ color: "#e2e0dc" }}>
          {block.text}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INSIGHT — accent-keyed callout with ● dot
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
// CODE — dark terminal surface, language header, dot cluster
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
// STEPS — Claude Code tree rail: ● dot + └ connector per step
// ---------------------------------------------------------------------------
function StepsRenderer({ block }: { block: StepsBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-1.5"
        style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}
      >
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
          Steps
        </span>
        <span className="text-[9px] font-mono text-ruberra-muted/40 ml-auto tabular-nums">
          {block.items.length}
        </span>
      </div>

      {/* Step list */}
      <div className="px-4 py-2.5 space-y-0">
        {block.items.map((item, i) => {
          const s = item.state;
          const isLast = i === block.items.length - 1;

          // Dot color per state
          const dotColor =
            s === "done"    ? C.ok.dot    :
            s === "active"  ? C.active.dot :
            s === "blocked" ? C.err.dot   :
            "#d6d4cf";

          // Text treatment
          const textClass =
            s === "done"    ? "line-through" :
            s === "blocked" ? "opacity-50"  :
            "";
          const textColor =
            s === "done"    ? INLINE.green  :
            s === "active"  ? "inherit"     :
            s === "blocked" ? INLINE.red    :
            "inherit";

          // Inline state label (amber for active, no label for pending)
          const stateLabel =
            s === "done"    ? null :
            s === "active"  ? <span className="font-mono text-[10px]" style={{ color: INLINE.amber }}>(active)</span> :
            s === "blocked" ? <span className="font-mono text-[10px]" style={{ color: INLINE.red }}>(blocked)</span> :
            null;

          return (
            <div key={i} className="py-0.5">
              {/* Main step row */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] shrink-0 select-none" style={{ color: dotColor }}>●</span>
                <span
                  className={`text-[13px] leading-[1.6] text-ruberra-text flex-1 ${textClass}`}
                  style={{ color: textColor !== "inherit" ? textColor : undefined }}
                >
                  {item.text}
                </span>
                {stateLabel && <span className="shrink-0">{stateLabel}</span>}
              </div>

              {/* └ connector line to next step */}
              {!isLast && (
                <div className="flex items-stretch gap-2 mt-0 min-h-[10px]">
                  <span
                    className="font-mono text-[11px] shrink-0 select-none self-stretch flex items-start pt-0"
                    style={{ color: "#d6d4cf", lineHeight: "10px" }}
                  >
                    └
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHECKLIST — build execution surface, ● dot per item, progress header
// ---------------------------------------------------------------------------
function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  const doneCount = block.items.filter((i) => i.done).length;
  const total = block.items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      {/* Progress header */}
      <div className="px-4 pt-2.5 pb-2" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
            Checklist
          </span>
          <span className="ml-auto font-mono text-[9.5px] text-ruberra-muted tabular-nums">
            {doneCount}/{total}
          </span>
          {allDone && (
            <span className="font-mono text-[10px]" style={{ color: INLINE.green }}>✓ complete</span>
          )}
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: allDone ? C.ok.dot : C.active.dot, transition: "width 0.4s ease" }}
          />
        </div>
      </div>

      {/* Items — ● dot per item */}
      <div className="px-4 py-2.5 space-y-0.5">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 py-0.5">
            <span
              className="font-mono text-[11px] shrink-0 select-none"
              style={{ color: item.done ? C.ok.dot : "#d6d4cf" }}
            >
              ●
            </span>
            <span
              className={`text-[13px] leading-[1.6] flex-1 ${item.done ? "line-through" : ""}`}
              style={{ color: item.done ? INLINE.muted : "inherit" }}
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
// TABLE — semantic inline value coloring, no uniform gray
// ---------------------------------------------------------------------------

// Detect value tone from content
function inferValueTone(value: string): string | null {
  const v = value.toLowerCase();
  if (/^(yes|confirmed|pass|complete|done|true|high|ok|✓)/.test(v)) return INLINE.green;
  if (/^(no|fail|false|blocked|err|error|critical)/.test(v)) return INLINE.red;
  if (/^(warn|warning|partial|medium|pending|tbd|unknown)/.test(v)) return INLINE.amber;
  if (/^[A-Z][a-zA-Z]+\s*[{<([]/.test(value) || /^React\.|^Node\.|^string$|^number$|^boolean$|^void$/.test(value)) return INLINE.type;
  return null;
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="flex items-center px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
          Data
        </span>
        <span className="ml-auto font-mono text-[9px] text-ruberra-muted/40 tabular-nums">
          {block.rows.length}
        </span>
      </div>
      <table className="w-full">
        <tbody>
          {block.rows.map((row, i) => {
            const valueTone = inferValueTone(row.value);
            return (
              <tr
                key={i}
                style={{ borderBottom: i < block.rows.length - 1 ? "1px solid #ebe9e5" : undefined }}
              >
                <td
                  className="px-4 py-2 text-[11.5px] font-medium w-[36%] align-top leading-relaxed"
                  style={{ background: i % 2 === 0 ? "#fafaf8" : "#f7f6f4", color: "#8a8780" }}
                >
                  {row.key}
                </td>
                <td
                  className="px-4 py-2 text-[13px] align-top leading-relaxed"
                  style={{ color: valueTone ?? "#1a1916" }}
                >
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
// STATUS — full-width diff rows, deep color stripes, Claude Code reference
// ---------------------------------------------------------------------------
const STATUS_STRIPE: Record<string, { leftStripe: string; rowBg: string; dotColor: string; labelColor: string; badge: string }> = {
  ok:   { leftStripe: C.ok.stripe,      rowBg: C.ok.rowBg,      dotColor: C.ok.dot,      labelColor: "#1a1916", badge: "ok"   },
  warn: { leftStripe: C.warn.stripe,    rowBg: C.warn.rowBg,    dotColor: C.warn.dot,    labelColor: "#1a1916", badge: "warn" },
  err:  { leftStripe: C.err.stripe,     rowBg: C.err.rowBg,     dotColor: C.err.dot,     labelColor: "#1a1916", badge: "err"  },
  info: { leftStripe: C.info.stripe,    rowBg: C.info.rowBg,    dotColor: C.info.dot,    labelColor: "#6b6966", badge: "info" },
};

function StatusRenderer({ block }: { block: StatusBlock }) {
  const counts = block.rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      {/* Header with counts */}
      <div className="flex items-center gap-2 px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
          Status
        </span>
        <div className="ml-auto flex items-center gap-3">
          {counts.ok   && <span className="font-mono text-[10px]" style={{ color: INLINE.green }}>{counts.ok} ok</span>}
          {counts.warn && <span className="font-mono text-[10px]" style={{ color: INLINE.amber }}>{counts.warn} warn</span>}
          {counts.err  && <span className="font-mono text-[10px]" style={{ color: INLINE.red   }}>{counts.err} err</span>}
        </div>
      </div>

      {/* Full-width diff rows */}
      {block.rows.map((row, i) => {
        const s = STATUS_STRIPE[row.state] ?? STATUS_STRIPE.info;
        return (
          <div
            key={i}
            className="flex items-center gap-3 px-0"
            style={{
              background: s.rowBg,
              borderBottom: i < block.rows.length - 1 ? "1px solid rgba(26,25,22,0.06)" : undefined,
              borderLeft: `3px solid ${s.leftStripe}`,
            }}
          >
            {/* Dot */}
            <span className="font-mono text-[11px] pl-3 shrink-0 select-none" style={{ color: s.dotColor }}>●</span>
            {/* Label */}
            <span className="text-[13px] leading-relaxed flex-1 py-2" style={{ color: s.labelColor }}>{row.label}</span>
            {/* State badge — right-aligned mono, no border */}
            <span className="font-mono text-[10px] pr-4 shrink-0 select-none" style={{ color: s.dotColor }}>
              {s.badge}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROGRESS — value-colored bars
// ---------------------------------------------------------------------------
function ProgressRenderer({ block }: { block: ProgressBlock }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <div className="flex items-center px-4 py-1.5" style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}>
        <span className="text-[9.5px] font-semibold tracking-[0.12em] uppercase text-ruberra-muted/70 select-none">
          Progress
        </span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {block.rows.map((row, i) => {
          const barColor =
            row.value >= 80 ? C.ok.dot :
            row.value >= 40 ? C.active.dot :
            C.warn.dot;
          const valColor =
            row.value >= 80 ? INLINE.green :
            row.value >= 40 ? C.active.text :
            INLINE.amber;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-ruberra-subtext">{row.label}</span>
                <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: valColor }}>{row.value}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.value}%`, background: barColor, transition: "width 0.4s ease" }}
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
// SIGNAL — Claude Code meta strip: * key value, no border, no container
// ---------------------------------------------------------------------------
function SignalRenderer({ block }: { block: SignalBlock }) {
  const toneColor = (tone: string | undefined): string => {
    switch (tone) {
      case "ok":      return INLINE.green;
      case "warn":    return INLINE.amber;
      case "err":     return INLINE.red;
      case "active":  return C.active.text;
      case "info":    return INLINE.muted;
      default:        return INLINE.muted;
    }
  };

  return (
    <div className="space-y-0.5 py-0.5">
      {block.pairs.map((pair, i) => (
        <div key={i} className="flex items-baseline gap-2 font-mono text-[12px]">
          {/* amber * glyph — Claude Code meta marker */}
          <span className="shrink-0 select-none" style={{ color: INLINE.amber }}>*</span>
          {/* key in muted */}
          <span className="shrink-0 select-none" style={{ color: INLINE.muted }}>{pair.key}</span>
          {/* value in semantic color */}
          <span style={{ color: toneColor(pair.tone) }}>{pair.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
function BlockRenderer({ block }: { block: OutputBlock }) {
  switch (block.type) {
    case "prose":     return <ProseRenderer text={block.text} />;
    case "verdict":   return <VerdictRenderer block={block} />;
    case "insight":   return <InsightRenderer block={block} />;
    case "code":      return <CodeRenderer block={block} />;
    case "steps":     return <StepsRenderer block={block} />;
    case "checklist": return <ChecklistRenderer block={block} />;
    case "table":     return <TableRenderer block={block} />;
    case "status":    return <StatusRenderer block={block} />;
    case "progress":  return <ProgressRenderer block={block} />;
    case "signal":    return <SignalRenderer block={block} />;
    default:          return null;
  }
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function RenderedOutput({ content, streaming }: RenderedOutputProps) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return (
      <p className="text-[13.5px] leading-[1.65] text-ruberra-text whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
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
