"use client";

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

  // Auto-resize textarea
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
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-ruberra-accent animate-pulse shrink-0" />
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ruberra-accent">
                  {execStatus}
                </span>
              </span>
              <button
                onClick={onCancel}
                className="font-mono text-[10px] text-ruberra-muted hover:text-ruberra-text transition-colors px-1 tracking-wide"
                aria-label="Cancel stream"
              >
                esc
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Input bar */}
      <div className="max-w-[680px] mx-auto w-full px-10 pb-6 pt-1">
        <div className="flex items-end gap-3 bg-white border border-ruberra-border rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-ruberra-accent/20 focus-within:border-ruberra-accent/40 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask ${name}…`}
            className="flex-1 bg-transparent text-ruberra-text text-sm placeholder:text-ruberra-muted outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
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

// ─── ResponseHeader ───────────────────────────────────────────────────────────

const CHAMBER_LABEL: Record<Tab, string> = {
  lab:      "LAB",
  school:   "SCHOOL",
  creation: "CREATION",
};

const CHAMBER_DOT: Record<Tab, string> = {
  lab:      "text-indigo-500",
  school:   "text-emerald-500",
  creation: "text-amber-500",
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
      <span className="flex items-center gap-1.5">
        <span className={`text-[8px] leading-none shrink-0 ${CHAMBER_DOT[tab]}`}>●</span>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-ruberra-subtext">
          {CHAMBER_LABEL[tab]}
        </span>
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
        <div className="max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed bg-ruberra-stone text-ruberra-text">
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
