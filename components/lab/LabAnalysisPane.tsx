"use client";

import { useState } from "react";
import { type Message } from "../shell/types";

interface LabAnalysisPaneProps {
  messages: Message[];
}

interface Section {
  id:       string;
  label:    string;
  summary:  string;
  items:    string[];
  kind:     "evidence" | "signal" | "protocol" | "synthesis";
}

function deriveSections(messages: Message[]): Section[] {
  const assistantMsgs = messages.filter((m) => m.role === "assistant" && m.content.length > 0);
  if (assistantMsgs.length === 0) return [];

  return assistantMsgs.slice(-6).reverse().map((m, i) => {
    const wordCount = m.content.trim().split(/\s+/).length;
    const hasNumbers = /\d+/.test(m.content);
    const kind: Section["kind"] =
      i === 0               ? "synthesis" :
      hasNumbers            ? "evidence"  :
      wordCount > 60        ? "protocol"  :
      "signal";

    return {
      id:      m.id,
      label:   `Response ${assistantMsgs.length - i}`,
      summary: m.content.slice(0, 90) + (m.content.length > 90 ? "…" : ""),
      items:   m.content.split(". ").filter(s => s.trim().length > 10).slice(0, 4),
      kind,
    };
  });
}

const KIND_COLOR: Record<Section["kind"], string> = {
  synthesis: "var(--r-accent)",
  evidence:  "var(--r-ok)",
  protocol:  "var(--r-warn)",
  signal:    "var(--r-subtext)",
};

const KIND_LABEL: Record<Section["kind"], string> = {
  synthesis: "Synthesis",
  evidence:  "Evidence",
  protocol:  "Protocol",
  signal:    "Signal",
};

export default function LabAnalysisPane({ messages }: LabAnalysisPaneProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const sections = deriveSections(messages);

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none"
        style={{ color: "var(--r-dim)" }}>
        <AnalysisGlyph />
        <p className="text-xs tracking-wide" style={{ color: "var(--r-subtext)" }}>
          Analysis layers appear as responses accumulate
        </p>
        <p className="text-[10px]" style={{ color: "var(--r-dim)" }}>
          Start a query in Chat to build the record
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 animate-panel-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-medium tracking-tight" style={{ color: "var(--r-text)" }}>
          Analysis Layers
        </h2>
        <span className="text-[10px] font-mono" style={{ color: "var(--r-subtext)" }}>
          {sections.length} records
        </span>
      </div>

      {/* Layer cards */}
      {sections.map((sec) => (
        <div key={sec.id}
          className="border rounded overflow-hidden transition-all duration-150"
          style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>

          {/* Collapsed header — always visible */}
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left group transition-colors duration-150"
            onClick={() => toggle(sec.id)}
            style={{ backgroundColor: open[sec.id] ? "var(--r-elevated)" : "transparent" }}>
            <span className="w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: KIND_COLOR[sec.kind] }} />
            <span className="flex-1 min-w-0">
              <span className="text-xs font-medium" style={{ color: "var(--r-text)" }}>
                {sec.label}
              </span>
              <span className="ml-2 text-[9px] uppercase tracking-widest"
                style={{ color: KIND_COLOR[sec.kind] }}>
                {KIND_LABEL[sec.kind]}
              </span>
            </span>
            <span className="text-[10px]" style={{ color: "var(--r-dim)" }}>
              {open[sec.id] ? "▾" : "▸"}
            </span>
          </button>

          {/* Summary — always visible */}
          <div className="px-4 pb-2">
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--r-subtext)" }}>
              {sec.summary}
            </p>
          </div>

          {/* Expanded drilldown */}
          {open[sec.id] && (
            <div className="px-4 pb-3 pt-1 border-t space-y-1.5 animate-panel-in"
              style={{ borderColor: "var(--r-border-soft)" }}>
              {sec.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: KIND_COLOR[sec.kind] }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--r-text)" }}>
                    {item.trim()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Meta strip */}
      <div className="pt-2 flex items-center gap-4 border-t"
        style={{ borderColor: "var(--r-border-soft)" }}>
        <MetaItem label="responses" value={String(sections.length)} />
        <MetaItem label="queries"   value={String(messages.filter(m => m.role === "user").length)} />
        <MetaItem label="depth"     value={sections.length > 3 ? "high" : sections.length > 1 ? "medium" : "low"} />
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--r-dim)" }}>{label}</span>
      <span className="text-[10px] font-mono" style={{ color: "var(--r-subtext)" }}>{value}</span>
    </div>
  );
}

function AnalysisGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
      <path d="M4 22l5-7 4 4 4-8 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 8h5M4 13h8M4 18h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
