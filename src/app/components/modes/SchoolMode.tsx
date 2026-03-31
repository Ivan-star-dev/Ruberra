/**
 * RUBERRA School — Learning Chamber  ·  Metamorphosis Edition
 * Home → Chat / Library / Archive / Track / Lesson / Role / Browse
 */

import { useEffect, useRef } from "react";
import { type Message, type SchoolView, type NavFn } from "../shell-types";
import { BlockRenderer } from "../BlockRenderer";
import { ChamberChat, SchoolGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const SCHOOL_CONFIG: ChamberConfig = {
  id:          "school",
  label:       "School",
  tagline:     "Deep learning. First principles. Mastery.",
  placeholder: "Ask the School…",
  accent:      "var(--r-accent)",
  glyph:       <SchoolGlyph />,
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

// ─── School Home ──────────────────────────────────────────────────────────────

function SchoolHome({ onStartSession, navigate }: { onStartSession: () => void; navigate: NavFn }) {
  const topics = [
    { label: "Distributed Systems",     hint: "consensus · CAP · Raft" },
    { label: "Machine Learning Theory", hint: "gradients · optimization" },
    { label: "Cryptography",            hint: "ZKP · TLS · elliptic curves" },
    { label: "Operating Systems",       hint: "scheduling · memory · IPC" },
    { label: "Compilers & PL Theory",   hint: "parsing · types · IR" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--r-bg)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ opacity: 0.5, marginBottom: "16px" }}><SchoolGlyph /></div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              School
            </p>
            <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 }}>
              Learn from first principles. Build durable knowledge.
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
              Start a session →
            </button>
            <button
              onClick={() => navigate("school", "library")}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "transparent", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--r-text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--r-subtext)"; }}
            >
              Library
            </button>
          </div>

          {/* Topic list */}
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Browse topics
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {topics.map(({ label, hint }) => (
              <button
                key={label}
                onClick={() => navigate("school", "chat")}
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

// ─── Library ──────────────────────────────────────────────────────────────────

function SchoolLibrary({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const lessonBlocks = messages
    .filter((m) => m.role === "assistant" && m.blocks && m.blocks.length > 0)
    .flatMap((m) => (m.blocks ?? []).filter((b) => b.type === "lesson"));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Lesson Library
          </p>
          <button
            onClick={() => navigate("school", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>

        {lessonBlocks.length === 0 ? (
          <div style={{ paddingTop: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              No lessons yet — start a learning session in Chat
            </p>
            <button
              onClick={() => navigate("school", "chat")}
              style={{ marginTop: "12px", fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
            >
              → Go to Chat
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lessonBlocks.map((block, i) => (
              <div key={i}><BlockRenderer blocks={[block]} /></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function SchoolArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const sessions = messages.filter((m) => m.role === "user").reverse();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            School Archive
          </p>
          <button
            onClick={() => navigate("school", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No sessions yet</p>
        ) : (
          sessions.map((m, i) => (
            <button
              key={m.id}
              onClick={() => navigate("school", "chat")}
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

export function SchoolMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  schoolView, onSchoolView, navigate, detailId,
}: {
  messages:       Message[];
  isLoading:      boolean;
  draft:          string;
  onDraftChange:  (t: string) => void;
  onSend:         (t: string) => void;
  onCancel:       () => void;
  schoolView:     SchoolView;
  onSchoolView:   (v: SchoolView) => void;
  navigate:       NavFn;
  detailId:       string;
}) {
  const showHome = schoolView === "home" || (!messages.length && schoolView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SchoolHome
        onStartSession={() => {
          onSchoolView("chat");
          onSend("Teach me distributed consensus from first principles, starting with the core problem and building up to modern algorithms.");
        }}
        navigate={navigate}
      />
    </FadeIn>
  );

  if (schoolView === "library")  return <SchoolLibrary  messages={messages} navigate={navigate} />;
  if (schoolView === "archive")  return <SchoolArchive  messages={messages} navigate={navigate} />;

  if (schoolView === "track" || schoolView === "lesson" || schoolView === "role" || schoolView === "browse") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="School · Deep Study"
      placeholder="Enter a topic or learning directive…"
    />
  );

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={SCHOOL_CONFIG}
    />
  );
}
