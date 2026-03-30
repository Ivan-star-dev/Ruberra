"use client";

import { useState } from "react";
import { type CreationView, type OutputType } from "../shell/types";

interface CreationBrowseProps {
  onNavigate: (v: CreationView) => void;
  onSend:     (text: string) => void;
}

/* ── Data ───────────────────────────────────────────────────── */

interface BlueprintCard {
  id:       string;
  title:    string;
  type:     "Blueprint" | "Toolkit" | "Template" | "System" | "Pack";
  caption:  string;
  outputs:  string[];
  icon:     OutputType;
}

interface MonetizationCard {
  id:       string;
  title:    string;
  model:    string;
  revenue:  string;
  timeline: string;
  tag:      string;
}

interface ArtifactCard {
  id:      string;
  title:   string;
  format:  string;
  use:     string;
}

interface EngineCard {
  id:      string;
  title:   string;
  caption: string;
  tag:     string;
  prompt:  string;
}

const BLUEPRINTS: BlueprintCard[] = [
  { id: "b1", title: "SaaS Launch System",         type: "Blueprint", caption: "End-to-end software product launch", outputs: ["Landing page copy", "Email sequence", "Pricing framework"], icon: "document" },
  { id: "b2", title: "Creator Monetization Pack",  type: "Pack",      caption: "Digital product ecosystem builder",  outputs: ["Product outline", "Sales page", "Offer stack"],           icon: "document" },
  { id: "b3", title: "AI Consulting Framework",    type: "System",    caption: "Productize AI expertise as service",  outputs: ["Service menu", "Proposal template", "Pricing guide"],     icon: "document" },
  { id: "b4", title: "Content Engine Kit",         type: "Toolkit",   caption: "Repeatable content production system", outputs: ["Editorial calendar", "Post templates", "Repurpose map"], icon: "prose" },
  { id: "b5", title: "Technical Writing Suite",    type: "Template",  caption: "Documentation and spec writing",       outputs: ["API docs", "Architecture brief", "RFC template"],        icon: "document" },
  { id: "b6", title: "Prompt Engineering Toolkit", type: "Toolkit",   caption: "Curated prompt systems for every role", outputs: ["Prompt library", "Chain templates", "System prompts"],  icon: "code" },
];

const MONETIZATION: MonetizationCard[] = [
  { id: "m1", title: "AI Consulting Retainer",    model: "Service",      revenue: "$3k–12k/mo",  timeline: "2–4 weeks",  tag: "High Demand" },
  { id: "m2", title: "Digital Course Bundle",     model: "Product",      revenue: "$500–5k",     timeline: "3–8 weeks",  tag: "Scalable" },
  { id: "m3", title: "Prompt Pack Library",       model: "Digital",      revenue: "$29–299",     timeline: "1–2 weeks",  tag: "Fast to Build" },
  { id: "m4", title: "Technical Report Service",  model: "Service",      revenue: "$800–3k ea",  timeline: "Days",       tag: "Expert Only" },
  { id: "m5", title: "AI Workflow Automation",    model: "Product+Svc",  revenue: "$2k–15k",     timeline: "4–10 weeks", tag: "Emerging" },
  { id: "m6", title: "Creator OS Bundle",         model: "Digital",      revenue: "$97–497",     timeline: "2–4 weeks",  tag: "Trending" },
];

const ENGINES: EngineCard[] = [
  { id: "en1", title: "Long-form Essay Engine",   caption: "Research-backed analytical writing",        tag: "Prose",     prompt: "Write a strategic analysis of…"                     },
  { id: "en2", title: "Technical Brief Engine",   caption: "Structured technical documentation",         tag: "Document",  prompt: "Generate a technical brief for…"                    },
  { id: "en3", title: "Offer Builder Engine",     caption: "Sales copy and offer framing",               tag: "Copy",      prompt: "Build a compelling offer for…"                      },
  { id: "en4", title: "Script Factory",           caption: "Video, podcast, and presentation scripts",   tag: "Voice",     prompt: "Write a compelling script about…"                   },
  { id: "en5", title: "Code Architecture Draft",  caption: "System design and code scaffolding",         tag: "Code",      prompt: "Design the architecture for…"                       },
  { id: "en6", title: "Competitive Analysis",     caption: "Market and competitor intelligence",         tag: "Analysis",  prompt: "Analyze the competitive landscape for…"              },
];

