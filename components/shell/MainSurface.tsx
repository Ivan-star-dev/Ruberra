"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { type Tab, type Message, type LabView, type SchoolView, type CreationView } from "./types";
import LabAnalysisPane   from "../lab/LabAnalysisPane";
import LabCodeOrgan      from "../lab/LabCodeOrgan";
import LabArchive        from "../lab/LabArchive";
import SchoolLibrary     from "../school/SchoolLibrary";
import SchoolArchive     from "../school/SchoolArchive";
import CreationSurface  from "../creation/CreationSurface";
import CreationArchive  from "../creation/CreationArchive";

interface MainSurfaceProps {
  activeTab:     Tab;
  messages:      Message[];
  isLoading:     boolean;
  onSend:        (text: string) => void;
  labView:       LabView;
  schoolView:    SchoolView;
  creationView:  CreationView;
}

const CHAMBER_META: Record<Tab, { title: string; hint: string; placeholder: string }> = {
  lab:      { title: "Lab",      hint: "Explore, experiment, and reason deeply.",   placeholder: "Query the Lab…" },
  school:   { title: "School",   hint: "Learn, study, and build mastery.",          placeholder: "Ask School…" },
  creation: { title: "Creation", hint: "Draft, build, and bring things into being.", placeholder: "Directive…" },
};

export default function MainSurface({
  activeTab,
  messages,
  isLoading,
  onSend,
  labView,
  schoolView,
  creationView,
}: MainSurfaceProps) {

  /* ── Lab routing ────────────────────────────────────────── */
  if (activeTab === "lab") {
    if (labView === "analysis") return <LabAnalysisPane messages={messages} />;
    if (labView === "code")     return <LabCodeOrgan messages={messages} isLoading={isLoading} onSend={onSend} />;
    if (labView === "archive")  return <LabArchive messages={messages} />;
    /* labView === "chat" falls through to chat surface below */
  }

  /* ── School routing ──────────────────────────────────────── */
  if (activeTab === "school") {
    if (schoolView === "library") return <SchoolLibrary />;
    if (schoolView === "archive") return <SchoolArchive messages={messages} />;
    /* schoolView === "chat" falls through */
  }

  /* ── Creation routing ────────────────────────────────────── */
  /* Creation "chat" view maps to the canonical CreationSurface (output card grammar).
     The old CreationTerminal (rt-* dark forge) is removed from the default flow.
     "terminal" view retains CreationSurface — the canon IS the build surface. */
  if (activeTab === "creation") {
    if (creationView === "archive")  return <CreationArchive messages={messages} />;
    /* "chat" and "terminal" both route to canonical CreationSurface */
    return <CreationSurface messages={messages} isLoading={isLoading} onSend={onSend} />;
  }

  /* ── Shared chat surface ─────────────────────────────────── */
  return (
    <ChatSurface
      activeTab={activeTab}
      messages={messages}
      isLoading={isLoading}
      onSend={onSend}
    />
  );
}

/* ── Chat surface ────────────────────────────────────────────── */

function ChatSurface({
  activeTab,
  messages,
  isLoading,
  onSend,
}: {
  activeTab: Tab;
  messages: Message[];
  isLoading: boolean;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft]  = useState("");
  const threadRef          = useRef<HTMLDivElement>(null);
  const textareaRef        = useRef<HTMLTextAreaElement>(null);
  const { title, hint, placeholder } = CHAMBER_META[activeTab];

  const execStatus =
    !isLoading ? "idle"
    : messages.length > 0 && messages[messages.length - 1].role === "assistant"
      && messages[messages.length - 1].content.length > 0
      ? "streaming"
      : "thinking";

import { useEffect, useRef, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Tab, type Message, type StatusFlag } from "./types";
import { BlockRenderer, StatusBadge } from "./blocks";

const MD_COMPONENTS = {
  p:      ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-1.5 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-ruberra-text">{children}</strong>
  ),
  em:     ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  code:   ({ children }: { children?: React.ReactNode }) => (
    <code className="font-mono text-xs bg-ruberra-stone px-1 py-0.5 rounded border border-ruberra-border align-baseline">
      {children}
    </code>
  ),
  pre:    ({ children }: { children?: React.ReactNode }) => (
    <pre className="font-mono text-xs bg-ruberra-rail rounded-lg p-3 overflow-x-auto my-2 border border-ruberra-border">
      {children}
    </pre>
  ),
  ul:     ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>
  ),
  ol:     ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>
  ),
  li:     ({ children }: { children?: React.ReactNode }) => (
    <li>{children}</li>
  ),
};

