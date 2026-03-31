/**
 * RUBERRA Creation — Build Chamber  ·  Metamorphosis Edition
 * Home → Chat / Terminal / Archive / Blueprint / Engine / Artifact
 */

import { useEffect, useRef } from "react";
import { type Message, type CreationView, type NavFn } from "../shell-types";
import { BlockRenderer } from "../BlockRenderer";
import { ChamberChat, CreationGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const CREATION_CONFIG: ChamberConfig = {
  id:          "creation",
  label:       "Creation",
  tagline:     "Architect. Build. Ship. No compromises.",
  placeholder: "Describe what you want to build…",
  accent:      "var(--r-accent)",
  glyph:       <CreationGlyph />,
};

// ─── Fade wrapper ─────────────────────────────────────────────────────────────

function FadeIn({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.18s ease";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}

// ─── Creation Home ────────────────────────────────────────────────────────────

function CreationHome({ onStartSession, navigate, onSend }: { onStartSession: () => void; navigate: NavFn; onSend: (t: string) => void }) {
  const starters = [
    { label: "Build a distributed job queue",          hint: "architecture · eng" },
    { label: "Design an AI agent orchestration system", hint: "blueprint · plan" },
    { label: "Create a technical API specification",    hint: "spec · REST" },
    { label: "Draft an executive strategy brief",       hint: "brief · leadership" },
    { label: "Generate a secure service architecture",  hint: "security · infra" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--r-bg)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ opacity: 0.5, marginBottom: "16px" }}><CreationGlyph /></div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              Creation
            </p>
            <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 }}>
              Build real things. Blueprint to artifact in one flow.
            </p>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            <button
              onClick={onStartSession}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
            >
              Start building →
            </button>
            <button
              onClick={() => navigate("creation", "terminal")}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "transparent", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--r-text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--r-subtext)"; }}
            >
              Terminal
            </button>
          </div>

          {/* Starter directives */}
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Quick directives
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {starters.map(({ label, hint }) => (
              <button
                key={label}
                onClick={() => onSend(label)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</span>
                <span style={{ fontSize: "10px", color: "var(--r-dim)", fontFamily: "monospace" }}>{hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Blueprint view ───────────────────────────────────────────────────────────

function CreationBlueprint({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const blueprintBlocks = messages
    .filter((m) => m.role === "assistant" && m.blocks && m.blocks.length > 0)
    .flatMap((m) => (m.blocks ?? []).filter((b) => ["execution", "creation", "blueprint"].includes(b.type)));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Blueprint
          </p>
          <button
            onClick={() => navigate("creation", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>

        {blueprintBlocks.length === 0 ? (
          <div style={{ paddingTop: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              No blueprints yet — generate execution plans or architecture specs in Chat
            </p>
            <button
              onClick={() => navigate("creation", "chat")}
              style={{ marginTop: "12px", fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
            >
              → Go to Chat
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {blueprintBlocks.map((block, i) => (
              <div key={i}><BlockRenderer blocks={[block]} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function CreationArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const sessions = messages.filter((m) => m.role === "user").reverse();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Creation Archive
          </p>
          <button
            onClick={() => navigate("creation", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No builds yet</p>
        ) : (
          sessions.map((m, i) => (
            <button
              key={m.id}
              onClick={() => navigate("creation", "chat")}
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
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CreationMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  creationView, onCreationView, navigate, detailId,
}: {
  messages:        Message[];
  isLoading:       boolean;
  draft:           string;
  onDraftChange:   (t: string) => void;
  onSend:          (t: string) => void;
  onCancel:        () => void;
  creationView:    CreationView;
  onCreationView:  (v: CreationView) => void;
  navigate:        NavFn;
  detailId:        string;
}) {
  const showHome = creationView === "home" || (!messages.length && creationView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <CreationHome
        onStartSession={() => {
          onCreationView("chat");
          onSend("Design an AI agent orchestration system: define the interface contract, execution model, and error boundary strategy.");
        }}
        navigate={navigate}
        onSend={(t) => { onCreationView("chat"); onSend(t); }}
      />
    </FadeIn>
  );

  if (creationView === "terminal" || creationView === "engine") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Creation · Build Terminal"
      placeholder="Enter a build directive, spec request, or architecture query…"
    />
  );

  if (creationView === "blueprint") return <CreationBlueprint messages={messages} navigate={navigate} />;
  if (creationView === "archive")   return <CreationArchive   messages={messages} navigate={navigate} />;

  if (creationView === "artifact") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Creation · Artifacts"
      placeholder="Refine or export your artifact…"
    />
  );

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={CREATION_CONFIG}
    />
  );
}
