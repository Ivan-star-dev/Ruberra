"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type Tab } from "./TabSwitcher";
import { type Message } from "./types";

interface MainSurfaceProps {
  activeTab: Tab;
  messages: Message[];
  onSubmit: (text: string) => void;
  streaming: boolean;
}

const MODE_META: Record<Tab, { placeholder: string; hint: string }> = {
  lab:      { placeholder: "Experiment, query, reason…",   hint: "Lab — open-ended exploration" },
  school:   { placeholder: "Ask to learn or study…",       hint: "School — guided understanding" },
  creation: { placeholder: "Describe what you want made…", hint: "Creation — build and produce" },
};

const LOG_TOKENS: Record<Tab, string[]> = {
  lab:      ["kernel ready", "context loaded", "reasoning engine warm"],
  school:   ["knowledge index ready", "curriculum context loaded", "retrieval warm"],
  creation: ["builder kernel ready", "output encoder loaded", "composer warm"],
};

function LogStream({ tab }: { tab: Tab }) {
  const tokens = LOG_TOKENS[tab];
  return (
    <div className="font-mono text-[10px] text-ruberra-subtext/50 flex flex-col gap-0.5 select-none">
      {tokens.map((t) => (
        <span key={t} className="flex items-center gap-2">
          <span className="text-ruberra-pulse/40">›</span>
          {t}
        </span>
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[72%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-ruberra-border/70 text-ruberra-text rounded-br-sm"
            : "bg-ruberra-surface border border-ruberra-border text-ruberra-text rounded-bl-sm",
        ].join(" ")}
      >
        {msg.content}
        {msg.streaming && (
          <span className="inline-flex ml-1 gap-0.5 items-end pb-0.5">
            <span className="w-1 h-1 rounded-full bg-ruberra-accent animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 rounded-full bg-ruberra-accent animate-bounce [animation-delay:120ms]" />
            <span className="w-1 h-1 rounded-full bg-ruberra-accent animate-bounce [animation-delay:240ms]" />
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const { hint } = MODE_META[tab];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 select-none">
      <div className="flex flex-col items-center gap-2">
        <ModeGlyph tab={tab} />
        <span className="text-ruberra-text/90 text-lg font-medium tracking-tight capitalize">
          {tab}
        </span>
        <span className="text-ruberra-subtext text-xs tracking-wide">{hint}</span>
      </div>
      <LogStream tab={tab} />
    </div>
  );
}

function ModeGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ruberra-subtext/60">
        <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14 2v4M14 22v4M2 14h4M22 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M5.5 5.5l2.8 2.8M19.7 19.7l2.8 2.8M22.5 5.5l-2.8 2.8M8.3 19.7l-2.8 2.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  if (tab === "school") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ruberra-subtext/60">
        <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 11h20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M10 11v11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M14 4l-2 2h4l-2-2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ruberra-subtext/60">
      <path d="M6 22l4-12 4 8 3-5 5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function MainSurface({ activeTab, messages, onSubmit, streaming }: MainSurfaceProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { placeholder } = MODE_META[activeTab];

  const visibleMessages = messages.filter((m) => m.tab === activeTab);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    onSubmit(text);
  }, [draft, streaming, onSubmit]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-ruberra-bg">
      {/* Output / stream area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {visibleMessages.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-3 px-8 py-6 max-w-3xl mx-auto w-full">
            {visibleMessages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Execution / log strip */}
      {visibleMessages.length > 0 && (
        <div className="px-8 pb-1 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3 text-[10px] font-mono text-ruberra-subtext/40 select-none">
            <span className={streaming ? "text-ruberra-pulse/70 animate-pulse" : "text-ruberra-subtext/30"}>
              {streaming ? "● processing" : "● idle"}
            </span>
            <span className="uppercase tracking-widest">{activeTab} mode</span>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-8 pb-6 pt-2 max-w-3xl mx-auto w-full">
        <div
          className={[
            "flex items-end gap-3 bg-ruberra-surface border rounded-xl px-4 py-3 transition-colors duration-150",
            streaming ? "border-ruberra-border/50" : "border-ruberra-border hover:border-ruberra-accent/30 focus-within:border-ruberra-accent/60",
          ].join(" ")}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={streaming}
            className="flex-1 bg-transparent text-ruberra-text text-sm placeholder:text-ruberra-muted outline-none resize-none leading-relaxed min-h-[20px] disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || streaming}
            aria-label="Send"
            className="text-ruberra-subtext hover:text-ruberra-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 pb-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-center text-ruberra-subtext/30 text-[10px] mt-2 select-none tracking-wide">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  );
}
