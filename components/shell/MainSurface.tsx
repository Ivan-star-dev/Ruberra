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

// Per-chamber identity
const CHAMBER: Record<Tab, {
  placeholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  statusLabel: string;
}> = {
  lab: {
    placeholder: "Query, hypothesize, reason…",
    emptyTitle: "Lab",
    emptySubtitle: "Operational research. No guardrails.",
    statusLabel: "lab kernel",
  },
  school: {
    placeholder: "Ask to understand, study, or master…",
    emptyTitle: "School",
    emptySubtitle: "Structured progression. First principles first.",
    statusLabel: "school context",
  },
  creation: {
    placeholder: "Describe what you need built or written…",
    emptyTitle: "Creation",
    emptySubtitle: "Output engine. Directive in, artifact out.",
    statusLabel: "builder kernel",
  },
};

// Per-chamber glyph — minimal, recognizable
function ChamberGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M19.1 4.9l-2.1 2.1M7.1 16.9l-2.1 2.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  if (tab === "school") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted">
        <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9 5v8M15 5v8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 2" />
        <path d="M9 10h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  // creation
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted">
      <path d="M3 17l5-10 4 7 3-4 5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const { emptyTitle, emptySubtitle } = CHAMBER[tab];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none pb-12">
      <ChamberGlyph tab={tab} />
      <div className="flex flex-col items-center gap-1 mt-1">
        <span className="text-ruberra-text/70 text-[15px] font-medium tracking-tight">
          {emptyTitle}
        </span>
        <span className="text-ruberra-subtext text-[12px] text-center max-w-[220px] leading-relaxed">
          {emptySubtitle}
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[68%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-[1.65]",
          isUser
            ? "bg-[#e8e6e2] text-ruberra-text rounded-br-md"
            : "bg-white text-ruberra-text rounded-bl-md",
        ].join(" ")}
        style={{
          boxShadow: isUser
            ? "0 1px 2px rgba(26,25,22,0.05)"
            : "0 1px 3px rgba(26,25,22,0.07), 0 0 0 1px #e8e6e2",
        }}
      >
        {msg.content}
        {msg.streaming && (
          <span className="inline-flex ml-1 gap-0.5 items-end pb-0.5">
            <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:120ms]" />
            <span className="w-1 h-1 rounded-full bg-ruberra-muted animate-bounce [animation-delay:240ms]" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function MainSurface({ activeTab, messages, onSubmit, streaming }: MainSurfaceProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { placeholder, statusLabel } = CHAMBER[activeTab];

  const visibleMessages = messages.filter((m) => m.tab === activeTab);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";
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

      {/* Thread area */}
      <div className="flex-1 overflow-y-auto">
        {visibleMessages.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-2.5 px-10 py-8 max-w-[680px] mx-auto w-full">
            {visibleMessages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Status strip — only when thread is active */}
      {visibleMessages.length > 0 && (
        <div className="px-10 pb-1 max-w-[680px] mx-auto w-full">
          <span
            className={[
              "text-[10px] font-mono tracking-wider select-none transition-colors",
              streaming
                ? "text-ruberra-accent/70"
                : "text-ruberra-muted/60",
            ].join(" ")}
          >
            {streaming ? `● ${statusLabel} — processing` : `○ ${statusLabel} — ready`}
          </span>
        </div>
      )}

      {/* Input bar */}
      <div className="px-10 pb-7 pt-2 max-w-[680px] mx-auto w-full">
        <div
          className={[
            "flex items-end gap-3 bg-white rounded-2xl px-4 py-3 transition-shadow duration-150",
          ].join(" ")}
          style={{
            boxShadow: streaming
              ? "0 0 0 1px #e2e0dc"
              : "0 0 0 1px #e2e0dc, 0 1px 4px rgba(26,25,22,0.05)",
          }}
          onFocus={() => {}}
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
            onFocus={(e) => {
              e.currentTarget.parentElement!.style.boxShadow =
                "0 0 0 1.5px #5b52e8, 0 1px 4px rgba(26,25,22,0.05)";
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.boxShadow =
                streaming
                  ? "0 0 0 1px #e2e0dc"
                  : "0 0 0 1px #e2e0dc, 0 1px 4px rgba(26,25,22,0.05)";
            }}
            placeholder={placeholder}
            disabled={streaming}
            className="flex-1 bg-transparent text-ruberra-text text-[13.5px] placeholder:text-ruberra-muted outline-none resize-none leading-relaxed min-h-[20px] disabled:opacity-40"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || streaming}
            aria-label="Send"
            className="text-ruberra-muted hover:text-ruberra-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors shrink-0 pb-0.5"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-center text-ruberra-muted/50 text-[10px] mt-2 select-none tracking-wide">
          Enter · Shift+Enter for new line
        </p>
      </div>

    </main>
  );
}
