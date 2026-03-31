/**
 * RUBERRA Creation — Build Chamber  ·  Metamorphosis Edition
 * Home → Chat / Terminal / Archive
 */

import { useEffect, useRef } from "react";
import { type Message, type CreationView, type NavFn } from "../shell-types";
import { ChamberChat, CreationGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const CREATION_CONFIG: ChamberConfig = {
  id:          "creation",
  label:       "Creation",
  tagline:     "Build artifacts. Ship ideas.",
  placeholder: "Issue a build directive…",
  accent:      "var(--rt-amber)",
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

// ─── Archive ──────────────────────────────────────────────────────────────────

function CreationArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const pairs: { user: Message; assistant: Message | null }[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({ user: messages[i], assistant: messages[i + 1] ?? null });
    }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>Build Archive</p>
          <button onClick={() => navigate("creation", "chat")} style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}>
            ← Chat
          </button>
        </div>
        {pairs.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No build artifacts yet</p>
        ) : pairs.slice().reverse().map(({ user, assistant }, i) => (
          <div key={user.id} style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "8px", overflow: "hidden" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid var(--r-border-soft)", background: "var(--r-elevated)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)" }}>build #{pairs.length - i}</span>
              <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                {new Date(user.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ marginBottom: assistant?.content ? "8px" : 0 }}>
                <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--r-accent)", display: "block", marginBottom: "2px" }}>Directive</span>
                <p style={{ fontSize: "11px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5 }}>{user.content}</p>
              </div>
              {assistant?.content && (
                <div>
                  <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--r-subtext)", display: "block", marginBottom: "2px" }}>Output</span>
                  <p style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "monospace", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                    {assistant.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CreationMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  creationView, onCreationView, navigate, detailId: _detailId,
}: {
  messages: Message[];
  isLoading: boolean;
  draft: string;
  onDraftChange: (t: string) => void;
  onSend: (t: string) => void;
  onCancel: () => void;
  creationView: CreationView;
  onCreationView: (v: CreationView) => void;
  navigate: NavFn;
  detailId: string;
}) {
  const showHome = creationView === "home" || (!messages.length && creationView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--r-bg)", padding: "0 32px" }}>
        <div style={{ marginBottom: "8px", opacity: 0.6 }}><CreationGlyph /></div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>Creation</p>
        <p style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "center", maxWidth: "240px", lineHeight: "1.6", marginBottom: "16px" }}>
          Build artifacts. Ship ideas.
        </p>
        <button
          onClick={() => { onCreationView("chat"); onSend("Build an AI agent orchestration system blueprint with a detailed implementation plan."); }}
          style={{ fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
        >
          → Start a build session
        </button>
      </div>
    </FadeIn>
  );

  if (creationView === "archive") return <CreationArchive messages={messages} navigate={navigate} />;
  if (creationView === "terminal") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Creation · Build"
      placeholder="Write a build directive, code command, or architecture query…"
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
