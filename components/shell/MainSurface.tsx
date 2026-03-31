"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import {
  type Tab,
  type Message,
  type LabView,
  type SchoolView,
  type CreationView,
} from "./types";
import { BlockRenderer } from "./blocks/index";
import LabAnalysisPane   from "../lab/LabAnalysisPane";
import LabCodeOrgan      from "../lab/LabCodeOrgan";
import LabArchive        from "../lab/LabArchive";
import SchoolLibrary     from "../school/SchoolLibrary";
import SchoolArchive     from "../school/SchoolArchive";
import CreationSurface   from "../creation/CreationSurface";
import CreationTerminal  from "../creation/CreationTerminal";
import CreationArchive   from "../creation/CreationArchive";

interface MainSurfaceProps {
  activeTab:     Tab;
  messages:      Message[];
  isLoading:     boolean;
  draft:         string;
  onDraftChange: (text: string) => void;
  onSend:        (text: string) => void;
  onCancel:      () => void;
  labView:       LabView;
  schoolView:    SchoolView;
  creationView:  CreationView;
}

const CHAMBER: Record<Tab, { name: string; tagline: string; placeholder: string }> = {
  lab:      { name: "Lab",      tagline: "Operational research. No guardrails.",            placeholder: "Query the Lab…" },
  school:   { name: "School",   tagline: "Structured progression. First principles first.",  placeholder: "Ask School…" },
  creation: { name: "Creation", tagline: "Output engine. Directive in, artifact out.",       placeholder: "Directive…" },
};

type ExecStatus = "idle" | "thinking" | "streaming";

export default function MainSurface({
  activeTab,
  messages,
  isLoading,
  draft,
  onDraftChange,
  onSend,
  onCancel,
  labView,
  schoolView,
  creationView,
}: MainSurfaceProps) {
  // ── Route to alternate views ─────────────────────────────────────────────

  // Lab
  if (activeTab === "lab" && labView === "analysis") {
    return <LabAnalysisPane messages={messages} />;
  }
  if (activeTab === "lab" && labView === "code") {
    return <LabCodeOrgan messages={messages} isLoading={isLoading} onSend={onSend} />;
  }
  if (activeTab === "lab" && labView === "archive") {
    return <LabArchive messages={messages} />;
  }

  // School
  if (activeTab === "school" && schoolView === "library") {
    return <SchoolLibrary />;
  }
  if (activeTab === "school" && schoolView === "archive") {
    return <SchoolArchive messages={messages} />;
  }

  // Creation
  if (activeTab === "creation" && creationView === "chat") {
    return <CreationSurface messages={messages} isLoading={isLoading} onSend={onSend} />;
  }
  if (activeTab === "creation" && creationView === "terminal") {
    return <CreationTerminal messages={messages} isLoading={isLoading} onSend={onSend} />;
  }
  if (activeTab === "creation" && creationView === "archive") {
    return <CreationArchive messages={messages} />;
  }

  // ── Default: Chat surface ─────────────────────────────────────────────────
  return (
    <ChatSurface
      activeTab={activeTab}
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
    />
  );
}

/* ── Chat surface ───────────────────────────────────────────────────────── */

interface ChatSurfaceProps {
  activeTab:     Tab;
  messages:      Message[];
  isLoading:     boolean;
  draft:         string;
  onDraftChange: (text: string) => void;
  onSend:        (text: string) => void;
  onCancel:      () => void;
}

