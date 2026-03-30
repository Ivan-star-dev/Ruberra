"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { type Tab, type Message, type LabView, type SchoolView, type CreationView } from "./types";
import LabAnalysisPane  from "../lab/LabAnalysisPane";
import LabCodeOrgan     from "../lab/LabCodeOrgan";
import LabArchive       from "../lab/LabArchive";
import SchoolLibrary    from "../school/SchoolLibrary";
import SchoolArchive    from "../school/SchoolArchive";
import CreationSurface  from "../creation/CreationSurface";
import CreationArchive  from "../creation/CreationArchive";

interface MainSurfaceProps {
  activeTab:    Tab;
  messages:     Message[];
  isLoading:    boolean;
  onSend:       (text: string) => void;
  labView:      LabView;
  schoolView:   SchoolView;
  creationView: CreationView;
}

/* ── View router ────────────────────────────────────────────── */

export default function MainSurface({
  activeTab, messages, isLoading, onSend,
  labView, schoolView, creationView,
}: MainSurfaceProps) {

  if (activeTab === "lab") {
    if (labView === "analysis") return <LabAnalysisPane messages={messages} />;
    if (labView === "code")     return <LabCodeOrgan messages={messages} isLoading={isLoading} onSend={onSend} />;
    if (labView === "archive")  return <LabArchive messages={messages} />;
  }

  if (activeTab === "school") {
    if (schoolView === "library") return <SchoolLibrary />;
    if (schoolView === "archive") return <SchoolArchive messages={messages} />;
  }

  if (activeTab === "creation") {
    if (creationView === "archive") return <CreationArchive messages={messages} />;
    return <CreationSurface messages={messages} isLoading={isLoading} onSend={onSend} />;
  }

  return (
    <ChatSurface
      activeTab={activeTab}
      messages={messages}
      isLoading={isLoading}
      onSend={onSend}
    />
  );
}

/* ── Shared chat surface ────────────────────────────────────── */

const CHAMBER_META: Record<Tab, {
  title:       string;
  hint:        string;
  placeholder: string;
}> = {
  lab:      { title: "Lab",      hint: "Explore, experiment, and reason deeply.",    placeholder: "Query the Lab…"  },
  school:   { title: "School",   hint: "Learn, study, and build genuine mastery.",   placeholder: "Ask School…"     },
  creation: { title: "Creation", hint: "Draft, build, and bring things into being.", placeholder: "Directive…"      },
};

function ChatSurface({
  activeTab, messages, isLoading, onSend,
}: {
  activeTab: Tab;
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}) {
  const [draft, setDraft]  = useState("");
  const threadRef          = useRef<HTMLDivElement>(null);
  const textareaRef        = useRef<HTMLTextAreaElement>(null);
  const { title, hint, placeholder } = CHAMBER_META[activeTab];

  const isStreaming =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content.length > 0;

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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft("");
    onSend(text);
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* Thread area */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ padding: "24px 28px" }}
      >
        {isEmpty ? (
          <EmptyState tab={activeTab} title={title} hint={hint} />
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} tab={activeTab} />
            ))}
          </div>
        )}
      </div>

      {/* Status bar — single line, minimal */}
      <div
        className="shrink-0 transition-all duration-200 overflow-hidden"
        style={{
          height:     isLoading ? "24px" : "0px",
          opacity:    isLoading ? 1 : 0,
          padding:    isLoading ? "0 28px" : "0 28px",
        }}
        aria-live="polite"
      >
        <div className="flex items-center gap-2 h-full">
          <span
            className="inline-block w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--r-accent)" }}
          />
          <span
            className="font-mono"
            style={{ fontSize: "10px", color: "var(--r-subtext)" }}
          >
            {isStreaming ? "streaming" : "thinking"}
          </span>
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0" style={{ padding: "0 24px 20px" }}>
        <InputBar
          value={draft}
          onChange={setDraft}
          onKeyDown={handleKeyDown}
          onSubmit={submit}
          disabled={isLoading}
          placeholder={placeholder}
          submitLabel="Send"
        />
        <p
          className="mt-1.5 select-none"
          style={{ fontSize: "10px", color: "var(--r-dim)", paddingLeft: "1px" }}
        >
          Enter to send · Shift+Enter for newline
        </p>
      </div>

    </main>
  );
}

