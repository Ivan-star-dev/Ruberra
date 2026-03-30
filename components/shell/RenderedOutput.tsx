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
// Semantic color tokens — visible but not loud
// ---------------------------------------------------------------------------
const C = {
  ok:      { dot: "#3d9b6e", text: "#2d7a56", bg: "rgba(61,155,110,0.07)",   border: "rgba(61,155,110,0.25)"  },
  warn:    { dot: "#ca8a04", text: "#92620a", bg: "rgba(202,138,4,0.07)",    border: "rgba(202,138,4,0.25)"   },
  err:     { dot: "#dc2626", text: "#b91c1c", bg: "rgba(220,38,38,0.07)",    border: "rgba(220,38,38,0.22)"   },
  info:    { dot: "#8a8780", text: "#6b6966", bg: "transparent",             border: "rgba(138,135,128,0.20)" },
  neutral: { dot: "#b8b5ae", text: "#8a8780", bg: "transparent",             border: "rgba(182,178,174,0.20)" },
  active:  { dot: "#5b52e8", text: "#4a42cc", bg: "rgba(91,82,232,0.08)",   border: "rgba(91,82,232,0.25)"   },
};

// ---------------------------------------------------------------------------
// Shared markdown components for prose blocks
// ---------------------------------------------------------------------------
const MD: Record<string, React.ComponentType<{ children?: React.ReactNode; className?: string; href?: string }>> = {
  p:          ({ children }) => <p className="text-[13.5px] leading-[1.65] text-ruberra-text mb-2 last:mb-0">{children}</p>,
  strong:     ({ children }) => <strong className="font-semibold text-ruberra-text">{children}</strong>,
  em:         ({ children }) => <em className="italic text-ruberra-subtext">{children}</em>,
  ul:         ({ children }) => <ul className="my-1.5 space-y-0.5 pl-4">{children}</ul>,
  ol:         ({ children }) => <ol className="my-1.5 space-y-0.5 pl-4 list-decimal">{children}</ol>,
  li:         ({ children }) => <li className="text-[13.5px] leading-[1.65] text-ruberra-text list-disc marker:text-ruberra-muted">{children}</li>,
  hr:         () => <hr className="my-3 border-ruberra-border" />,
  h1:         ({ children }) => <h1 className="text-[15px] font-semibold text-ruberra-text mt-3 mb-1.5 tracking-tight">{children}</h1>,
  h2:         ({ children }) => <h2 className="text-[14px] font-semibold text-ruberra-text mt-3 mb-1 tracking-tight">{children}</h2>,
  h3:         ({ children }) => <h3 className="text-[13.5px] font-medium text-ruberra-text mt-2.5 mb-1">{children}</h3>,
  blockquote: ({ children }) => <blockquote className="pl-3 my-2 text-ruberra-subtext text-[13px] leading-relaxed" style={{ borderLeft: "2px solid #d6d4cf" }}>{children}</blockquote>,
  a:          ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-ruberra-accent underline underline-offset-2 hover:opacity-75 transition-opacity">{children}</a>,
  pre:        ({ children }) => <pre className="rounded-lg px-4 py-3 overflow-x-auto my-2" style={{ background: "#f0efed", border: "1px solid #e2e0dc" }}>{children}</pre>,
  code:       ({ children, className }) => {
    if (!className) {
      return <code className="font-mono text-[11.5px] px-1.5 py-0.5 rounded text-ruberra-text/90 align-baseline" style={{ background: "#ebe9e5", border: "1px solid #d6d4cf" }}>{children}</code>;
    }
    return <code className="font-mono text-[12px] text-ruberra-text/90 leading-relaxed">{children}</code>;
  },
};

// ---------------------------------------------------------------------------
// Small shared primitives
// ---------------------------------------------------------------------------

function Chip({ label, tone = "neutral" }: { label: string; tone?: keyof typeof C }) {
  const cfg = C[tone];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase tracking-[0.08em] select-none"
      style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {label}
    </span>
  );
}

