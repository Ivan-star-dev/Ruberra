"use client";

import {
  parseBlocks,
  type OutputBlock,
  type StepsBlock,
  type ChecklistBlock,
  type CodeBlock,
  type InsightBlock,
  type TableBlock,
  type StatusBlock,
} from "./outputBlocks";

interface RenderedOutputProps {
  content: string;
  streaming?: boolean;
}

// ---------------------------------------------------------------------------
// Per-block renderers
// ---------------------------------------------------------------------------

function ProseRenderer({ text }: { text: string }) {
  // Preserve paragraph breaks
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[13.5px] leading-[1.65] text-ruberra-text whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

function CodeRenderer({ block }: { block: CodeBlock }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "#f0efed", border: "1px solid #e2e0dc" }}>
      {block.lang && block.lang !== "text" && (
        <div
          className="px-3 py-1.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid #e2e0dc" }}
        >
          <span className="text-[10px] font-mono text-ruberra-subtext/70 uppercase tracking-widest">
            {block.lang}
          </span>
        </div>
      )}
      <pre className="px-4 py-3 overflow-x-auto">
        <code className="text-[12px] font-mono text-ruberra-text/90 leading-relaxed">
          {block.text}
        </code>
      </pre>
    </div>
  );
}

function StepsRenderer({ block }: { block: StepsBlock }) {
  return (
    <ol className="space-y-2">
      {block.items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-ruberra-accent"
            style={{ background: "rgba(91,82,232,0.08)", marginTop: "2px" }}
          >
            {i + 1}
          </span>
          <span className="text-[13.5px] leading-[1.65] text-ruberra-text">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function ChecklistRenderer({ block }: { block: ChecklistBlock }) {
  return (
    <ul className="space-y-1.5">
      {block.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className={[
              "shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5",
              item.done
                ? "bg-ruberra-pulse/15 text-ruberra-pulse"
                : "bg-transparent",
            ].join(" ")}
            style={{ border: item.done ? "1px solid rgba(61,155,110,0.4)" : "1px solid #d6d4cf" }}
          >
            {item.done && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span
            className={[
              "text-[13.5px] leading-[1.65]",
              item.done ? "text-ruberra-subtext line-through" : "text-ruberra-text",
            ].join(" ")}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function InsightRenderer({ block }: { block: InsightBlock }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(91,82,232,0.05)",
        border: "1px solid rgba(91,82,232,0.15)",
        borderLeft: "3px solid rgba(91,82,232,0.5)",
      }}
    >
      <p className="text-[13.5px] leading-[1.65] text-ruberra-text">{block.text}</p>
    </div>
  );
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e2e0dc" }}>
      <table className="w-full text-[12.5px]">
        <tbody>
          {block.rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < block.rows.length - 1 ? "1px solid #e2e0dc" : undefined,
                background: i % 2 === 0 ? "transparent" : "rgba(240,239,237,0.5)",
              }}
            >
              <td className="px-3 py-2 font-medium text-ruberra-subtext w-2/5 align-top">
                {row.key}
              </td>
              <td className="px-3 py-2 text-ruberra-text align-top">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_CONFIG = {
  ok:   { dot: "bg-ruberra-pulse",    label: "text-ruberra-text" },
  warn: { dot: "bg-yellow-400",       label: "text-ruberra-text" },
  err:  { dot: "bg-red-400",          label: "text-ruberra-text" },
  info: { dot: "bg-ruberra-muted",    label: "text-ruberra-text" },
};

function StatusRenderer({ block }: { block: StatusBlock }) {
  return (
    <div className="space-y-1">
      {block.rows.map((row, i) => {
        const cfg = STATUS_CONFIG[row.state];
        return (
          <div key={i} className="flex items-center gap-2.5 px-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            <span className={`text-[12.5px] ${cfg.label}`}>{row.label}</span>
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
    case "code":      return <CodeRenderer block={block} />;
    case "steps":     return <StepsRenderer block={block} />;
    case "checklist": return <ChecklistRenderer block={block} />;
    case "insight":   return <InsightRenderer block={block} />;
    case "table":     return <TableRenderer block={block} />;
    case "status":    return <StatusRenderer block={block} />;
    default:          return null;
  }
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function RenderedOutput({ content, streaming }: RenderedOutputProps) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    // Content is still arriving or empty — show raw text
    return (
      <p className="text-[13.5px] leading-[1.65] text-ruberra-text whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
      {streaming && (
        <span className="inline-flex gap-0.5 items-end pb-0.5">
          <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:120ms]" />
          <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:240ms]" />
        </span>
      )}
    </div>
  );
}
