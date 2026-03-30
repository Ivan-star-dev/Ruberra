"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  type Tab,
  type Message,
  type LabView,
  type SchoolView,
  type CreationView,
  type SessionStats,
} from "./types";
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
  stats:        SessionStats;
}

/* ── View router ────────────────────────────────────────────── */

export default function MainSurface({
  activeTab, messages, isLoading, onSend,
  labView, schoolView, creationView, stats,
}: MainSurfaceProps) {

  if (activeTab === "lab") {
    if (labView === "analysis") return <LabAnalysisPane messages={messages} />;
    if (labView === "code")     return <LabCodeOrgan messages={messages} isLoading={isLoading} onSend={onSend} />;
    if (labView === "archive")  return <LabArchive messages={messages} />;
    /* research / summary / chat all use the editorial chat surface */
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
      stats={stats}
    />
  );
}

/* ── Chamber meta ───────────────────────────────────────────── */

const PLACEHOLDER: Record<Tab, string> = {
  lab:      "Ask anything…",
  school:   "Ask anything…",
  creation: "Describe what to build…",
};

const HINT: Record<Tab, string> = {
  lab:      "Explore, experiment, and reason deeply.",
  school:   "Learn, study, and build genuine mastery.",
  creation: "Draft, build, and bring things into being.",
};

/* ── Editorial chat surface ──────────────────────────────────── */

function ChatSurface({
  activeTab, messages, isLoading, onSend, stats,
}: {
  activeTab: Tab;
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
  stats:     SessionStats;
}) {
  const [draft, setDraft]      = useState("");
  const threadRef              = useRef<HTMLDivElement>(null);
  const textareaRef            = useRef<HTMLTextAreaElement>(null);
  const placeholder            = PLACEHOLDER[activeTab];
  const isEmpty                = messages.length === 0;

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
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
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

  return (
    <main
      className="flex-1 flex flex-col min-h-0"
      style={{ backgroundColor: "var(--r-bg)" }}
    >
      {/* ── Thread ──────────────────────────────────────────── */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ padding: "32px 40px 16px" }}
      >
        {isEmpty ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div style={{ maxWidth: "640px" }}>
            {messages.map((msg, i) => (
              <EditorialMessage
                key={msg.id}
                msg={msg}
                isLast={i === messages.length - 1}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Input area ──────────────────────────────────────── */}
      <div style={{ padding: "0 40px", flexShrink: 0 }}>
        {/* Bottom-border only — no surface box */}
        <div
          className="flex items-end gap-4 transition-colors duration-150"
          style={{
            borderBottom: `1px solid ${isLoading ? "var(--r-border-soft)" : "var(--r-border)"}`,
            paddingBottom: "12px",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{
              color:     "var(--r-text)",
              fontSize:  "14px",
              minHeight: "24px",
              maxHeight: "200px",
            }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="shrink-0 transition-colors duration-150 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ color: "var(--r-subtext)", marginBottom: "2px" }}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8L2.5 2.5l2.5 5.5-2.5 5.5L13.5 8z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Hint + disclaimer row */}
        <div
          className="flex items-center justify-between select-none"
          style={{ paddingTop: "8px", paddingBottom: "10px" }}
        >
          <span
            className="font-mono"
            style={{ fontSize: "10px", color: "var(--r-dim)" }}
          >
            SHIFT+ENTER for newline
          </span>
          <span
            style={{ fontSize: "10px", color: "var(--r-dim)" }}
          >
            Responses may be incomplete. Always verify critical information.
          </span>
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────── */}
      <StatusBar stats={stats} isStreaming={isStreaming} isLoading={isLoading} />
    </main>
  );
}

/* ── Editorial message layout ───────────────────────────────── */

function EditorialMessage({
  msg,
  isLast,
  isStreaming,
}: {
  msg:         Message;
  isLast:      boolean;
  isStreaming:  boolean;
}) {
  const isUser = msg.role === "user";

  /* Format: HH:MM */
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize:   "14px",
            lineHeight: "1.65",
            color:      "var(--r-text)",
          }}
        >
          {msg.content}
        </p>
      </div>
    );
  }

  /* Assistant — sender label above, full-width prose */
  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Sender label */}
      <div
        className="flex items-center gap-2 select-none"
        style={{ marginBottom: "10px" }}
      >
        <span
          className="font-semibold"
          style={{
            fontSize:      "11px",
            color:         "var(--r-text)",
            letterSpacing: "-0.01em",
          }}
        >
          RUBERRA
        </span>
        <span
          className="font-mono"
          style={{ fontSize: "10px", color: "var(--r-dim)" }}
        >
          {time}
        </span>
      </div>

      {/* Response body */}
      <div
        style={{
          fontSize:   "14px",
          lineHeight: "1.75",
          color:      "var(--r-text)",
        }}
      >
        {msg.content ? (
          /* Render paragraphs separated by double newline */
          msg.content.split(/\n\n+/).map((para, i) => (
            <p key={i} style={{ marginBottom: "12px" }}>{para.trim()}</p>
          ))
        ) : (
          isStreaming ? <ThinkingIndicator /> : null
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <span
      className="inline-block w-2 h-4 animate-pulse"
      style={{
        backgroundColor: "var(--r-subtext)",
        opacity:         0.5,
      }}
    />
  );
}

