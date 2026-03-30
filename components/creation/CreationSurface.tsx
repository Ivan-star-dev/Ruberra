"use client";

/**
 * CREATION CANON — LOCKED STANDARD
 * Visual law: mineral/light shell, r-* tokens, clean sans body, mono labels.
 * Left panel: OUTPUT TYPE + PARAMETERS. Right: prompt bar + chips + prose output.
 * Dark Generate button. No terminal-dark regime. No neon.
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { type Message, type OutputType, type CreationParams } from "../shell/types";

interface CreationSurfaceProps {
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}

const OUTPUT_TYPES: { id: OutputType; label: string; caption: string; icon: React.ReactNode }[] = [
  { id: "prose",    label: "Prose",    caption: "Narrative, essays, long-form",      icon: <IcT /> },
  { id: "visual",   label: "Visual",   caption: "Concept imagery, diagrams",         icon: <IcVisual /> },
  { id: "code",     label: "Code",     caption: "Scripts, functions, modules",       icon: <IcCode /> },
  { id: "document", label: "Document", caption: "Reports, briefs, specs",            icon: <IcDoc /> },
  { id: "voice",    label: "Voice",    caption: "Scripts, transcripts, spoken",      icon: <IcMic /> },
];

const DEFAULT_PARAMS: CreationParams = {
  outputType: "prose",
  tone:       "precise",
  length:     "standard",
  audience:   "expert",
};

export default function CreationSurface({ messages, isLoading, onSend }: CreationSurfaceProps) {
  const [params, setParams]   = useState<CreationParams>(DEFAULT_PARAMS);
  const [draft, setDraft]     = useState("");
  const textRef               = useRef<HTMLTextAreaElement>(null);
  const lastAssistant         = messages.filter(m => m.role === "assistant" && m.content.length > 0).at(-1);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
  }, [draft]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft("");
    onSend(text);
  }

  return (
    <div className="flex flex-1 min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* ── Left: Output type + Parameters ── */}
      <div
        className="shrink-0 flex flex-col border-r overflow-y-auto"
        style={{
          width:           "220px",
          borderColor:     "var(--r-border)",
          backgroundColor: "var(--r-surface)",
        }}
      >
        {/* OUTPUT TYPE */}
        <div style={{ padding: "18px 0 12px" }}>
          <p
            className="font-mono uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--r-dim)", padding: "0 16px", marginBottom: "8px" }}
          >
            Output Type
          </p>
          {OUTPUT_TYPES.map(ot => {
            const isActive = params.outputType === ot.id;
            return (
              <button
                key={ot.id}
                onClick={() => setParams(p => ({ ...p, outputType: ot.id }))}
                className="w-full text-left flex items-start gap-3 transition-colors duration-100"
                style={{
                  padding:         "9px 16px",
                  backgroundColor: isActive ? "var(--r-border-soft)" : "transparent",
                }}
              >
                <span style={{ color: "var(--r-subtext)", flexShrink: 0, marginTop: "1px" }}>{ot.icon}</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: isActive ? 500 : 400, color: "var(--r-text)" }}>{ot.label}</p>
                  <p style={{ fontSize: "10px", color: "var(--r-dim)", lineHeight: "1.4" }}>{ot.caption}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--r-border)" }} />

        {/* PARAMETERS */}
        <div style={{ padding: "14px 16px" }}>
          <p
            className="font-mono uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--r-dim)", marginBottom: "12px" }}
          >
            Parameters
          </p>

          <ParamGroup
            label="Tone"
            options={["Precise", "Neutral", "Expressive", "Formal"]}
            active={capitalize(params.tone)}
            onSelect={v => setParams(p => ({ ...p, tone: v.toLowerCase() as CreationParams["tone"] }))}
          />
          <ParamGroup
            label="Length"
            options={["Brief", "Standard", "Extended"]}
            active={capitalize(params.length)}
            onSelect={v => setParams(p => ({ ...p, length: v.toLowerCase() as CreationParams["length"] }))}
          />
          <ParamGroup
            label="Audience"
            options={["Expert", "General", "Executive"]}
            active={capitalize(params.audience)}
            onSelect={v => setParams(p => ({ ...p, audience: v.toLowerCase() as CreationParams["audience"] }))}
          />
        </div>
      </div>

      {/* ── Right: Prompt + output ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Prompt bar */}
        <div
          className="shrink-0 flex items-center gap-3 border-b"
          style={{
            padding:         "10px 16px",
            borderColor:     "var(--r-border)",
            backgroundColor: "var(--r-surface)",
          }}
        >
          {/* Sparkle icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ color: "var(--r-subtext)", flexShrink: 0 }}>
            <path d="M8 1l1.5 4 4 1.5-4 1.5L8 12l-1.5-4L2.5 6.5l4-1.5L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>

          {/* Prompt textarea */}
          <textarea
            ref={textRef}
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder="Write a strategic analysis of…"
            className="flex-1 bg-transparent outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{ fontSize: "13px", color: "var(--r-text)", minHeight: "22px", maxHeight: "80px" }}
          />

          {/* Model selector */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            style={{
              padding:         "4px 10px",
              borderRadius:    "6px",
              border:          "1px solid var(--r-border)",
              backgroundColor: "var(--r-surface)",
              fontSize:        "11px",
              color:           "var(--r-subtext)",
            }}
          >
            RUBERRA-7B
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Generate button */}
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="flex items-center gap-2 transition-colors duration-150 disabled:opacity-40"
            style={{
              padding:         "6px 14px",
              borderRadius:    "8px",
              backgroundColor: "var(--r-cta-bg)",
              color:           "var(--r-cta-text)",
              fontSize:        "13px",
              fontWeight:      500,
              flexShrink:      0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 4 4 1.5-4 1.5L7 11l-1.5-4L1.5 5.5l4-1.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Generate
          </button>
        </div>

        {/* Output area */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
          {lastAssistant ? (
            <>
              {/* Chip row */}
              <div className="flex items-center gap-2 flex-wrap mb-5">
                <Chip label={capitalize(params.outputType)} active />
                <Chip label={capitalize(params.tone)} />
                <Chip label={capitalize(params.audience)} />
                <Chip label={capitalize(params.length)} />

                {/* Right: action icons */}
                <div className="flex-1" />
                <button style={{ color: "var(--r-dim)" }} title="Download">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v8M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
                <button style={{ color: "var(--r-dim)" }} title="Share">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5.5 7.2l5-3.2M5.5 8.8l5 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
                <button style={{ color: "var(--r-dim)" }} title="Regenerate">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8a6 6 0 1110.4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M12 3.5V7h-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Prose output */}
              <div style={{ maxWidth: "680px" }}>
                {lastAssistant.content.split(/\n\n+/).map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize:     "14px",
                      lineHeight:   "1.75",
                      color:        "var(--r-text)",
                      marginBottom: "16px",
                    }}
                  >
                    {para.trim()}
                  </p>
                ))}
              </div>
            </>
          ) : (
            /* Empty state */
            <div
              className="h-full flex flex-col items-center justify-center select-none"
              style={{ paddingBottom: "40px" }}
            >
              <p style={{ fontSize: "13px", color: "var(--r-dim)" }}>
                Enter a directive above and press Generate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared primitives ─────────────────────────────────────── */

function ParamGroup({
  label, options, active, onSelect,
}: {
  label:    string;
  options:  string[];
  active:   string;
  onSelect: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p style={{ fontSize: "11px", color: "var(--r-subtext)", marginBottom: "6px" }}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className="transition-colors duration-100"
            style={{
              fontSize:        "11px",
              padding:         "3px 9px",
              borderRadius:    "999px",
              border:          "1px solid var(--r-border)",
              backgroundColor: active === o ? "var(--r-chip-active)" : "var(--r-chip-bg)",
              color:           active === o ? "var(--r-cta-text)" : "var(--r-subtext)",
              fontWeight:      active === o ? 500 : 400,
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        fontSize:        "11px",
        padding:         "3px 10px",
        borderRadius:    "999px",
        border:          "1px solid var(--r-border)",
        backgroundColor: active ? "var(--r-chip-active)" : "var(--r-chip-bg)",
        color:           active ? "var(--r-cta-text)" : "var(--r-subtext)",
        fontWeight:      active ? 500 : 400,
      }}
    >
      {label}
    </span>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Icons ──────────────────────────────────────────────────── */
function IcT() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10M8 4v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IcVisual() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 11l4-3 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcCode() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M5 5L2 8l3 3M11 5l3 3-3 3M9 3l-2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcDoc() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l4 4v8H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9h4M6 12h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function IcMic() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 9a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 14v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