function ChatSurface({
  activeTab,
  messages,
  isLoading,
  draft,
  onDraftChange,
  onSend,
  onCancel,
}: ChatSurfaceProps) {
  const threadRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { name, tagline, placeholder } = CHAMBER[activeTab];

  const execStatus: ExecStatus = !isLoading
    ? "idle"
    : messages.length > 0 &&
      messages[messages.length - 1].role === "assistant" &&
      messages[messages.length - 1].content.length > 0
    ? "streaming"
    : "thinking";

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && isLoading) { onCancel(); return; }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); textareaRef.current?.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onCancel]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    onDraftChange("");
    onSend(text);
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* Thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto py-8 scroll-smooth">
        <div className="max-w-[680px] mx-auto w-full px-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 pt-24 select-none">
              <ChamberGlyph tab={activeTab} />
              <div className="text-center space-y-1.5">
                <h1
                  className="text-base font-semibold tracking-tight"
                  style={{ color: "var(--r-text)", letterSpacing: "-0.015em" }}
                >
                  {name}
                </h1>
                <p
                  className="text-sm text-center max-w-[240px] leading-relaxed"
                  style={{ color: "var(--r-subtext)" }}
                >
                  {tagline}
                </p>
              </div>
              {/* Seed prompts */}
              <ChamberSeedPrompts tab={activeTab} onSend={onSend} />
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} tab={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Execution status strip */}
      <div className="max-w-[680px] mx-auto w-full px-8">
        <div className="h-6 flex items-center justify-between">
          {execStatus !== "idle" && (
            <>
              <span className="flex items-center gap-2">
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--r-accent)", animation: "pulse 1.4s ease-in-out infinite" }}
                />
                <span
                  className="font-mono text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: "var(--r-accent)" }}
                >
                  {execStatus === "thinking" ? "reasoning" : "streaming"}
                </span>
              </span>
              <button
                onClick={onCancel}
                className="font-mono text-[9px] tracking-wide transition-colors duration-150"
                style={{ color: "var(--r-muted)" }}
                aria-label="Cancel stream"
              >
                esc
              </button>
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="max-w-[680px] mx-auto w-full px-8 pb-6 pt-1">
        <div
          className="flex items-end gap-3 px-4 py-3 border transition-all duration-200"
          style={{
            backgroundColor: "var(--r-surface)",
            borderColor: "var(--r-border)",
            borderRadius: "6px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* Chamber indicator */}
          <span
            className="font-mono text-[9px] tracking-widest uppercase pb-0.5 shrink-0 select-none"
            style={{ color: CHAMBER_ACCENT_COLOR[activeTab] }}
          >
            {activeTab.slice(0, 3)}
          </span>
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed disabled:opacity-40"
            style={{ color: "var(--r-text)", minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="transition-all duration-150 shrink-0 pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--r-subtext)" }}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] mt-1.5 ml-1 select-none" style={{ color: "var(--r-dim)" }}>
          Enter to send · Shift+Enter for newline · Esc to stop · ⌘K to focus
        </p>
      </div>
    </main>
  );
}

/* ── Chamber accent color per tab ────────────────────────────────────────── */

const CHAMBER_ACCENT_COLOR: Record<Tab, string> = {
  lab:      "var(--r-accent)",
  school:   "var(--r-ok)",
  creation: "var(--r-warn)",
};

/* ── Message bubble ─────────────────────────────────────────────────────── */

const CHAMBER_USER_BG: Record<Tab, string> = {
  lab:      "var(--r-accent-dim)",
  school:   "color-mix(in srgb, var(--r-ok) 10%, var(--r-surface))",
  creation: "color-mix(in srgb, var(--r-warn) 8%, var(--r-surface))",
};

const CHAMBER_AGENT_LABEL: Record<Tab, string> = {
  lab:      "RUBERRA · LAB",
  school:   "RUBERRA · SCHOOL",
  creation: "RUBERRA · CREATION",
};

// Strip the DSL markup from content before rendering as prose
function cleanContent(content: string): string {
  if (!content.includes("TYPE:")) return content;
  const lines = content.split("\n");
  const prose: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("TYPE:") || t.startsWith("TITLE:") || t.startsWith("STATUS:") ||
        t.startsWith("SECTION:") || t.startsWith("NEXT:") || t.startsWith("TAGS:") ||
        t.startsWith("PROGRESS:") || t.startsWith("- ")) {
      inBlock = true;
      continue;
    }
    if (!inBlock && t.length > 0) prose.push(line);
    if (inBlock && t.length === 0) inBlock = false;
  }
  return prose.join("\n").trim();
}

