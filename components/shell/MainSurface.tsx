"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import {
  type Tab,
  type Message,
  type LabView,
  type SchoolView,
  type CreationView,
} from "./types";

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
}: MainSurfaceProps) {
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

  // Auto-scroll on new content
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  // Keyboard shortcuts
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
      <div ref={threadRef} className="flex-1 overflow-y-auto py-6 scroll-smooth">
        <div className="max-w-[680px] mx-auto w-full px-8">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24 select-none">
              <ChamberGlyph tab={activeTab} />
              <h1 className="text-base font-medium tracking-tight" style={{ color: "var(--r-text)" }}>
                {name}
              </h1>
              <p className="text-sm text-center max-w-[280px] leading-relaxed" style={{ color: "var(--r-subtext)" }}>
                {tagline}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--r-accent)", animation: "pulse 1s ease-in-out infinite" }}
                />
                <span
                  className="font-mono text-[9px] tracking-[0.10em] uppercase"
                  style={{ color: "var(--r-accent)" }}
                >
                  {execStatus}
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
          className="flex items-end gap-3 px-4 py-3 rounded-[10px] border transition-colors duration-150"
          style={{
            backgroundColor: "var(--r-surface)",
            borderColor: "var(--r-border)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
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
            className="transition-colors duration-150 shrink-0 pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--r-subtext)" }}
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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

/* ── Message bubble ────────────────────────────────────────────────── */

const CHAMBER_USER_BG: Record<Tab, string> = {
  lab:      "var(--r-accent-dim)",
  school:   "color-mix(in srgb, var(--r-ok) 12%, var(--r-surface))",
  creation: "color-mix(in srgb, var(--rt-amber) 10%, var(--r-surface))",
};

const CHAMBER_AGENT_LABEL: Record<Tab, string> = {
  lab:      "RUBERRA · LAB",
  school:   "RUBERRA · SCHOOL",
  creation: "RUBERRA · CREATION",
};

const CHAMBER_AGENT_COLOR: Record<Tab, string> = {
  lab:      "var(--r-accent)",
  school:   "var(--r-ok)",
  creation: "var(--r-warn)",
};

function MessageBubble({ msg, tab }: { msg: Message; tab: Tab }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[72%] rounded-[10px] rounded-br-[2px] px-4 py-2.5 text-sm leading-relaxed border"
          style={{
            backgroundColor: CHAMBER_USER_BG[tab],
            borderColor: "transparent",
            color: "var(--r-text)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="w-full">
        {/* Agent label */}
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
            style={{ backgroundColor: CHAMBER_AGENT_COLOR[tab] }}
          >
            <div className="w-px h-2" style={{ backgroundColor: "white" }} />
          </div>
          <span
            className="font-mono text-[9px] tracking-[0.10em] uppercase select-none"
            style={{ color: "var(--r-subtext)" }}
          >
            {CHAMBER_AGENT_LABEL[tab]}
          </span>
        </div>

        {/* Content */}
        {msg.content ? (
          <p
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: "var(--r-text)" }}
          >
            {msg.content}
          </p>
        ) : (
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
      </div>
    </div>
  );
}

/* ── Chamber glyphs ──────────────────────────────────────────────── */

function ChamberGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14 2v4M14 22v4M2 14h4M22 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M22.5 5.5l-2.8 2.8M8.3 19.7l-2.8 2.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
  if (tab === "school") return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
      <rect x="4" y="6" width="20" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11h20M10 11v11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 4l-2 2h4l-2-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
      <path d="M6 22l4-12 4 8 3-5 5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