function Dot({ tone = "neutral", pulse = false }: { tone?: keyof typeof C; pulse?: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${pulse ? "animate-pulse" : ""}`}
      style={{ background: C[tone].dot }}
    />
  );
}

function SectionMeta({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ruberra-muted/70 select-none">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function ProseRenderer({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD as Parameters<typeof ReactMarkdown>[0]["components"]}>
      {text}
    </ReactMarkdown>
  );
}

// VERDICT — tribunal weight, full-width, dark-bordered header surface
function VerdictRenderer({ block }: { block: VerdictBlock }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(26,25,22,0.13)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ background: "rgba(26,25,22,0.05)", borderBottom: "1px solid rgba(26,25,22,0.08)" }}
      >
        <Dot tone="neutral" />
        <SectionMeta>Verdict</SectionMeta>
      </div>
      {/* Body */}
      <div className="px-4 py-3.5" style={{ background: "rgba(26,25,22,0.02)" }}>
        <p className="text-[14px] leading-[1.6] text-ruberra-text font-medium tracking-tight">
          {block.text}
        </p>
      </div>
    </div>
  );
}

// INSIGHT — accent-keyed secondary callout with label
function InsightRenderer({ block }: { block: InsightBlock }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: `1px solid ${C.active.border}` }}
    >
      <div
        className="flex items-center gap-2 px-4 py-1.5"
        style={{ background: C.active.bg, borderBottom: `1px solid ${C.active.border}` }}
      >
        <Dot tone="active" />
        <SectionMeta>Insight</SectionMeta>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-[1.65] text-ruberra-text">{block.text}</p>
      </div>
    </div>
  );
}

// CODE — language bar, dot, monospace
function CodeRenderer({ block }: { block: CodeBlock }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "#f0efed", border: "1px solid #e2e0dc" }}
    >
      <div
        className="flex items-center gap-2 px-3.5 py-1.5"
        style={{ borderBottom: "1px solid #e2e0dc", background: "#ebe9e5" }}
      >
        <span className="flex gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "#d6d4cf" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#d6d4cf" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#d6d4cf" }} />
        </span>
        {block.lang && block.lang !== "text" && (
          <span className="text-[10px] font-mono text-ruberra-subtext/70 tracking-widest uppercase ml-1">
            {block.lang}
          </span>
        )}
      </div>
      <pre className="px-4 py-3.5 overflow-x-auto">
        <code className="text-[12px] font-mono text-ruberra-text/90 leading-[1.75]">
          {block.text}
        </code>
      </pre>
    </div>
  );
}

// STEPS — progression rail with state markers: done / active / blocked / pending
function StepsRenderer({ block }: { block: StepsBlock }) {
  const stateCfg = {
    done:    { circleBg: C.ok.bg,      circleBorder: C.ok.border,     circleText: C.ok.text,     lineBg: C.ok.dot,    badge: <Chip label="done" tone="ok" /> },
    active:  { circleBg: C.active.bg,  circleBorder: C.active.border, circleText: C.active.text, lineBg: "#e2e0dc",   badge: <Chip label="active" tone="active" /> },
    blocked: { circleBg: C.err.bg,     circleBorder: C.err.border,    circleText: C.err.text,    lineBg: "#e2e0dc",   badge: <Chip label="blocked" tone="err" /> },
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e2e0dc" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-1.5"
        style={{ borderBottom: "1px solid #e2e0dc", background: "#f5f4f2" }}
      >
        <SectionMeta>Steps</SectionMeta>
        <span className="text-[9px] font-mono text-ruberra-muted/50 ml-auto tabular-nums">
          {block.items.length}
        </span>
      </div>
      <ol className="px-4 py-3 space-y-0">
        {block.items.map((item, i) => {
          const isLast = i === block.items.length - 1;
          const s = item.state;
          const cfg = s ? stateCfg[s] : null;

          const circleBg     = cfg?.circleBg     ?? "transparent";
          const circleBorder = cfg?.circleBorder  ?? "#d6d4cf";
          const circleText   = cfg?.circleText    ?? "#8a8780";
          const lineBg       = cfg?.lineBg        ?? "#e2e0dc";
          const badge        = cfg?.badge;

          // Done items: check mark instead of number
          const circleContent = s === "done"
            ? <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <span style={{ color: circleText }}>{i + 1}</span>;

          return (
            <li key={i} className="flex items-start gap-3 relative">
              {!isLast && (
                <div
                  className="absolute left-[9px] top-[22px] bottom-0 w-px"
                  style={{ background: lineBg }}
                />
              )}
              <span
                className="shrink-0 w-[19px] h-[19px] rounded-full flex items-center justify-center text-[9.5px] font-semibold z-10 mt-0.5"
                style={{ background: circleBg, border: `1.5px solid ${circleBorder}`, color: circleText }}
              >
                {circleContent}
              </span>
              <div className="flex-1 pb-3 flex items-start justify-between gap-2 min-w-0">
                <span
                  className={[
                    "text-[13.5px] leading-[1.65] flex-1",
                    s === "done" ? "text-ruberra-subtext/60 line-through" : "text-ruberra-text",
                    s === "blocked" ? "text-ruberra-subtext" : "",
                  ].join(" ")}
                >
                  {item.text}
                </span>
                {badge && <span className="shrink-0 mt-0.5">{badge}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// CHECKLIST — execution build surface, progress header
function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  const doneCount = block.items.filter((i) => i.done).length;
  const total = block.items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = doneCount === total;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e2e0dc" }}
    >
      {/* Header with progress bar */}
      <div
        className="px-4 pt-2.5 pb-2"
        style={{ borderBottom: "1px solid #e2e0dc", background: "#f5f4f2" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <SectionMeta>Checklist</SectionMeta>
          <span className="ml-auto text-[9.5px] font-mono text-ruberra-muted tabular-nums">
            {doneCount}/{total}
          </span>
          {allDone && <Chip label="complete" tone="ok" />}
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone ? C.ok.dot : C.active.dot,
            }}
          />
        </div>
      </div>

      {/* Items */}
      <ul className="px-4 py-3 space-y-1.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
              style={{
                background: item.done ? C.ok.bg : "transparent",
                border: `1.5px solid ${item.done ? C.ok.border : "#d6d4cf"}`,
                color: C.ok.text,
              }}
            >
              {item.done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l2 2L6.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span
              className={[
                "text-[13.5px] leading-[1.65] flex-1",
                item.done ? "text-ruberra-subtext/60 line-through" : "text-ruberra-text",
              ].join(" ")}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// TABLE — specification matrix
function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e2e0dc" }}
    >
      <div
        className="flex items-center px-4 py-1.5"
        style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}
      >
        <SectionMeta>Data</SectionMeta>
        <span className="ml-auto text-[9px] font-mono text-ruberra-muted/50 tabular-nums">
          {block.rows.length} rows
        </span>
      </div>
      <table className="w-full">
        <tbody>
          {block.rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: i < block.rows.length - 1 ? "1px solid #ebe9e5" : undefined }}
            >
              <td
                className="px-4 py-2 text-[11.5px] font-medium text-ruberra-subtext w-[36%] align-top leading-relaxed"
                style={{ background: i % 2 === 0 ? "#fafaf8" : "#f7f6f4" }}
              >
                {row.key}
              </td>
              <td className="px-4 py-2 text-[13px] text-ruberra-text align-top leading-relaxed">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// STATUS — operational condition panel
function StatusRenderer({ block }: { block: StatusBlock }) {
  // Summary chips: count per state
  const counts = block.rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.state] = (acc[r.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e2e0dc" }}
    >
      {/* Header with summary */}
      <div
        className="flex items-center gap-2 px-4 py-1.5"
        style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}
      >
        <SectionMeta>Status</SectionMeta>
        <div className="ml-auto flex items-center gap-1.5">
          {counts.ok   && <Chip label={`${counts.ok} ok`}   tone="ok"   />}
          {counts.warn && <Chip label={`${counts.warn} warn`} tone="warn" />}
          {counts.err  && <Chip label={`${counts.err} err`}  tone="err"  />}
        </div>
      </div>

      {/* Rows */}
      {block.rows.map((row, i) => {
        const c = C[row.state];
        return (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2"
            style={{
              background: c.bg,
              borderBottom: i < block.rows.length - 1 ? "1px solid #ebe9e5" : undefined,
            }}
          >
            <Dot tone={row.state} />
            <span className="text-[13px] text-ruberra-text flex-1 leading-relaxed">{row.label}</span>
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.09em] shrink-0"
              style={{ color: c.text }}
            >
              {row.state}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// PROGRESS — labeled bars with value-based color
function ProgressRenderer({ block }: { block: ProgressBlock }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e2e0dc" }}
    >
      <div
        className="flex items-center px-4 py-1.5"
        style={{ background: "#f5f4f2", borderBottom: "1px solid #e2e0dc" }}
      >
        <SectionMeta>Progress</SectionMeta>
      </div>
      <div className="px-4 py-3 space-y-3">
        {block.rows.map((row, i) => {
          const barColor = row.value >= 80
            ? C.ok.dot
            : row.value >= 40
            ? C.active.dot
            : C.warn.dot;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-ruberra-subtext">{row.label}</span>
                <span
                  className="text-[10px] font-mono tabular-nums font-semibold"
                  style={{ color: barColor }}
                >
                  {row.value}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${row.value}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SIGNAL — compact horizontal metadata strip (confidence, phase, next move)
function SignalRenderer({ block }: { block: SignalBlock }) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 rounded-lg"
      style={{ background: "#f5f4f2", border: "1px solid #e8e6e2" }}
    >
      {block.pairs.map((pair, i) => {
        const tone = pair.tone ?? "neutral";
        const c = C[tone];
        return (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-medium text-ruberra-muted uppercase tracking-[0.08em] select-none">
              {pair.key}
            </span>
            <span className="text-[10px] font-mono" style={{ color: c.text }}>
              {pair.value}
            </span>
          </div>
        );
      })}
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