/* ── Shared InputBar — used by ChatSurface (Creation has its own) ── */

export function InputBar({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  disabled,
  placeholder,
  submitLabel,
  textareaRef,
}: {
  value:        string;
  onChange:     (v: string) => void;
  onKeyDown:    (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit:     () => void;
  disabled:     boolean;
  placeholder:  string;
  submitLabel:  string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  return (
    <div
      className="flex items-end gap-3 border transition-colors duration-150"
      style={{
        backgroundColor: "var(--r-surface)",
        borderColor:     disabled ? "var(--r-border-soft)" : "var(--r-border)",
        padding:         "10px 14px",
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none resize-none leading-relaxed disabled:opacity-40"
        style={{
          color:     "var(--r-text)",
          fontSize:  "13px",
          minHeight: "22px",
          maxHeight: "160px",
        }}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className="shrink-0 transition-colors duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
        style={{ color: "var(--r-subtext)" }}
        aria-label={submitLabel}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 8L2.5 2.5l2.5 5.5-2.5 5.5L13.5 8z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

function EmptyState({ tab, title, hint }: { tab: Tab; title: string; hint: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center select-none"
      style={{ gap: "10px", paddingBottom: "40px" }}>
      <ChamberGlyph tab={tab} />
      <div className="text-center" style={{ marginTop: "4px" }}>
        <h1
          className="font-medium tracking-tight"
          style={{ fontSize: "15px", color: "var(--r-text)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
        <p
          className="mt-1"
          style={{ fontSize: "12px", color: "var(--r-subtext)", maxWidth: "240px" }}
        >
          {hint}
        </p>
      </div>
      <BootLines tab={tab} />
    </div>
  );
}

const BOOT_LINES: Record<Tab, string[]> = {
  lab:      ["kernel ready", "context loaded", "reasoning warm"],
  school:   ["knowledge index ready", "curriculum loaded", "guide warm"],
  creation: ["forge kernel ready", "output encoder loaded", "builder warm"],
};

function BootLines({ tab }: { tab: Tab }) {
  return (
    <div
      className="font-mono flex flex-col select-none"
      style={{ gap: "3px", marginTop: "8px" }}
    >
      {BOOT_LINES[tab].map(l => (
        <span
          key={l}
          className="flex items-center gap-2"
          style={{ fontSize: "10px", color: "var(--r-dim)" }}
        >
          <span style={{ color: "var(--r-ok)", opacity: 0.6 }}>›</span>
          {l}
        </span>
      ))}
    </div>
  );
}

/* ── Message bubble ─────────────────────────────────────────── */

/* Per-chamber user bubble tint — all mineral, no rt-* tokens */
const USER_BG: Record<Tab, string> = {
  lab:      "var(--r-accent-dim)",
  school:   "var(--r-elevated)",
  creation: "var(--r-elevated)",
};

function MessageBubble({ msg, tab }: { msg: Message; tab: Tab }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[70%]"
        style={{
          backgroundColor: isUser ? USER_BG[tab]      : "var(--r-surface)",
          border:          isUser ? "none"             : "1px solid var(--r-border)",
          color:           "var(--r-text)",
          fontSize:        "13px",
          lineHeight:      "1.6",
          padding:         "8px 14px",
        }}
      >
        {msg.content || <ThinkingDots />}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" style={{ height: "16px" }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 rounded-full animate-bounce"
          style={{
            backgroundColor: "var(--r-muted)",
            animationDelay:  `${i * 120}ms`,
          }}
        />
      ))}
    </span>
  );
}

/* ── Chamber glyphs ─────────────────────────────────────────── */

function ChamberGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none"
      style={{ color: "var(--r-subtext)", opacity: 0.6 }}>
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14 3v3M14 22v3M3 14h3M22 14h3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 6l2 2M20 20l2 2M22 6l-2 2M8 20l-2 2"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
  if (tab === "school") return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none"
      style={{ color: "var(--r-subtext)", opacity: 0.6 }}>
      <rect x="4" y="7" width="20" height="15" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11h20M10 11v11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 5l-2 2h4l-2-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none"
      style={{ color: "var(--r-subtext)", opacity: 0.6 }}>
      <path d="M5 22l4-11 4 7 3-5 5 9" stroke="currentColor" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