const ARTIFACTS: ArtifactCard[] = [
  { id: "a1", title: "Product Positioning Doc",   format: "Document", use: "Go-to-market" },
  { id: "a2", title: "System Architecture Brief", format: "Document", use: "Technical" },
  { id: "a3", title: "Content Strategy Map",      format: "Document", use: "Marketing" },
  { id: "a4", title: "Offer Framework Canvas",    format: "Template", use: "Sales" },
  { id: "a5", title: "AI Workflow Blueprint",     format: "Blueprint", use: "Operations" },
  { id: "a6", title: "Research Synthesis Report", format: "Document", use: "Analysis" },
];

/* ── Shared ─────────────────────────────────────────────────── */

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-baseline justify-between" style={{ marginBottom: "16px" }}>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", letterSpacing: "-0.02em" }}>{title}</h2>
      {action && <button onClick={onAction} style={{ fontSize: "12px", color: "var(--r-subtext)" }}>{action} →</button>}
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

const TYPE_COLOR: Record<string, string> = {
  Blueprint: "var(--r-accent)",
  Toolkit:   "var(--r-ok)",
  Template:  "var(--r-subtext)",
  System:    "var(--r-warn)",
  Pack:      "var(--r-accent)",
};

/* ── Blueprint card ─────────────────────────────────────────── */

