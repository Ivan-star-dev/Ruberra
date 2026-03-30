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
} from "./outputBlocks";

interface RenderedOutputProps {
  content: string;
  streaming?: boolean;
}

// ---------------------------------------------------------------------------
// Shared markdown component map — used inside prose and some block renderers
// ---------------------------------------------------------------------------
const MD_COMPONENTS = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[13.5px] leading-[1.65] text-ruberra-text mb-2 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-ruberra-text">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-ruberra-subtext">{children}</em>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="font-mono text-[11.5px] px-1.5 py-0.5 rounded text-ruberra-text/90 align-baseline"
          style={{ background: "#ebe9e5", border: "1px solid #d6d4cf" }}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-[12px] text-ruberra-text/90 leading-relaxed">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre
      className="rounded-lg px-4 py-3 overflow-x-auto my-2"
      style={{ background: "#f0efed", border: "1px solid #e2e0dc" }}
    >
      {children}
    </pre>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-1.5 space-y-0.5 pl-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-1.5 space-y-0.5 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[13.5px] leading-[1.65] text-ruberra-text list-disc marker:text-ruberra-muted">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote
      className="pl-3 my-2 text-ruberra-subtext text-[13px] leading-relaxed"
      style={{ borderLeft: "2px solid #d6d4cf" }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ruberra-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-ruberra-border" />,
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-[15px] font-semibold text-ruberra-text mt-3 mb-1.5 tracking-tight">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[14px] font-semibold text-ruberra-text mt-3 mb-1 tracking-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[13.5px] font-medium text-ruberra-text mt-2.5 mb-1">{children}</h3>
  ),
};

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function ProseRenderer({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {text}
    </ReactMarkdown>
  );
}

// VERDICT — strongest emphasis, Lab primary output, full-width callout
function VerdictRenderer({ block }: { block: VerdictBlock }) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 my-0.5"
      style={{
        background: "rgba(26,25,22,0.04)",
        border: "1px solid rgba(26,25,22,0.10)",
        borderLeft: "3px solid #1a1916",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 text-[9px] font-semibold tracking-[0.12em] uppercase text-ruberra-subtext/70 mt-1 select-none"
          style={{ letterSpacing: "0.1em" }}
        >
          Verdict
        </span>
        <p className="text-[13.5px] leading-[1.65] text-ruberra-text font-medium flex-1">
          {block.text}
        </p>
      </div>
    </div>
  );
}

// INSIGHT — secondary callout, accent-keyed
function InsightRenderer({ block }: { block: InsightBlock }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(91,82,232,0.04)",
        border: "1px solid rgba(91,82,232,0.14)",
        borderLeft: "3px solid rgba(91,82,232,0.45)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 text-[9px] font-semibold tracking-[0.1em] uppercase text-ruberra-accent/60 mt-1 select-none">
          Insight
        </span>
        <p className="text-[13.5px] leading-[1.65] text-ruberra-text flex-1">{block.text}</p>
      </div>
    </div>
  );
}

