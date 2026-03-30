"use client";

import { useState } from "react";
import { type LabView } from "../shell/types";

interface LabBrowseProps {
  onNavigate: (v: LabView) => void;
  onSend:     (text: string) => void;
}

/* ── Data ───────────────────────────────────────────────────── */

interface ToolCard {
  id:      string;
  title:   string;
  caption: string;
  tag:     string;
  view:    LabView;
  icon:    "search" | "chart" | "code" | "audit" | "sim" | "signal" | "map" | "data";
}

interface ExperimentCard {
  id:       string;
  title:    string;
  domain:   string;
  steps:    number;
  duration: string;
  type:     "Research" | "Simulation" | "Audit" | "Analysis";
}

interface SignalCard {
  id:      string;
  label:   string;
  value:   string;
  change:  string;
  up:      boolean;
  domain:  string;
}

const TOOL_CARDS: ToolCard[] = [
  { id: "t1", title: "Deep Research",       caption: "Investigate any topic end-to-end",         tag: "Research",    view: "research",  icon: "search"  },
  { id: "t2", title: "Evidence Analysis",   caption: "Reason through data and arguments",         tag: "Analysis",    view: "analysis",  icon: "chart"   },
  { id: "t3", title: "Code Intelligence",   caption: "Write, debug, and audit systems",           tag: "Code",        view: "code",      icon: "code"    },
  { id: "t4", title: "Source Audit",        caption: "Verify, rank, and cross-reference",         tag: "Audit",       view: "general",   icon: "audit"   },
  { id: "t5", title: "Simulation Engine",   caption: "Model scenarios and stress-test logic",     tag: "Simulation",  view: "research",  icon: "sim"     },
  { id: "t6", title: "Signal Mapping",      caption: "Track patterns across domains",             tag: "Signals",     view: "analysis",  icon: "signal"  },
  { id: "t7", title: "Systems Mapping",     caption: "Build and interrogate system models",       tag: "Systems",     view: "research",  icon: "map"     },
  { id: "t8", title: "Data Interrogation",  caption: "Extract structure from raw input",          tag: "Data",        view: "analysis",  icon: "data"    },
];

const EXPERIMENTS: ExperimentCard[] = [
  { id: "e1", title: "Distributed Consensus Models",     domain: "Systems",    steps: 4, duration: "40 min", type: "Research"   },
  { id: "e2", title: "LLM Reasoning Under Uncertainty",  domain: "AI",         steps: 5, duration: "55 min", type: "Analysis"   },
  { id: "e3", title: "Microservices Failure Modes",      domain: "Systems",    steps: 6, duration: "1h 10m", type: "Simulation" },
  { id: "e4", title: "Epistemic Constraints in DS",      domain: "AI",         steps: 3, duration: "30 min", type: "Audit"      },
  { id: "e5", title: "Competitive Moat Analysis",        domain: "Strategy",   steps: 4, duration: "45 min", type: "Analysis"   },
  { id: "e6", title: "Network Partition Scenarios",      domain: "Systems",    steps: 5, duration: "50 min", type: "Simulation" },
];

const SIGNALS: SignalCard[] = [
  { id: "s1", label: "AI Agent Adoption",  value: "73%", change: "+12%", up: true,  domain: "Technology" },
  { id: "s2", label: "Remote Work Demand", value: "61%", change: "-4%",  up: false, domain: "Labor"      },
  { id: "s3", label: "LLM API Usage",      value: "4.1B", change: "+28%", up: true, domain: "AI"         },
  { id: "s4", label: "Startup Formation",  value: "18K", change: "+9%",  up: true,  domain: "Economy"    },
];

const TYPE_COLOR: Record<string, string> = {
  Research:   "var(--r-accent)",
  Simulation: "var(--r-warn)",
  Audit:      "var(--r-ok)",
  Analysis:   "var(--r-subtext)",
};

/* ── Icon renderer ──────────────────────────────────────────── */