/* ── Status bar ─────────────────────────────────────────────── */

function StatusBar({
  stats,
  isStreaming,
  isLoading,
}: {
  stats:       SessionStats;
  isStreaming:  boolean;
  isLoading:    boolean;
}) {
  const latency = stats.latencyMs > 0
    ? `${stats.latencyMs}ms`
    : "—";

  return (
    <div
      className="shrink-0 border-t flex items-center justify-between select-none font-mono"
      style={{
        height:          "28px",
        borderColor:     "var(--r-border)",
        backgroundColor: "var(--r-surface)",
        paddingLeft:     "40px",
        paddingRight:    "40px",
        fontSize:        "9px",
        color:           "var(--r-dim)",
        letterSpacing:   "0.05em",
      }}
    >
      {/* Left — brand + status */}
      <div className="flex items-center gap-3">
        <span style={{ color: "var(--r-subtext)" }}>RUBERRA CORE</span>
        <span style={{ color: "var(--r-border)" }}>·</span>
        <span
          className="flex items-center gap-1.5"
          style={{ color: isLoading ? "var(--r-accent)" : "var(--r-ok)" }}
        >
          <span
            className={["w-1 h-1 rounded-full", isLoading ? "animate-pulse" : ""].join(" ")}
            style={{ backgroundColor: "currentColor" }}
          />
          {isLoading ? (isStreaming ? "STREAMING" : "THINKING") : "CONNECTED"}
        </span>
      </div>

      {/* Right — model / context / latency / date */}
      <div className="flex items-center gap-3">
        <span>Model: {stats.model}</span>
        <span style={{ color: "var(--r-border)" }}>·</span>
        <span>Context: {stats.context}</span>
        <span style={{ color: "var(--r-border)" }}>·</span>
        <span>Latency: {latency}</span>
        <span style={{ color: "var(--r-border)" }}>·</span>
        <span>Session · {stats.date}</span>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */

const BOOT_LINES: Record<Tab, string[]> = {
  lab:      ["kernel ready", "context loaded", "reasoning warm"],
  school:   ["knowledge index ready", "curriculum loaded", "guide warm"],
  creation: ["forge kernel ready", "output encoder loaded", "builder warm"],
};

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div
      className="h-full flex flex-col justify-end select-none"
      style={{ paddingBottom: "16px", minHeight: "120px" }}
    >
      <div
        className="font-mono flex flex-col"
        style={{ gap: "3px" }}
      >
        {BOOT_LINES[tab].map(l => (
          <span
            key={l}
            className="flex items-center gap-2"
            style={{ fontSize: "10px", color: "var(--r-dim)" }}
          >
            <span style={{ color: "var(--r-ok)", opacity: 0.5 }}>›</span>
            {l}
          </span>
        ))}
      </div>
      <p
        style={{
          fontSize:   "13px",
          color:      "var(--r-subtext)",
          marginTop:  "12px",
          lineHeight: "1.5",
        }}
      >
        {HINT[tab]}
      </p>
    </div>
  );
}

/* ── Shared InputBar export (used by other surfaces) ─────────── */

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