// CODE — language header + monospace block
function CodeRenderer({ block }: { block: CodeBlock }) {
  return (
    <div
      className="rounded-lg overflow-hidden my-0.5"
      style={{ background: "#f0efed", border: "1px solid #e2e0dc" }}
    >
      {block.lang && block.lang !== "text" && (
        <div
          className="px-3.5 py-1.5 flex items-center gap-2"
          style={{ borderBottom: "1px solid #e2e0dc", background: "#ebe9e5" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ruberra-muted/50 shrink-0" />
          <span className="text-[10px] font-mono text-ruberra-subtext/80 tracking-widest">
            {block.lang}
          </span>
        </div>
      )}
      <pre className="px-4 py-3 overflow-x-auto">
        <code className="text-[12px] font-mono text-ruberra-text/90 leading-[1.7]">
          {block.text}
        </code>
      </pre>
    </div>
  );
}

// STEPS — School/Creation primary output. Numbered circles with connector line.
function StepsRenderer({ block }: { block: StepsBlock }) {
  return (
    <ol className="space-y-0 my-0.5">
      {block.items.map((item, i) => {
        const isLast = i === block.items.length - 1;
        return (
          <li key={i} className="flex items-start gap-3 relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className="absolute left-[9px] top-6 bottom-0 w-px"
                style={{ background: "#e2e0dc" }}
              />
            )}
            <span
              className="shrink-0 w-[19px] h-[19px] rounded-full flex items-center justify-center text-[10px] font-semibold text-ruberra-accent z-10 mt-0.5"
              style={{ background: "rgba(91,82,232,0.10)", border: "1px solid rgba(91,82,232,0.20)" }}
            >
              {i + 1}
            </span>
            <span className="text-[13.5px] leading-[1.65] text-ruberra-text pb-3 flex-1">
              {item}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// CHECKLIST — Creation primary output. Clear done/pending states.
function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  const doneCount = block.items.filter((i) => i.done).length;
  const total = block.items.length;
  const allDone = doneCount === total;

  return (
    <div className="my-0.5">
      <ul className="space-y-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className={[
                "shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5",
                item.done ? "text-ruberra-pulse" : "text-transparent",
              ].join(" ")}
              style={{
                background: item.done ? "rgba(61,155,110,0.10)" : "transparent",
                border: item.done ? "1.5px solid rgba(61,155,110,0.40)" : "1.5px solid #d6d4cf",
              }}
            >
              {item.done && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span
              className={[
                "text-[13.5px] leading-[1.65] flex-1",
                item.done ? "text-ruberra-subtext/70 line-through" : "text-ruberra-text",
              ].join(" ")}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
      {total > 1 && (
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(doneCount / total) * 100}%`,
                background: allDone ? "#3d9b6e" : "rgba(91,82,232,0.5)",
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-ruberra-muted tabular-nums shrink-0">
            {doneCount}/{total}
          </span>
        </div>
      )}
    </div>
  );
}

// TABLE — clean key/value matrix, no heavy borders
function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="rounded-lg overflow-hidden my-0.5" style={{ border: "1px solid #e2e0dc" }}>
      <table className="w-full">
        <tbody>
          {block.rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < block.rows.length - 1 ? "1px solid #ebe9e5" : undefined,
              }}
            >
              <td
                className="px-3 py-2 text-[12px] font-medium text-ruberra-subtext w-[38%] align-top leading-relaxed"
                style={{ background: i % 2 === 0 ? "#f8f7f5" : "#f5f4f2" }}
              >
                {row.key}
              </td>
              <td className="px-3 py-2 text-[13px] text-ruberra-text align-top leading-relaxed">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// STATUS — grouped condition rows with semantic dot + label, badge for state
const STATUS_CONFIG = {
  ok:   { dot: "bg-ruberra-pulse",  badge: "text-ruberra-pulse",  bg: "rgba(61,155,110,0.07)",  label: "ok"   },
  warn: { dot: "bg-yellow-400",     badge: "text-yellow-600",     bg: "rgba(234,179,8,0.07)",   label: "warn" },
  err:  { dot: "bg-red-400",        badge: "text-red-500",        bg: "rgba(248,113,113,0.07)", label: "err"  },
  info: { dot: "bg-ruberra-muted",  badge: "text-ruberra-subtext", bg: "transparent",           label: "info" },
};

function StatusRenderer({ block }: { block: StatusBlock }) {
  return (
    <div className="rounded-lg overflow-hidden my-0.5" style={{ border: "1px solid #e2e0dc" }}>
      {block.rows.map((row, i) => {
        const cfg = STATUS_CONFIG[row.state];
        return (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2"
            style={{
              background: cfg.bg,
              borderBottom: i < block.rows.length - 1 ? "1px solid #ebe9e5" : undefined,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            <span className="text-[13px] text-ruberra-text flex-1 leading-relaxed">{row.label}</span>
            <span
              className={`text-[9px] font-semibold uppercase tracking-widest shrink-0 ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// PROGRESS — labeled percentage bars
function ProgressRenderer({ block }: { block: ProgressBlock }) {
  return (
    <div className="space-y-2.5 my-0.5">
      {block.rows.map((row, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-ruberra-subtext">{row.label}</span>
            <span className="text-[11px] font-mono text-ruberra-muted tabular-nums">{row.value}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${row.value}%`,
                background: row.value >= 80
                  ? "#3d9b6e"
                  : row.value >= 40
                  ? "rgba(91,82,232,0.6)"
                  : "#d6d4cf",
              }}
            />
          </div>
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
    <div className="space-y-2.5">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      {streaming && (
        <span className="inline-flex gap-0.5 items-end pb-0.5 ml-0.5">
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/60 animate-bounce [animation-delay:120ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted/60 animate-bounce [animation-delay:240ms]" />
        </span>
      )}
    </div>
  );
}