function LabIcon({ type, size = 18 }: { type: ToolCard["icon"]; size?: number }) {
  const s = size;
  const icons: Record<ToolCard["icon"], React.ReactNode> = {
    search: <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    chart:  <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 14l4-5 3 3 3-5 4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    code:   <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M7 6L3 10l4 4M13 6l4 4-4 4M11 4l-2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    audit:  <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 10h8M6 7h5M6 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    sim:    <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 10h3l2-4 4 8 2-4h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    signal: <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.2"/><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/></svg>,
    map:    <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 5l5 2 4-2 5 2v10l-5-2-4 2-5-2V5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 7v10M12 5v10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
    data:   <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="6" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6" stroke="currentColor" strokeWidth="1.3"/><path d="M4 10v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" stroke="currentColor" strokeWidth="1.2"/></svg>,
  };
  return <>{icons[type]}</>;
}

/* ── Shared ─────────────────────────────────────────────────── */

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-baseline justify-between" style={{ marginBottom: "16px" }}>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      {action && (
        <button onClick={onAction} style={{ fontSize: "12px", color: "var(--r-subtext)" }}>
          {action} →
        </button>
      )}
    </div>
  );
}

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: "8px", scrollbarWidth: "none" }}>
      {children}
    </div>
  );
}

/* ── Tool card ──────────────────────────────────────────────── */

function ToolCardUI({ tool, onClick }: { tool: ToolCard; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="text-left flex flex-col"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:           "188px",
        flexShrink:      0,
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px",
        transition:      "border-color 0.15s",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width:           "36px",
          height:          "36px",
          backgroundColor: "var(--r-panel)",
          borderRadius:    "8px",
          color:           "var(--r-subtext)",
          marginBottom:    "12px",
        }}
      >
        <LabIcon type={tool.icon} />
      </div>
      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--r-text)", marginBottom: "4px", letterSpacing: "-0.01em" }}>
        {tool.title}
      </p>
      <p style={{ fontSize: "10px", color: "var(--r-subtext)", lineHeight: "1.4", marginBottom: "10px", flex: 1 }}>
        {tool.caption}
      </p>
      <span
        style={{
          fontSize:        "9px",
          padding:         "2px 8px",
          borderRadius:    "999px",
          backgroundColor: "var(--r-border-soft)",
          color:           "var(--r-dim)",
          alignSelf:       "flex-start",
        }}
      >
        {tool.tag}
      </span>
    </button>
  );
}

/* ── Experiment card ────────────────────────────────────────── */

function ExperimentCardUI({ exp, onSend }: { exp: ExperimentCard; onSend: (t: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSend(exp.title)}
      style={{
        flex:            "1 1 240px",
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px 18px",
        transition:      "border-color 0.15s",
      }}
    >
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--r-text)", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
          {exp.title}
        </p>
        <span
          style={{
            fontSize:     "9px",
            padding:      "2px 8px",
            borderRadius: "999px",
            color:        TYPE_COLOR[exp.type],
            backgroundColor: `${TYPE_COLOR[exp.type]}14`,
            border:       `1px solid ${TYPE_COLOR[exp.type]}30`,
            whiteSpace:   "nowrap",
            fontWeight:   500,
            flexShrink:   0,
          }}
        >
          {exp.type}
        </span>
      </div>
      <p style={{ fontSize: "10px", color: "var(--r-dim)", marginBottom: "10px" }}>
        {exp.domain} · {exp.steps} steps · {exp.duration}
      </p>
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: "10px", color: "var(--r-subtext)" }}>Open investigation →</span>
      </div>
    </div>
  );
}

/* ── Signal card ────────────────────────────────────────────── */

