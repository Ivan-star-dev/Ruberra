"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type Tab, type Message } from "./types";
import { BlockRenderer } from "./blocks";

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
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
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

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // Parsed structured response — render block engine
  if (!isUser && message.blocks && message.blocks.length > 0) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[72%] w-full">
          <BlockRenderer blocks={message.blocks} />
        </div>
      </div>
    );
  }

  // Structured format detected during streaming — content not yet parsed
  const isStructuredPending =
    !isUser && !message.blocks && message.content.startsWith("TYPE:");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-ruberra-stone text-ruberra-text shadow-sm rounded-br-sm"
            : "bg-white border border-ruberra-border text-ruberra-text rounded-bl-sm",
        ].join(" ")}
      >
        {isStructuredPending ? (
          <span className="text-ruberra-muted italic">Composing response…</span>
        ) : message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {message.content}
          </ReactMarkdown>
        ) : (
          <span className="inline-flex gap-0.5 items-center h-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
