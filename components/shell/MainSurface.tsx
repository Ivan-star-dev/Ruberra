"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { type Tab, type Message } from "./types";
import LabTerminalInset from "../lab/LabTerminalInset";

interface MainSurfaceProps {
  activeTab: Tab;
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}

const EMPTY_STATE: Record<Tab, { title: string; hint: string }> = {
  lab:      { title: "Lab",      hint: "Explore, experiment, and reason." },
  school:   { title: "School",   hint: "Learn, study, and deepen understanding." },
  creation: { title: "Creation", hint: "Build, write, and make things real." },
};

type ExecStatus = "idle" | "thinking" | "streaming";

export default function MainSurface({ activeTab, messages, isLoading, onSend }: MainSurfaceProps) {
  const [draft,    setDraft]   = useState("");
  const threadRef              = useRef<HTMLDivElement>(null);
  const textareaRef            = useRef<HTMLTextAreaElement>(null);
  const { title, hint }        = EMPTY_STATE[activeTab];

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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft("");
    onSend(text);
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-ruberra-bg">

      {/* Message thread */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth"
      >
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 select-none">
            <h1 className="text-ruberra-text text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-ruberra-subtext text-sm text-center max-w-xs">{hint}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* Lab terminal inset — contextual verdict/status/diagnostic surface */}
      {activeTab === "lab" && (
        <LabTerminalInset messages={messages} execStatus={execStatus} />
      )}

      {/* Execution status strip */}
      <div className="px-6">
        <div
          className={[
            "h-5 flex items-center gap-2 transition-opacity duration-200",
            execStatus === "idle" ? "opacity-0" : "opacity-100",
          ].join(" ")}
          aria-live="polite"
        >
          {execStatus !== "idle" && (
            <>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-ruberra-accent animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
              <span className="text-ruberra-subtext text-xs tracking-wide capitalize">
                {execStatus}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="px-6 pb-6 pt-1">
        <div className="flex items-end gap-3 bg-ruberra-surface border border-ruberra-border rounded-xl px-4 py-3 focus-within:border-ruberra-muted transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask ${title}…`}
            className="flex-1 bg-transparent text-ruberra-text text-sm placeholder:text-ruberra-muted outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="text-ruberra-subtext hover:text-ruberra-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 pb-0.5"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-ruberra-muted text-xs mt-2 ml-1 select-none">
          Enter to send · Shift+Enter for newline
        </p>
      </div>

    </main>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-ruberra-accent text-white rounded-br-sm"
            : "bg-ruberra-surface border border-ruberra-border text-ruberra-text rounded-bl-sm",
        ].join(" ")}
      >
        {message.content || (
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
