/**
 * RUBERRA School — Learning Chamber  ·  Metamorphosis Edition
 * Home → Chat / Library / Archive
 */

import { useEffect, useRef, useState } from "react";
import { type Message, type SchoolView, type NavFn } from "../shell-types";
import { ChamberChat, SchoolGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const SCHOOL_CONFIG: ChamberConfig = {
  id:          "school",
  label:       "School",
  tagline:     "Structured learning. Deep mastery.",
  placeholder: "Ask the School…",
  accent:      "var(--r-ok)",
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

// ─── Library ──────────────────────────────────────────────────────────────────

interface Resource {
  id: string; title: string; category: string; desc: string;
  kind: "framework" | "blueprint" | "reference" | "guide" | "track";
}

const LIBRARY: Resource[] = [
  { id: "r1", title: "First Principles Thinking", category: "Frameworks", desc: "Break any problem to its foundational axioms before reasoning upward.", kind: "framework" },
  { id: "r2", title: "Feynman Technique", category: "Frameworks", desc: "Teach what you learn, expose gaps, simplify until mastered.", kind: "framework" },
  { id: "r3", title: "Zettelkasten Method", category: "Blueprints", desc: "Networked note system for building a living knowledge graph.", kind: "blueprint" },
  { id: "r4", title: "Spaced Repetition", category: "Blueprints", desc: "Review intervals timed to the forgetting curve for lasting retention.", kind: "blueprint" },
  { id: "r5", title: "Systems Thinking", category: "Frameworks", desc: "Understand feedback loops, emergence, and leverage points.", kind: "framework" },
  { id: "r6", title: "Analytical Reading", category: "Guides", desc: "Active reading as dialogue: question, annotate, synthesize, judge.", kind: "guide" },
  { id: "r7", title: "Mental Models Index", category: "References", desc: "Curated mental models from physics, mathematics, and psychology.", kind: "reference" },
  { id: "r8", title: "Deep Work Protocol", category: "Guides", desc: "Structure focused sessions to produce cognitively demanding output.", kind: "guide" },
  { id: "r9", title: "Logic & Argumentation", category: "Tracks", desc: "From syllogisms to informal fallacies — clean reasoning foundation.", kind: "track" },
  { id: "r10", title: "Research Methods", category: "Tracks", desc: "Empirical design, evidence hierarchy, and analytical writing.", kind: "track" },
];

const CATEGORIES = ["All", "Frameworks", "Blueprints", "Guides", "References", "Tracks"];

const KIND_ACCENT: Record<Resource["kind"], string> = {
  framework: "var(--r-accent)",
  blueprint: "var(--r-ok)",
  guide:     "var(--r-warn)",
  reference: "var(--r-subtext)",
  track:     "var(--r-pulse)",
};

function SchoolLibrary({ navigate }: { navigate: NavFn }) {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = filter === "All" ? LIBRARY : LIBRARY.filter(r => r.category === filter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--r-bg)" }}>
      <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid var(--r-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>Library</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-subtext)" }}>{visible.length} resources</span>
            <button onClick={() => navigate("school", "chat")} style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}>
              ← Chat
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{ flexShrink: 0, fontSize: "10px", padding: "3px 10px", borderRadius: "3px", border: "none", cursor: "pointer", outline: "none", background: filter === cat ? "var(--r-border)" : "transparent", color: filter === cat ? "var(--r-text)" : "var(--r-subtext)", transition: "all 0.1s ease" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "680px", margin: "0 auto" }}>
          {visible.map(resource => (
            <div
              key={resource.id}
              style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", overflow: "hidden" }}
            >
              <button
                onClick={() => setExpanded(expanded === resource.id ? null : resource.id)}
                style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", outline: "none", textAlign: "left" }}
              >
                <span style={{ width: "3px", borderRadius: "2px", alignSelf: "stretch", maxHeight: "16px", marginTop: "2px", flexShrink: 0, background: KIND_ACCENT[resource.kind] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif" }}>{resource.title}</span>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: KIND_ACCENT[resource.kind] }}>{resource.kind}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5 }}>{resource.desc}</p>
                </div>
                <span style={{ fontSize: "10px", color: "var(--r-dim)", flexShrink: 0, marginTop: "2px" }}>{expanded === resource.id ? "▾" : "▸"}</span>
              </button>

              {expanded === resource.id && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--r-border-soft)" }}>
                  <p style={{ fontSize: "11px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6, marginTop: "10px" }}>
                    {resource.desc} This is a structured learning resource within the School chamber.
                    Ask the School AI to guide you through it, generate a study plan, or produce examples.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--r-dim)" }}>category</span>
                    <span style={{ fontSize: "10px", color: "var(--r-subtext)" }}>{resource.category}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function SchoolArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
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
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>Study Archive</p>
          <button onClick={() => navigate("school", "chat")} style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}>
            ← Chat
          </button>
        </div>
        {pairs.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No study sessions yet</p>
        ) : pairs.slice().reverse().map(({ user, assistant }, i) => (
          <div key={user.id} style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "8px", overflow: "hidden" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid var(--r-border-soft)", background: "var(--r-elevated)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)" }}>#{pairs.length - i}</span>
              <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                {new Date(user.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ marginBottom: assistant?.content ? "8px" : 0 }}>
                <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--r-accent)", display: "block", marginBottom: "2px" }}>Study Query</span>
                <p style={{ fontSize: "11px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5 }}>{user.content}</p>
              </div>
              {assistant?.content && (
                <div>
                  <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--r-subtext)", display: "block", marginBottom: "2px" }}>Guide Response</span>
                  <p style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
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

export function SchoolMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  schoolView, onSchoolView, navigate, detailId: _detailId,
}: {
  messages: Message[];
  isLoading: boolean;
  draft: string;
  onDraftChange: (t: string) => void;
  onSend: (t: string) => void;
  onCancel: () => void;
  schoolView: SchoolView;
  onSchoolView: (v: SchoolView) => void;
  navigate: NavFn;
  detailId: string;
}) {
  const showHome = schoolView === "home" || (!messages.length && schoolView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--r-bg)", padding: "0 32px" }}>
        <div style={{ marginBottom: "8px", opacity: 0.6 }}><SchoolGlyph /></div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>School</p>
        <p style={{ fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "center", maxWidth: "240px", lineHeight: "1.6", marginBottom: "16px" }}>
          Structured learning. Deep mastery.
        </p>
        <button
          onClick={() => { onSchoolView("chat"); onSend("Teach me distributed consensus from first principles, with a mastery check at the end."); }}
          style={{ fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
        >
          → Start a study session
        </button>
      </div>
    </FadeIn>
  );

  if (schoolView === "library") return <SchoolLibrary navigate={navigate} />;
  if (schoolView === "archive") return <SchoolArchive messages={messages} navigate={navigate} />;

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={SCHOOL_CONFIG}
    />
  );
}
