"use client";

import { useState, useEffect } from "react";
import { type Tab } from "./TabSwitcher";
import { type Message, type Signal, type ChamberContext } from "./types";

interface SideRailProps {
  activeTab: Tab;
  messages: Message[];
  signal: Signal;
  onContextChange: (ctx: ChamberContext) => void;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ruberra-muted/60 mb-1.5 select-none px-1">
      {children}
    </p>
  );
}

function extractSummary(content: string): string {
  return content
    .replace(/```block:\w+\n[\s\S]*?```/g, "")
    .replace(/```[\w]*\n[\s\S]*?```/g, "[code]")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

function formatAge(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function SignalFooter({
  signal,
  chamber,
}: {
  signal?: Signal;
  chamber: Tab;
}) {
  const status = signal?.status ?? "idle";
  const dotColor =
    status === "streaming" ? "#5b52e8" :
    status === "completed" ? "#3d9b6e" :
    status === "error"     ? "#dc2626" :
    "#3d9b6e";
  const label =
    status === "streaming" ? "Processing" :
    status === "completed" ? "Ready" :
    status === "error"     ? "Error" :
    "Ready";
  return (
    <div
      className="px-3 py-2 flex items-center gap-2 shrink-0"
      style={{ borderTop: "1px solid #e2e0dc" }}
    >
      <span
        className={`font-mono text-[10px] leading-none shrink-0 ${status === "streaming" ? "animate-pulse" : ""}`}
        style={{ color: dotColor }}
      >●</span>
      <span className="text-[10px] font-mono text-ruberra-subtext/70">{label}</span>
      <span className="font-mono text-[9px] text-ruberra-muted/40 ml-auto uppercase tracking-wide">{chamber}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LAB RAIL
// ---------------------------------------------------------------------------
const LAB_NAV = [
  { id: "context",  label: "Context"  },
  { id: "general",  label: "General"  },
  { id: "research", label: "Research" },
  { id: "code",     label: "Code"     },
  { id: "analysis", label: "Analysis" },
  { id: "summary",  label: "Summary"  },
];

function LabRail({
  messages,
  signal,
  onContextChange,
}: {
  messages: Message[];
  signal: Signal;
  onContextChange: (ctx: ChamberContext) => void;
}) {
  const [activeNav, setActiveNav] = useState("research");

  useEffect(() => {
    onContextChange({ labSection: activeNav });
  }, [activeNav, onContextChange]);

  const artifactMsgs = messages
    .filter((m) => m.tab === "lab" && m.role === "assistant" && !m.streaming && m.content.length > 10)
    .slice().reverse().slice(0, 4);
  const userMsgs = messages
    .filter((m) => m.tab === "lab" && m.role === "user")
    .slice().reverse().slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Nav — scrollable if needed */}
      <div className="px-3 pt-3 pb-2 shrink-0" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <SectionLabel>Context</SectionLabel>
        <div className="space-y-0.5 overflow-y-auto max-h-40">
          {LAB_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={[
                "flex items-center w-full px-2 py-1.5 rounded text-[11.5px] text-left transition-colors select-none",
                activeNav === item.id
                  ? "bg-ruberra-border/60 text-ruberra-text font-medium"
                  : "text-ruberra-subtext hover:bg-ruberra-border/30 hover:text-ruberra-text/80",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Artifacts + history */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
        <div>
          <SectionLabel>Artifacts</SectionLabel>
          {artifactMsgs.length === 0 ? (
            <p className="text-[10.5px] text-ruberra-muted px-1 italic">None yet</p>
          ) : (
            <div className="space-y-0.5">
              {artifactMsgs.map((m) => {
                const summary = extractSummary(m.content);
                return (
                  <div key={m.id} className="flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group">
                    <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 mt-0.5">●</span>
                    <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 leading-snug truncate flex-1 transition-colors">
                      {summary.slice(0, 34)}{summary.length > 34 ? "…" : ""}
                    </span>
                    <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">{formatAge(m.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {userMsgs.length > 0 && (
          <div>
            <SectionLabel>History</SectionLabel>
            <div className="space-y-0.5">
              {userMsgs.map((m) => (
                <div key={m.id} className="flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group">
                  <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 leading-snug truncate flex-1 transition-colors">
                    {m.content.slice(0, 34)}{m.content.length > 34 ? "…" : ""}
                  </span>
                  <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">{formatAge(m.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SignalFooter signal={signal} chamber="lab" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCHOOL RAIL
// ---------------------------------------------------------------------------
const CURRICULUM_MODULES = [
  { id: "foundations",   label: "Foundations",           sub: "Systems Thinking",          lessons: 6, done: 6, state: "done"    as const },
  { id: "network",       label: "Network Architecture",  sub: "Patterns",                  lessons: 8, done: 5, state: "active"  as const },
  { id: "consistency",   label: "Data Consistency",      sub: "Models",                    lessons: 7, done: 0, state: "pending" as const },
  { id: "consensus",     label: "Distributed Consensus", sub: "",                          lessons: 5, done: 0, state: "locked"  as const },
  { id: "observability", label: "Observability",         sub: "& Tracing",                 lessons: 4, done: 0, state: "locked"  as const },
];

type ModuleState = "done" | "active" | "pending" | "locked";

const MODULE_GLYPH: Record<ModuleState, { color: string; icon: string }> = {
  done:    { color: "#3d9b6e", icon: "✓" },
  active:  { color: "#5b52e8", icon: "●" },
  pending: { color: "#b8b5ae", icon: "○" },
  locked:  { color: "#d6d4cf", icon: "○" },
};

function SchoolRail({
  messages,
  onContextChange,
}: {
  messages: Message[];
  onContextChange: (ctx: ChamberContext) => void;
}) {
  const [activeModule, setActiveModule] = useState("network");

  useEffect(() => {
    onContextChange({ schoolModule: activeModule });
  }, [activeModule, onContextChange]);

  const totalLessons = CURRICULUM_MODULES.reduce((a, m) => a + m.lessons, 0);
  const doneLessons  = CURRICULUM_MODULES.reduce((a, m) => a + m.done,    0);
  const pct = Math.round((doneLessons / totalLessons) * 100);

  const userMsgs = messages
    .filter((m) => m.tab === "school" && m.role === "user")
    .slice().reverse().slice(0, 3);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Curriculum header */}
      <div className="px-3 pt-3 pb-3 shrink-0" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ruberra-muted/60 select-none mb-1">
          Curriculum
        </p>
        <p className="text-[12px] font-semibold text-ruberra-text leading-tight mb-2">
          Distributed Systems Engineering
        </p>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#5b52e8" }} />
          </div>
          <span className="font-mono text-[9.5px] text-ruberra-muted tabular-nums shrink-0">{pct}%</span>
        </div>
        <p className="text-[10px] text-ruberra-muted/60">{doneLessons}/{totalLessons} complete</p>
      </div>

      {/* Module list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {CURRICULUM_MODULES.map((mod) => {
          const cfg = MODULE_GLYPH[mod.state];
          const isLocked = mod.state === "locked";
          const isActive = mod.id === activeModule;
          return (
            <button
              key={mod.id}
              onClick={() => !isLocked && setActiveModule(mod.id)}
              disabled={isLocked}
              className={[
                "w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-colors mb-0.5",
                isActive ? "bg-ruberra-border/60" : "hover:bg-ruberra-border/30",
                isLocked ? "opacity-40 cursor-not-allowed" : "cursor-default",
              ].join(" ")}
            >
              <span className="font-mono text-[10.5px] mt-0.5 shrink-0 leading-none" style={{ color: cfg.color }}>
                {cfg.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className={[
                  "text-[11.5px] leading-snug block",
                  isActive ? "text-ruberra-text font-medium" : "text-ruberra-subtext",
                ].join(" ")}>
                  {mod.label}
                  {mod.sub ? <span className="text-ruberra-muted/60 font-normal"> {mod.sub}</span> : null}
                </span>
                <span className="font-mono text-[9.5px] text-ruberra-muted/50 block mt-0.5">
                  {isLocked ? "Locked" : `${mod.done}/${mod.lessons} lessons`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {userMsgs.length > 0 && (
        <div className="px-3 py-2 shrink-0" style={{ borderTop: "1px solid #e2e0dc" }}>
          <SectionLabel>Session</SectionLabel>
          {userMsgs.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 py-0.5">
              <span className="font-mono text-[9px] text-ruberra-muted/40">›</span>
              <span className="text-[10.5px] text-ruberra-muted/70 truncate flex-1">
                {m.content.slice(0, 30)}{m.content.length > 30 ? "…" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <SignalFooter chamber="school" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CREATION RAIL
// ---------------------------------------------------------------------------
const OUTPUT_TYPES = [
  { id: "prose",    label: "Prose",    sub: "Narratives, essays, long-form" },
  { id: "visual",   label: "Visual",   sub: "Concept imagery, diagrams"     },
  { id: "code",     label: "Code",     sub: "Scripts, functions, modules"   },
  { id: "document", label: "Document", sub: "Reports, briefs, specs"        },
  { id: "voice",    label: "Voice",    sub: "Scripts, transcripts, spoken"  },
];
const TONE_OPTIONS   = ["Precise", "Neutral", "Expressive"];
const LENGTH_OPTIONS = ["Brief", "Standard", "Extended"];

function CreationRail({
  messages,
  onContextChange,
}: {
  messages: Message[];
  onContextChange: (ctx: ChamberContext) => void;
}) {
  const [outputType, setOutputType] = useState("prose");
  const [tone, setTone]     = useState("Precise");
  const [length, setLength] = useState("Standard");

  // Wire all three params to the context whenever any changes
  useEffect(() => {
    onContextChange({
      creationOutputType: outputType,
      creationTone:       tone,
      creationLength:     length,
    });
  }, [outputType, tone, length, onContextChange]);

  const artifactMsgs = messages
    .filter((m) => m.tab === "creation" && m.role === "assistant" && !m.streaming && m.content.length > 10)
    .slice().reverse().slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Output type */}
      <div className="px-3 pt-3 pb-2 shrink-0" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <SectionLabel>Output Type</SectionLabel>
        <div className="space-y-0.5">
          {OUTPUT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setOutputType(t.id)}
              className={[
                "w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                outputType === t.id ? "bg-ruberra-border/60" : "hover:bg-ruberra-border/30",
              ].join(" ")}
            >
              <div className="flex-1 min-w-0">
                <span className={[
                  "text-[11.5px] block leading-none",
                  outputType === t.id ? "text-ruberra-text font-medium" : "text-ruberra-subtext",
                ].join(" ")}>
                  {t.label}
                </span>
                <span className="text-[9.5px] text-ruberra-muted/60 block mt-0.5 leading-snug truncate">{t.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="px-3 py-3 shrink-0" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <SectionLabel>Parameters</SectionLabel>
        <div className="mb-2.5">
          <p className="text-[9.5px] text-ruberra-muted/70 mb-1 select-none">Tone</p>
          <div className="flex gap-1">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={[
                  "flex-1 py-1 rounded text-[10px] text-center transition-colors select-none",
                  tone === t
                    ? "bg-ruberra-text text-ruberra-surface font-medium"
                    : "bg-ruberra-border/40 text-ruberra-subtext hover:bg-ruberra-border/70",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9.5px] text-ruberra-muted/70 mb-1 select-none">Length</p>
          <div className="flex gap-1">
            {LENGTH_OPTIONS.map((l) => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={[
                  "flex-1 py-1 rounded text-[10px] text-center transition-colors select-none",
                  length === l
                    ? "bg-ruberra-text text-ruberra-surface font-medium"
                    : "bg-ruberra-border/40 text-ruberra-subtext hover:bg-ruberra-border/70",
                ].join(" ")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drafts */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        <SectionLabel>Drafts</SectionLabel>
        {artifactMsgs.length === 0 ? (
          <p className="text-[10.5px] text-ruberra-muted px-1 italic">No drafts yet</p>
        ) : (
          <div className="space-y-0.5">
            {artifactMsgs.map((m) => {
              const summary = extractSummary(m.content);
              return (
                <div key={m.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group">
                  <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0">T</span>
                  <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 truncate flex-1 transition-colors">
                    {summary.slice(0, 28)}{summary.length > 28 ? "…" : ""}
                  </span>
                  <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">{formatAge(m.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SignalFooter chamber="creation" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root SideRail dispatch
// ---------------------------------------------------------------------------
export default function SideRail({ activeTab, messages, signal, onContextChange }: SideRailProps) {
  return (
    <aside
      className="w-52 shrink-0 bg-ruberra-rail flex flex-col overflow-hidden"
      style={{ boxShadow: "1px 0 0 0 #e2e0dc" }}
    >
      {activeTab === "lab"      && <LabRail      messages={messages} signal={signal} onContextChange={onContextChange} />}
      {activeTab === "school"   && <SchoolRail   messages={messages}                onContextChange={onContextChange} />}
      {activeTab === "creation" && <CreationRail messages={messages}                onContextChange={onContextChange} />}
    </aside>
  );
}
