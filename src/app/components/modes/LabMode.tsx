/**
 * RUBERRA Lab — Analytical Chamber  ·  Metamorphosis Edition
 * Discover → Chat / Analysis / Code / Archive / Domain / Experiment
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type Message, type LabView, type NavFn } from "../shell-types";
import { BlockRenderer, InlineMarkdown } from "../BlockRenderer";
import { ChamberChat, LabGlyph, type ChamberConfig } from "../ChamberChat";
import { LabDiscover } from "../discovery/LabDiscover";
import { LabDomainDetail } from "../detail/LabDomainDetail";
import { LabExperimentDetail } from "../detail/LabExperimentDetail";
import { RuberraTerminal } from "../RuberraTerminal";

const LAB_CONFIG: ChamberConfig = {
  id:          "lab",
  label:       "Lab",
  tagline:     "Operational research. No guardrails.",
  placeholder: "Query the Lab…",
  accent:      "var(--r-accent)",
  glyph:       <LabGlyph />,
};

// ─── Investigation Board (Analysis pane) ────────────────────────────────────────────

function InvestigationBoard({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const [view, setView] = useState<"findings" | "evidence" | "thread">("findings");

  const assistantMsgs = messages.filter((m) => m.role === "assistant" && m.content.length > 0);
  const userMsgs      = messages.filter((m) => m.role === "user");

  const allBlocks = assistantMsgs.flatMap(m => m.blocks ?? []);
  const findings  = allBlocks.filter(b => ["verdict","audit","report","evidence","signal"].includes(b.type));
  const execBlocks= allBlocks.filter(b => ["execution","blueprint","matrix","timeline"].includes(b.type));

  const TAB_STYLE = (active: boolean) => ({
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    padding: "4px 12px",
    border: "none",
    borderBottom: active ? "2px solid var(--r-accent)" : "2px solid transparent",
    background: "transparent",
    color: active ? "var(--r-text)" : "var(--r-dim)",
    cursor: "pointer",
    outline: "none",
    fontWeight: active ? 600 : 400,
  });

  if (assistantMsgs.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--r-bg)", padding: "0 32px" }}>
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
          <path d="M4 22l5-7 4 4 4-8 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8h5M4 13h8M4 18h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        </svg>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "center" }}>
          Investigation board builds as research accumulates
        </p>
        <button
          onClick={() => navigate("lab", "chat")}
          style={{ fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
        >
          → Start a query in Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--r-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--r-border)", background: "var(--r-surface)", padding: "0 24px", flexShrink: 0, gap: "0" }}>
        <button style={TAB_STYLE(view === "findings")} onClick={() => setView("findings")}>
          Findings {findings.length > 0 && `(${findings.length})`}
        </button>
        <button style={TAB_STYLE(view === "evidence")} onClick={() => setView("evidence")}>
          Plans {execBlocks.length > 0 && `(${execBlocks.length})`}
        </button>
        <button style={TAB_STYLE(view === "thread")} onClick={() => setView("thread")}>
          Thread ({userMsgs.length})
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)" }}>
          {assistantMsgs.length} outputs
        </span>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>

          {view === "findings" && (
            findings.length > 0 ? (
              findings.map((block, i) => (
                <div key={i}><BlockRenderer blocks={[block]} /></div>
              ))
            ) : (
              <div style={{ paddingTop: "24px", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                  No structured findings yet — query the Lab for verdicts, audits, or evidence blocks
                </p>
              </div>
            )
          )}

          {view === "evidence" && (
            execBlocks.length > 0 ? (
              execBlocks.map((block, i) => (
                <div key={i}><BlockRenderer blocks={[block]} /></div>
              ))
            ) : (
              <div style={{ paddingTop: "24px", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                  No execution plans or matrices yet
                </p>
              </div>
            )
          )}

          {view === "thread" && assistantMsgs.map((m, i) => (
            <div key={m.id} style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", overflow: "hidden" }}>
              {userMsgs[i] && (
                <div style={{ padding: "7px 14px", borderBottom: "1px solid var(--r-border-soft)", background: "var(--r-elevated)" }}>
                  <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", letterSpacing: "0.05em" }}>Q: </span>
                  <span style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {userMsgs[i].content.slice(0, 120)}{userMsgs[i].content.length > 120 ? "…" : ""}
                  </span>
                </div>
              )}
              <div style={{ padding: "12px 14px" }}>
                {m.blocks && m.blocks.length > 0 ? (
                  <BlockRenderer blocks={m.blocks} />
                ) : (
                  <InlineMarkdown content={m.content.slice(0, 600) + (m.content.length > 600 ? "…" : "")} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Archive ─────────────────────────────────────────────────────────────────────────────────

function LabArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const sessions = messages.filter(m => m.role === "user").reverse();
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>Lab Archive</p>
          <button onClick={() => navigate("lab", "home")} style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}>
            ← Home
          </button>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No sessions yet</p>
        ) : sessions.map((m, i) => (
          <button
            key={m.id}
            onClick={() => navigate("lab", "chat")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "6px", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
          >
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.content.slice(0, 80)}{m.content.length > 80 ? "…" : ""}
            </span>
            <span style={{ fontSize: "9px", color: "var(--r-dim)", fontFamily: "monospace", flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────────────────

export function LabMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  labView, onLabView, navigate, detailId,
}: {
  messages: Message[];
  isLoading: boolean;
  draft: string;
  onDraftChange: (t: string) => void;
  onSend: (t: string) => void;
  onCancel: () => void;
  labView: LabView;
  onLabView: (v: LabView) => void;
  navigate: NavFn;
  detailId: string;
}) {
  const showHome = labView === "home" || (!messages.length && labView === "chat");

  if (showHome) return (
    <AnimatePresence mode="wait">
      <motion.div key="lab-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <LabDiscover
          onStartSession={() => {
            onLabView("chat");
            onSend("Give me a structured analysis of the most important open problems in distributed systems, formatted as an evidence block with sources.");
          }}
          navigate={navigate}
        />
      </motion.div>
    </AnimatePresence>
  );

  if (labView === "domain")     return <LabDomainDetail     domainId={detailId}     navigate={navigate} onStartChat={(p) => { onLabView("chat"); onSend(p); }} />;
  if (labView === "experiment") return <LabExperimentDetail experimentId={detailId} navigate={navigate} onStartChat={(p) => { onLabView("chat"); onSend(p); }} />;
  if (labView === "analysis")   return <InvestigationBoard  messages={messages}     navigate={navigate} />;
  if (labView === "archive")    return <LabArchive          messages={messages}     navigate={navigate} />;
  if (labView === "code") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Lab · Code"
      placeholder="Write a code directive, analysis command, or research query…"
    />
  );

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={LAB_CONFIG}
    />
  );
}