interface MainSurfaceProps {
  activeTab:     Tab;
  messages:      Message[];
  isLoading:     boolean;
  draft:         string;
  onDraftChange: (text: string) => void;
  onSend:        (text: string) => void;
  onCancel:      () => void;
}

const CHAMBER: Record<Tab, { glyph: string; name: string; tagline: string }> = {
  lab:      { glyph: "⊕", name: "Lab",      tagline: "Operational research. No guardrails."            },
  school:   { glyph: "◎", name: "School",   tagline: "Structured progression. First principles first."  },
  creation: { glyph: "◈", name: "Creation", tagline: "Output engine. Directive in, artifact out."       },
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
  const { glyph, name, tagline } = CHAMBER[activeTab];

  const execStatus: ExecStatus = !isLoading
    ? "idle"
    : messages.length > 0 &&
      messages[messages.length - 1].role === "assistant" &&
      messages[messages.length - 1].content.length > 0
    ? "streaming"
    : "thinking";

  // Auto-scroll thread on new content
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

  // Keyboard shortcuts: Escape → cancel stream; Cmd/Ctrl+K → focus input
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && isLoading) {
        onCancel();
        return;
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onCancel]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
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
      <div ref={threadRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 select-none">
            <ChamberGlyph tab={activeTab} />
            <h1 className="text-base font-medium tracking-tight" style={{ color: "var(--r-text)" }}>
              {title}
            </h1>
            <p className="text-xs text-center max-w-[260px]" style={{ color: "var(--r-subtext)" }}>
              {hint}
            </p>
            <div className="mt-2 font-mono text-[10px] flex flex-col gap-0.5 select-none"
              style={{ color: "var(--r-dim)" }}>
              {BOOT_LINES[activeTab].map(l => (
                <span key={l} className="flex items-center gap-2">
                  <span style={{ color: "var(--r-ok)" }}>›</span>{l}
                </span>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} tab={activeTab} />)
        )}
      </div>

      {/* Status strip */}
      <div className="px-6">
        <div className={[
          "h-5 flex items-center gap-2 transition-opacity duration-200",
          execStatus === "idle" ? "opacity-0" : "opacity-100",
        ].join(" ")} aria-live="polite">
          {execStatus !== "idle" && (
            <>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1 h-1 rounded-full animate-bounce"
                    style={{ backgroundColor: "var(--r-accent)", animationDelay: `${i * 120}ms` }} />
                ))}
              </span>
              <span className="text-xs tracking-wide capitalize" style={{ color: "var(--r-subtext)" }}>
                {execStatus}
    <main className="flex-1 flex flex-col min-h-0 bg-ruberra-bg">
      {/* Message thread */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto py-6 scroll-smooth"
      >
        <div className="max-w-[680px] mx-auto w-full px-10">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-24 select-none">
              <span className="text-3xl text-ruberra-muted">{glyph}</span>
              <h1 className="text-ruberra-text text-base font-semibold tracking-tight">{name}</h1>
              <p className="text-ruberra-subtext text-sm text-center max-w-[280px] leading-relaxed">
                {tagline}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {((): React.ReactNode[] => {
                let aIdx = 0;
                return messages.map((msg) => {
                  if (msg.role === "assistant") aIdx++;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      tab={activeTab}
                      assistantIndex={aIdx}
                    />
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Execution status strip */}
      <div className="max-w-[680px] mx-auto w-full px-10">
        <div className="h-6 flex items-center justify-between">
          {execStatus !== "idle" ? (
            <>
              <span className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
                <span className="text-xs tracking-wide capitalize text-ruberra-accent">
                  {execStatus}
                </span>
              </span>
              <button
                onClick={onCancel}
                className="text-xs text-ruberra-muted hover:text-ruberra-text transition-colors px-1"
                aria-label="Cancel stream"
              >
                Stop
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Input bar */}
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-end gap-3 px-4 py-3 rounded-sm border transition-colors duration-150"
          style={{
            backgroundColor: "var(--r-surface)",
            borderColor: isLoading ? "var(--r-border)" : "var(--r-border)",
          }}>
      <div className="max-w-[680px] mx-auto w-full px-10 pb-6 pt-1">
        <div className="flex items-end gap-3 bg-white border border-ruberra-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-ruberra-accent/20 focus-within:border-ruberra-accent/40 transition-all">
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
            placeholder={`Ask ${name}…`}
            className="flex-1 bg-transparent text-ruberra-text text-sm placeholder:text-ruberra-muted outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="transition-colors duration-150 shrink-0 pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--r-subtext)" }}
            aria-label="Send">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] mt-1.5 ml-1 select-none" style={{ color: "var(--r-dim)" }}>
          Enter to send · Shift+Enter for newline
            className="text-ruberra-muted hover:text-ruberra-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 pb-0.5"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 8L2 2l3 6-3 6 12-6z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="text-ruberra-muted text-xs mt-2 ml-1 select-none">
          Enter to send · Shift+Enter for newline · Esc to stop · ⌘K to focus
        </p>
      </div>
    </main>
  );
}

/* ── Message bubble ────────────────────────────────────────── */

const CHAMBER_USER_BG: Record<Tab, string> = {
  lab:      "var(--r-accent-dim)",
  school:   "color-mix(in srgb, var(--r-ok) 15%, var(--r-surface))",
  creation: "color-mix(in srgb, var(--rt-amber) 12%, var(--r-surface))",
};

function MessageBubble({ msg, tab }: { msg: Message; tab: Tab }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[72%] rounded-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? CHAMBER_USER_BG[tab] : "var(--r-surface)",
          border: `1px solid ${isUser ? "transparent" : "var(--r-border)"}`,
          color: "var(--r-text)",
        }}>
        {msg.content || (
          <span className="inline-flex gap-0.5 items-center h-4">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1 h-1 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--r-muted)", animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        )}
// ─── ResponseHeader ───────────────────────────────────────────────────────────

const CHAMBER_LABEL: Record<Tab, string> = {
  lab:      "LAB",
  school:   "SCHOOL",
  creation: "CREATION",
};

function ResponseHeader({
  tab,
  index,
  status,
}: {
  tab:     Tab;
  index:   number;
  status?: StatusFlag;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-ruberra-surface border border-ruberra-border rounded-t-xl border-b border-b-ruberra-border/60">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-ruberra-subtext">
        {CHAMBER_LABEL[tab]}
      </span>
      <div className="flex items-center gap-2">
        {status && <StatusBadge status={status} />}
        <span className="font-mono text-[10px] text-ruberra-muted">
          #{String(index).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  tab,
  assistantIndex,
}: {
  message:        Message;
  tab:            Tab;
  assistantIndex: number;
}) {
  const isUser = message.role === "user";

  // User messages — warm stone bubble, no header
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed bg-ruberra-stone text-ruberra-text shadow-sm rounded-br-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant — always gets a ResponseHeader
  const firstStatus = message.blocks?.[0]?.status;
  const isStructuredPending = !message.blocks && message.content.startsWith("TYPE:");

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[78%]">
        <ResponseHeader tab={tab} index={assistantIndex} status={firstStatus} />
        <div className="border border-t-0 border-ruberra-border rounded-b-xl overflow-hidden bg-white">
          {/* Structured blocks */}
          {message.blocks && message.blocks.length > 0 ? (
            <div className="p-3">
              <BlockRenderer blocks={message.blocks} />
            </div>
          ) : isStructuredPending ? (
            /* Streaming structured format — not yet parsed */
            <div className="px-4 py-3">
              <span className="text-ruberra-muted italic text-sm">Composing response…</span>
            </div>
          ) : message.content ? (
            /* Prose — markdown rendered */
            <div className="px-4 py-3 text-sm leading-relaxed text-ruberra-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            /* Loading dots */
            <div className="px-4 py-3">
              <span className="inline-flex gap-0.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Boot lines ────────────────────────────────────────────── */

const BOOT_LINES: Record<Tab, string[]> = {
  lab:      ["kernel ready", "context loaded", "reasoning warm"],
  school:   ["knowledge index ready", "curriculum context loaded", "guide warm"],
  creation: ["forge kernel ready", "output encoder loaded", "builder warm"],
};

/* ── Chamber glyphs ────────────────────────────────────────── */

function ChamberGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-subtext)" }}>
      <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14 2v4M14 22v4M2 14h4M22 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M22.5 5.5l-2.8 2.8M8.3 19.7l-2.8 2.8"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
  if (tab === "school") return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-subtext)" }}>
      <rect x="4" y="6" width="20" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11h20M10 11v11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 4l-2 2h4l-2-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-subtext)" }}>
      <path d="M6 22l4-12 4 8 3-5 5 9" stroke="currentColor" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
