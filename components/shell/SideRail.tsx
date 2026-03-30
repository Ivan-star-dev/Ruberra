"use client";

import { useState } from "react";
import { type Tab } from "./TabSwitcher";
import { type Message, type Signal, type SignalStatus } from "./types";

interface SideRailProps {
  activeTab: Tab;
  messages: Message[];
  signal: Signal;
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ruberra-muted/60 mb-2 select-none px-1">
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

// ---------------------------------------------------------------------------
// LAB RAIL — Figma: icon nav + context sections + artifact/history
// ---------------------------------------------------------------------------

const LAB_NAV = [
  { id: "context",  label: "Context" },
  { id: "general",  label: "General" },
  { id: "research", label: "Research" },
  { id: "code",     label: "Code" },
  { id: "analysis", label: "Analysis" },
  { id: "summary",  label: "Summary" },
];

function LabRail({ messages, signal }: { messages: Message[]; signal: Signal }) {
  const [activeNav, setActiveNav] = useState("research");

  const artifactMsgs = messages
    .filter((m) => m.tab === "lab" && m.role === "assistant" && !m.streaming && m.content.length > 10)
    .slice().reverse().slice(0, 4);

  const userMsgs = messages
    .filter((m) => m.tab === "lab" && m.role === "user")
    .slice().reverse().slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      {/* Context navigation tabs */}
      <div className="px-3 pt-3 pb-2" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <SectionLabel>Context</SectionLabel>
        <div className="flex flex-col gap-0.5">
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

      {/* Artifacts */}
      <div className="px-3 pt-3 pb-2 flex-1 min-h-0 overflow-y-auto">
        <SectionLabel>Artifacts</SectionLabel>
        <div className="space-y-0.5">
          {artifactMsgs.length === 0 ? (
            <p className="text-[11px] text-ruberra-muted px-1 italic">No artifacts yet</p>
          ) : (
            artifactMsgs.map((m) => {
              const summary = extractSummary(m.content);
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group"
                >
                  <span className="font-mono text-[9px] text-ruberra-muted/50 shrink-0 mt-0.5">●</span>
                  <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 leading-snug truncate flex-1 transition-colors">
                    {summary.slice(0, 36)}{summary.length > 36 ? "…" : ""}
                  </span>
                  <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">
                    {formatAge(m.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* History */}
        {userMsgs.length > 0 && (
          <div className="mt-4">
            <SectionLabel>History</SectionLabel>
            <div className="space-y-0.5">
              {userMsgs.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group"
                >
                  <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 leading-snug truncate flex-1 transition-colors">
                    {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
                  </span>
                  <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">
                    {formatAge(m.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Signal row */}
      <LabSignalFooter signal={signal} />
    </div>
  );
}

function LabSignalFooter({ signal }: { signal: Signal }) {
  const dotColor =
    signal.status === "streaming" ? "#5b52e8" :
    signal.status === "completed" ? "#3d9b6e" :
    signal.status === "error"     ? "#dc2626" :
    "#3d9b6e";
  const label =
    signal.status === "streaming" ? "Streaming" :
    signal.status === "completed" ? "Ready" :
    signal.status === "error"     ? "Error" :
    "Ready";

  return (
    <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderTop: "1px solid #e2e0dc" }}>
      <span
        className={`font-mono text-[10px] shrink-0 ${signal.status === "streaming" ? "animate-pulse" : ""}`}
        style={{ color: dotColor }}
      >●</span>
      <span className="text-[10px] font-mono text-ruberra-subtext/70">{label}</span>
      <span className="font-mono text-[9px] text-ruberra-muted/40 ml-auto uppercase tracking-wide">lab</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCHOOL RAIL — Figma: curriculum module list with progress, lesson state
// ---------------------------------------------------------------------------

const CURRICULUM_MODULES = [
  { id: "foundations",   label: "Foundations of Systems Thinking",    lessons: 6,  done: 6,  state: "done"    as const },
  { id: "network",       label: "Network Architecture Patterns",       lessons: 8,  done: 5,  state: "active"  as const },
  { id: "consistency",   label: "Data Consistency Models",             lessons: 7,  done: 0,  state: "pending" as const },
  { id: "consensus",     label: "Distributed Consensus",               lessons: 5,  done: 0,  state: "locked"  as const },
  { id: "observability", label: "Observability & Tracing",             lessons: 4,  done: 0,  state: "locked"  as const },
];

type ModuleState = "done" | "active" | "pending" | "locked";

const MODULE_DOT: Record<ModuleState, { color: string; label: string }> = {
  done:    { color: "#3d9b6e", label: "✓" },
  active:  { color: "#5b52e8", label: "●" },
  pending: { color: "#b8b5ae", label: "○" },
  locked:  { color: "#d6d4cf", label: "○" },
};

function SchoolRail({ messages }: { messages: Message[] }) {
  const [activeModule, setActiveModule] = useState("network");

  const totalLessons = CURRICULUM_MODULES.reduce((a, m) => a + m.lessons, 0);
  const doneLessons = CURRICULUM_MODULES.reduce((a, m) => a + m.done, 0);
  const pct = Math.round((doneLessons / totalLessons) * 100);

  const userMsgs = messages
    .filter((m) => m.tab === "school" && m.role === "user")
    .slice().reverse().slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* Curriculum header */}
      <div className="px-3 pt-3 pb-3" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ruberra-muted/60 select-none mb-1">
          Curriculum
        </p>
        <p className="text-[12.5px] font-semibold text-ruberra-text leading-tight mb-2">
          Distributed Systems Engineering
        </p>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#e2e0dc" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: "#5b52e8" }}
            />
          </div>
          <span className="font-mono text-[9.5px] text-ruberra-muted tabular-nums shrink-0">{pct}%</span>
        </div>
        <p className="text-[10px] text-ruberra-muted/60">{doneLessons} of {totalLessons} lessons complete</p>
      </div>

      {/* Module list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {CURRICULUM_MODULES.map((mod) => {
          const cfg = MODULE_DOT[mod.state];
          const isLocked = mod.state === "locked";
          const isActive = mod.id === activeModule;
          return (
            <button
              key={mod.id}
              onClick={() => !isLocked && setActiveModule(mod.id)}
              disabled={isLocked}
              className={[
                "w-full flex items-start gap-2.5 px-2 py-2 rounded-md text-left transition-colors mb-0.5",
                isActive ? "bg-ruberra-border/60" : "hover:bg-ruberra-border/30",
                isLocked ? "opacity-40 cursor-not-allowed" : "cursor-default",
              ].join(" ")}
            >
              <span className="font-mono text-[11px] mt-0.5 shrink-0" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
              <div className="flex-1 min-w-0">
                <span className={[
                  "text-[11.5px] leading-snug block",
                  isActive ? "text-ruberra-text font-medium" : "text-ruberra-subtext",
                ].join(" ")}>
                  {mod.label}
                </span>
                {mod.state !== "locked" && (
                  <span className="font-mono text-[9.5px] text-ruberra-muted/60 block mt-0.5">
                    {mod.done} of {mod.lessons} lessons
                  </span>
                )}
                {mod.state === "locked" && (
                  <span className="font-mono text-[9.5px] text-ruberra-muted/40 block mt-0.5">Locked</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Session history */}
      {userMsgs.length > 0 && (
        <div className="px-3 py-2" style={{ borderTop: "1px solid #e2e0dc" }}>
          <SectionLabel>Session</SectionLabel>
          {userMsgs.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 py-1">
              <span className="font-mono text-[9px] text-ruberra-muted/40">›</span>
              <span className="text-[11px] text-ruberra-muted/70 truncate flex-1">
                {m.content.slice(0, 32)}{m.content.length > 32 ? "…" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: "1px solid #e2e0dc" }}>
        <span className="font-mono text-[10px] text-ruberra-pulse">●</span>
        <span className="text-[10px] font-mono text-ruberra-subtext/70">Ready</span>
        <span className="font-mono text-[9px] text-ruberra-muted/40 ml-auto uppercase tracking-wide">school</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CREATION RAIL — Figma: output type selector + parameters + drafts
// ---------------------------------------------------------------------------

const OUTPUT_TYPES = [
  { id: "prose",    label: "Prose",    sub: "Narratives, essays, long-form" },
  { id: "visual",   label: "Visual",   sub: "Concept imagery, diagrams" },
  { id: "code",     label: "Code",     sub: "Scripts, functions, modules" },
  { id: "document", label: "Document", sub: "Reports, briefs, specs" },
  { id: "voice",    label: "Voice",    sub: "Scripts, transcripts, spoken" },
];

const TONE_OPTIONS  = ["Precise", "Neutral", "Expressive"];
const LENGTH_OPTIONS = ["Brief", "Standard", "Extended"];

function CreationRail({ messages }: { messages: Message[] }) {
  const [outputType, setOutputType] = useState("prose");
  const [tone, setTone] = useState("Precise");
  const [length, setLength] = useState("Standard");

  const artifactMsgs = messages
    .filter((m) => m.tab === "creation" && m.role === "assistant" && !m.streaming && m.content.length > 10)
    .slice().reverse().slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      {/* Output type */}
      <div className="px-3 pt-3 pb-2" style={{ borderBottom: "1px solid #e2e0dc" }}>
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
      <div className="px-3 py-3 flex-1" style={{ borderBottom: "1px solid #e2e0dc" }}>
        <SectionLabel>Parameters</SectionLabel>

        <div className="mb-3">
          <p className="text-[9.5px] text-ruberra-muted/70 mb-1.5 select-none">Tone</p>
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
          <p className="text-[9.5px] text-ruberra-muted/70 mb-1.5 select-none">Length</p>
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
      <div className="px-3 py-2 flex-1 overflow-y-auto min-h-0">
        <SectionLabel>Drafts</SectionLabel>
        {artifactMsgs.length === 0 ? (
          <p className="text-[11px] text-ruberra-muted px-1 italic">No drafts yet</p>
        ) : (
          artifactMsgs.map((m) => {
            const summary = extractSummary(m.content);
            return (
              <div
                key={m.id}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ruberra-border/40 cursor-default transition-colors group"
              >
                <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0">T</span>
                <span className="text-[11px] text-ruberra-subtext group-hover:text-ruberra-text/80 truncate flex-1 transition-colors">
                  {summary.slice(0, 28)}{summary.length > 28 ? "…" : ""}
                </span>
                <span className="font-mono text-[9px] text-ruberra-muted/40 shrink-0 tabular-nums">
                  {formatAge(m.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: "1px solid #e2e0dc" }}>
        <span className="font-mono text-[10px] text-ruberra-pulse">●</span>
        <span className="text-[10px] font-mono text-ruberra-subtext/70">Ready</span>
        <span className="font-mono text-[9px] text-ruberra-muted/40 ml-auto uppercase tracking-wide">creation</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root SideRail — dispatches per-chamber
// ---------------------------------------------------------------------------

const SIGNAL_DOT_CLASS: Record<SignalStatus, string> = {
  idle:      "bg-ruberra-pulse/50",
  streaming: "bg-ruberra-accent animate-pulse",
  completed: "bg-ruberra-pulse",
  error:     "bg-red-400",
};

export default function SideRail({ activeTab, messages, signal }: SideRailProps) {
  void SIGNAL_DOT_CLASS; // used in chamber rails above
  return (
    <aside
      className="w-52 shrink-0 bg-ruberra-rail flex flex-col overflow-hidden"
      style={{ boxShadow: "1px 0 0 0 #e2e0dc" }}
    >
      {activeTab === "lab"      && <LabRail      messages={messages} signal={signal} />}
      {activeTab === "school"   && <SchoolRail   messages={messages} />}
      {activeTab === "creation" && <CreationRail messages={messages} />}
    </aside>
  );
}