function BlueprintCardUI({ card, onOpen }: { card: BlueprintCard; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        width:           "220px",
        flexShrink:      0,
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        overflow:        "hidden",
        transition:      "border-color 0.15s, box-shadow 0.15s",
        boxShadow:       hovered ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Top color strip */}
      <div
        style={{
          height:          "4px",
          backgroundColor: TYPE_COLOR[card.type] ?? "var(--r-border)",
        }}
      />
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="flex items-start justify-between" style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontSize:        "9px",
              padding:         "2px 8px",
              borderRadius:    "999px",
              color:           TYPE_COLOR[card.type],
              backgroundColor: `${TYPE_COLOR[card.type]}14`,
              border:          `1px solid ${TYPE_COLOR[card.type]}30`,
              fontWeight:      500,
            }}
          >
            {card.type}
          </span>
        </div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--r-text)", marginBottom: "5px", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
          {card.title}
        </p>
        <p style={{ fontSize: "10px", color: "var(--r-subtext)", marginBottom: "12px", lineHeight: "1.4", flex: 1 }}>
          {card.caption}
        </p>
        <div className="flex flex-col gap-1">
          {card.outputs.map(o => (
            <div key={o} className="flex items-center gap-1.5">
              <span style={{ width: "4px", height: "4px", borderRadius: "999px", backgroundColor: "var(--r-border)", display: "block", flexShrink: 0 }} />
              <span style={{ fontSize: "10px", color: "var(--r-dim)" }}>{o}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Monetization card ──────────────────────────────────────── */

function MonetizationCardUI({ card }: { card: MonetizationCard }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex:            "1 1 220px",
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px 18px",
        cursor:          "pointer",
        transition:      "border-color 0.15s",
      }}
    >
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--r-text)", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
          {card.title}
        </p>
        <span
          style={{
            fontSize:        "9px",
            padding:         "2px 8px",
            borderRadius:    "999px",
            backgroundColor: "var(--r-border-soft)",
            color:           "var(--r-subtext)",
            whiteSpace:      "nowrap",
            flexShrink:      0,
          }}
        >
          {card.tag}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <p style={{ fontSize: "9px", color: "var(--r-dim)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue</p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--r-ok)" }}>{card.revenue}</p>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "var(--r-border)" }} />
        <div>
          <p style={{ fontSize: "9px", color: "var(--r-dim)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Build time</p>
          <p style={{ fontSize: "12px", color: "var(--r-text-2)" }}>{card.timeline}</p>
        </div>
        <div style={{ width: "1px", height: "28px", backgroundColor: "var(--r-border)" }} />
        <div>
          <p style={{ fontSize: "9px", color: "var(--r-dim)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Model</p>
          <p style={{ fontSize: "12px", color: "var(--r-text-2)" }}>{card.model}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Engine card ────────────────────────────────────────────── */

function EngineCardUI({ engine, onRun }: { engine: EngineCard; onRun: (p: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="text-left flex flex-col"
      onClick={() => onRun(engine.prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:           "200px",
        flexShrink:      0,
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px",
        transition:      "border-color 0.15s",
      }}
    >
      <span
        style={{
          fontSize:        "9px",
          padding:         "2px 8px",
          borderRadius:    "999px",
          backgroundColor: "var(--r-border-soft)",
          color:           "var(--r-dim)",
          marginBottom:    "10px",
          display:         "inline-block",
        }}
      >
        {engine.tag}
      </span>
      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--r-text)", marginBottom: "5px", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
        {engine.title}
      </p>
      <p style={{ fontSize: "10px", color: "var(--r-subtext)", lineHeight: "1.4", flex: 1 }}>
        {engine.caption}
      </p>
      <p style={{ fontSize: "10px", color: "var(--r-accent)", marginTop: "10px" }}>
        Launch engine →
      </p>
    </button>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */

function CreationHero({ onNavigate, onSend }: { onNavigate: () => void; onSend: (t: string) => void }) {
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
      <div className="flex items-start justify-between gap-8">
        <div style={{ flex: 1 }}>
          <p
            className="font-mono"
            style={{ fontSize: "9px", color: "var(--r-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}
          >
            Creation Studio
          </p>
          <h1
            style={{
              fontSize:      "22px",
              fontWeight:    700,
              color:         "var(--r-text)",
              letterSpacing: "-0.03em",
              lineHeight:    "1.25",
              marginBottom:  "8px",
              maxWidth:      "380px",
            }}
          >
            Build, package, and ship intelligence.
          </h1>
          <p style={{ fontSize: "13px", color: "var(--r-subtext)", marginBottom: "20px", maxWidth: "360px", lineHeight: "1.5" }}>
            Turn knowledge into artifacts. Build products, write briefs, generate systems, and create outputs worth selling.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigate}
              style={{
                padding:         "9px 20px",
                borderRadius:    "8px",
                backgroundColor: "var(--r-cta-bg)",
                color:           "var(--r-cta-text)",
                fontSize:        "13px",
                fontWeight:      500,
              }}
            >
              Open Studio
            </button>
            <button
              onClick={() => onSend("Build a strategic product brief for a new AI tool")}
              style={{
                padding:         "9px 16px",
                borderRadius:    "8px",
                border:          "1px solid var(--r-border)",
                backgroundColor: "transparent",
                color:           "var(--r-text-2)",
                fontSize:        "13px",
              }}
            >
              Quick Generate
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="flex gap-4 shrink-0"
          style={{ paddingTop: "4px" }}
        >
          {[
            { label: "Output Types",  value: "5" },
            { label: "Blueprints",    value: "24" },
            { label: "Engines",       value: "12" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--r-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "var(--r-dim)", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────── */

export default function CreationBrowse({ onNavigate, onSend }: CreationBrowseProps) {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "var(--r-bg)", padding: "28px 32px 48px" }}
    >
      {/* Hero */}
      <CreationHero
        onNavigate={() => onNavigate("create")}
        onSend={text => { onNavigate("create"); onSend(text); }}
      />

      {/* Blueprints */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Blueprints & Systems" action="All blueprints" />
        <Rail>
          {BLUEPRINTS.map(b => (
            <BlueprintCardUI
              key={b.id}
              card={b}
              onOpen={() => { onNavigate("create"); onSend(`Build a ${b.title.toLowerCase()}`); }}
            />
          ))}
        </Rail>
      </div>

      {/* Engines */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Content Engines" />
        <Rail>
          {ENGINES.map(e => (
            <EngineCardUI
              key={e.id}
              engine={e}
              onRun={text => { onNavigate("create"); onSend(text); }}
            />
          ))}
        </Rail>
      </div>

      {/* Monetization paths */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Monetization Paths" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {MONETIZATION.map(m => <MonetizationCardUI key={m.id} card={m} />)}
        </div>
      </div>
    </div>
  );
}
