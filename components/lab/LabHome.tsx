"use client";

import { useState } from "react";
import { type LabView } from "../shell/types";

interface LabHomeProps {
  onNavigate: (v: LabView) => void;
  onSend:     (text: string) => void;
}

/* Context tab bar at top of Lab */
function ContextTabs({
  active,
  onSelect,
}: {
  active: LabView;
  onSelect: (v: LabView) => void;
}) {
  const tabs: { id: LabView; label: string }[] = [
    { id: "research",  label: "Research"  },
    { id: "analysis",  label: "Analysis"  },
    { id: "code",      label: "Code"      },
    { id: "general",   label: "General"   },
  ];

  return (
    <div
      className="flex items-center gap-1 border-b"
      style={{
        padding:         "0 20px",
        height:          "44px",
        borderColor:     "var(--r-border)",
        backgroundColor: "var(--r-surface)",
      }}
    >
      {/* CONTEXT label */}
      <span
        className="font-mono select-none mr-3"
        style={{
          fontSize:      "10px",
          letterSpacing: "0.1em",
          color:         "var(--r-dim)",
          textTransform: "uppercase",
        }}
      >
        CONTEXT
      </span>

      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="transition-all duration-100 select-none"
            style={{
              fontSize:        "13px",
              fontWeight:      isActive ? 500 : 400,
              padding:         "4px 12px",
              borderRadius:    "6px",
              backgroundColor: isActive ? "var(--r-pill-bg)" : "transparent",
              color:           isActive ? "var(--r-pill-text)" : "var(--r-subtext)",
            }}
          >
            {tab.label}
          </button>
        );
      })}

      {/* New session — right aligned */}
      <div className="flex-1" />
      <button
        className="flex items-center gap-1.5 transition-colors duration-100 select-none"
        style={{
          fontSize:     "12px",
          color:        "var(--r-subtext)",
          padding:      "4px 8px",
        }}
      >
        <span className="w-3 h-3 rounded-full border" style={{ borderColor: "var(--r-dim)" }} />
        New session
      </button>
    </div>
  );
}

/* 2×2 Action cards */
const ACTION_CARDS = [
  {
    id:      "research" as LabView,
    title:   "Research",
    caption: "Explore and synthesize",
    icon:    <IcSearch />,
  },
  {
    id:      "analysis" as LabView,
    title:   "Analyze",
    caption: "Reason through evidence",
    icon:    <IcChart />,
  },
  {
    id:      "code" as LabView,
    title:   "Code",
    caption: "Write and debug code",
    icon:    <IcCode />,
  },
  {
    id:      "general" as LabView,
    title:   "Audit",
    caption: "Review and verify sources",
    icon:    <IcAudit />,
  },
];

const SUGGESTED = [
  "Distributed consensus models",
  "CQRS vs event sourcing",
  "Service mesh patterns",
];

export default function LabHome({ onNavigate, onSend }: LabHomeProps) {
  const [activeContext, setActiveContext] = useState<LabView>("research");

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>
      <ContextTabs active={activeContext} onSelect={v => { setActiveContext(v); onNavigate(v); }} />

      {/* Main centered content */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "0 24px 48px" }}>

        {/* Flask icon */}
        <div
          className="flex items-center justify-center mb-5"
          style={{
            width:           "52px",
            height:          "52px",
            backgroundColor: "var(--r-panel)",
            border:          "1px solid var(--r-border)",
            borderRadius:    "14px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--r-subtext)" }}>
            <path d="M9 3h6M8 3v8L4 19a1 1 0 001 1h14a1 1 0 001-1l-4-8V3"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 15h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-medium text-center"
          style={{
            fontSize:      "22px",
            color:         "var(--r-text)",
            letterSpacing: "-0.02em",
            marginBottom:  "8px",
          }}
        >
          What are you investigating?
        </h1>

        {/* Subtitle */}
        <p
          className="text-center"
          style={{
            fontSize:     "13px",
            color:        "var(--r-subtext)",
            marginBottom: "32px",
            maxWidth:     "340px",
          }}
        >
          Start a research thread, analyze a system, or open a code investigation.
        </p>

        {/* 2×2 action cards */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            gap:                 "10px",
            width:               "100%",
            maxWidth:            "440px",
            marginBottom:        "32px",
          }}
        >
          {ACTION_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="flex items-center gap-3 text-left transition-all duration-150"
              style={{
                padding:         "14px 16px",
                backgroundColor: "var(--r-surface)",
                border:          "1px solid var(--r-border)",
                borderRadius:    "10px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--r-subtext)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--r-border)";
              }}
            >
              <span style={{ color: "var(--r-subtext)", flexShrink: 0 }}>{card.icon}</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--r-text)", marginBottom: "1px" }}>
                  {card.title}
                </p>
                <p style={{ fontSize: "11px", color: "var(--r-subtext)" }}>{card.caption}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Suggested topics */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="transition-colors duration-100"
              style={{ fontSize: "12px", color: "var(--r-dim)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--r-subtext)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--r-dim)")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function IcSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IcChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M2 13l4-5 3 3 3-5 4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcCode() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M6 5L2 9l4 4M12 5l4 4-4 4M10 3l-2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcAudit() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 9h8M5 6h6M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