function MessageBubble({ msg, tab }: { msg: Message; tab: Tab }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[72%] px-4 py-3 text-sm leading-relaxed border"
          style={{
            backgroundColor: CHAMBER_USER_BG[tab],
            borderColor: "transparent",
            color: "var(--r-text)",
            borderRadius: "8px 8px 2px 8px",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  // Assistant bubble
  const hasBlocks  = msg.blocks && msg.blocks.length > 0;
  const proseText  = hasBlocks ? cleanContent(msg.content) : msg.content;
  const isThinking = !msg.content && !hasBlocks;

  return (
    <div className="flex justify-start">
      <div className="w-full">
        {/* Agent label row */}
        <div className="flex items-center gap-2 mb-2.5">
          <AgentIndicator tab={tab} />
          <span
            className="font-mono text-[9px] tracking-[0.12em] uppercase select-none"
            style={{ color: "var(--r-subtext)" }}
          >
            {CHAMBER_AGENT_LABEL[tab]}
          </span>
        </div>

        {/* Thinking dots */}
        {isThinking && (
          <span className="inline-flex gap-0.5 items-center h-5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: "var(--r-muted)",
                  animation: `bounce 1s ${i * 0.12}s ease-in-out infinite`,
                }}
              />
            ))}
          </span>
        )}

        {/* Prose text — only shown when no blocks, or when there's prose alongside blocks */}
        {!isThinking && proseText && (
          <p
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: "var(--r-text)" }}
          >
            {proseText}
          </p>
        )}

        {/* Structured blocks */}
        {hasBlocks && msg.blocks && (
          <BlockRenderer blocks={msg.blocks} />
        )}
      </div>
    </div>
  );
}

/* ── Agent indicator glyph ───────────────────────────────────────────────── */

function AgentIndicator({ tab }: { tab: Tab }) {
  const color = CHAMBER_ACCENT_COLOR[tab];
  return (
    <div
      className="w-3.5 h-3.5 shrink-0 flex items-center justify-center"
      style={{
        backgroundColor: color,
        borderRadius: "2px",
      }}
    >
      <div className="w-px h-2.5" style={{ backgroundColor: "white", opacity: 0.9 }} />
    </div>
  );
}

/* ── Seed prompts per chamber ────────────────────────────────────────────── */

const SEED_PROMPTS: Record<Tab, string[]> = {
  lab: [
    "Analyze the first principles of this system",
    "What are the hidden dependencies here?",
    "Break down the reasoning chain",
    "Run an audit on this architecture",
  ],
  school: [
    "Explain this concept from first principles",
    "Build me a structured learning path for…",
    "What's the key distinction I'm missing?",
    "Check my understanding of…",
  ],
  creation: [
    "Draft a structured brief for…",
    "Build a technical spec for…",
    "Review this architecture and flag issues",
    "Generate a step-by-step build plan for…",
  ],
};

function ChamberSeedPrompts({ tab, onSend }: { tab: Tab; onSend: (text: string) => void }) {
  const prompts = SEED_PROMPTS[tab];
  const accentColor = CHAMBER_ACCENT_COLOR[tab];
  return (
    <div className="mt-2 w-full max-w-[320px] space-y-1">
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSend(p)}
          className="w-full text-left text-[11px] px-3 py-2 transition-all duration-150 border flex items-center gap-2.5"
          style={{
            color: "var(--r-subtext)",
            borderColor: "var(--r-border)",
            backgroundColor: "var(--r-surface)",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--r-text)";
            e.currentTarget.style.borderColor = accentColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--r-subtext)";
            e.currentTarget.style.borderColor = "var(--r-border)";
          }}
        >
          <span className="font-mono text-[9px]" style={{ color: accentColor }}>›</span>
          {p}
        </button>
      ))}
    </div>
  );
}

/* ── Chamber glyphs ──────────────────────────────────────────────────────── */

function ChamberGlyph({ tab }: { tab: Tab }) {
  const color = "var(--r-dim)";
  if (tab === "lab") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color }}>
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14 2v4M14 22v4M2 14h4M22 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M22.5 5.5l-2.8 2.8M8.3 19.7l-2.8 2.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
  if (tab === "school") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color }}>
      <rect x="4" y="6" width="20" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11h20M10 11v11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 4l-2 2h4l-2-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color }}>
      <path d="M6 22l4-12 4 8 3-5 5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