function SignalCardUI({ signal }: { signal: SignalCard }) {
  return (
    <div
      style={{
        flex:            "1 1 140px",
        backgroundColor: "var(--r-surface)",
        border:          "1px solid var(--r-border)",
        borderRadius:    "10px",
        padding:         "16px",
      }}
    >
      <p style={{ fontSize: "9px", color: "var(--r-dim)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {signal.domain}
      </p>
      <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--r-text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
        {signal.value}
      </p>
      <p style={{ fontSize: "10px", color: "var(--r-dim)", marginBottom: "6px" }}>{signal.label}</p>
      <span
        style={{
          fontSize:   "10px",
          color:      signal.up ? "var(--r-ok)" : "var(--r-err)",
          fontWeight: 500,
        }}
      >
        {signal.change}
      </span>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */

function LabHero({ onSend }: { onSend: (t: string) => void }) {
  const [draft, setDraft] = useState("");

  return (
    <div
      style={{
        backgroundColor: "var(--r-surface)",
        border:          "1px solid var(--r-border)",
        borderRadius:    "14px",
        padding:         "28px 32px 24px",
        marginBottom:    "32px",
      }}
    >
      <div className="flex items-start gap-6">
        <div style={{ flex: 1 }}>
          <p
            className="font-mono"
            style={{ fontSize: "9px", color: "var(--r-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}
          >
            Intelligence Laboratory
          </p>
          <h1
            style={{
              fontSize:      "22px",
              fontWeight:    700,
              color:         "var(--r-text)",
              letterSpacing: "-0.03em",
              lineHeight:    "1.25",
              marginBottom:  "8px",
              maxWidth:      "400px",
            }}
          >
            Investigate anything. Simulate everything.
          </h1>
          <p style={{ fontSize: "13px", color: "var(--r-subtext)", marginBottom: "20px", maxWidth: "380px", lineHeight: "1.5" }}>
            Open a research thread, stress-test a system, audit a claim, or map a domain.
          </p>

          {/* Quick prompt bar */}
          <div
            className="flex items-center gap-2"
            style={{
              backgroundColor: "var(--r-bg)",
              border:          "1px solid var(--r-border)",
              borderRadius:    "8px",
              padding:         "8px 12px",
              maxWidth:        "460px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--r-dim)", flexShrink: 0 }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onSend(draft.trim()); setDraft(""); }}}
              placeholder="What are you investigating today?"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: "var(--r-text)", minWidth: 0 }}
            />
            <button
              onClick={() => { if (draft.trim()) { onSend(draft.trim()); setDraft(""); }}}
              disabled={!draft.trim()}
              style={{
                padding:         "4px 12px",
                borderRadius:    "6px",
                backgroundColor: draft.trim() ? "var(--r-cta-bg)" : "var(--r-border)",
                color:           draft.trim() ? "var(--r-cta-text)" : "var(--r-dim)",
                fontSize:        "12px",
                fontWeight:      500,
                flexShrink:      0,
                transition:      "all 0.15s",
              }}
            >
              Investigate
            </button>
          </div>

          {/* Quick starters */}
          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "12px" }}>
            {["Distributed consensus", "LLM reasoning limits", "CQRS vs event sourcing", "Service mesh patterns"].map(s => (
              <button
                key={s}
                onClick={() => onSend(s)}
                style={{
                  fontSize:        "11px",
                  padding:         "3px 10px",
                  borderRadius:    "999px",
                  border:          "1px solid var(--r-border)",
                  backgroundColor: "transparent",
                  color:           "var(--r-subtext)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Signal strip */}
        <div
          className="flex flex-col gap-2 shrink-0"
          style={{ minWidth: "140px" }}
        >
          {SIGNALS.map(s => <SignalCardUI key={s.id} signal={s} />)}
        </div>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────── */

export default function LabBrowse({ onNavigate, onSend }: LabBrowseProps) {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "var(--r-bg)", padding: "28px 32px 48px" }}
    >
      {/* Hero */}
      <LabHero onSend={text => { onNavigate("research"); onSend(text); }} />

      {/* Tool library */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Intelligence Tools" />
        <Rail>
          {TOOL_CARDS.map(t => (
            <ToolCardUI
              key={t.id}
              tool={t}
              onClick={() => onNavigate(t.view)}
            />
          ))}
        </Rail>
      </div>

      {/* Experiment catalog */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Experiments & Investigations" action="All experiments" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {EXPERIMENTS.map(e => (
            <ExperimentCardUI
              key={e.id}
              exp={e}
              onSend={text => { onNavigate("research"); onSend(text); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
