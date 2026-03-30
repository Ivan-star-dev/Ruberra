"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type Tab } from "./TabSwitcher";
import { type Message } from "./types";
import RenderedOutput from "./RenderedOutput";

interface MainSurfaceProps {
  activeTab: Tab;
  messages: Message[];
  onSubmit: (text: string) => void;
  streaming: boolean;
}

const CHAMBER: Record<Tab, {
  placeholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  statusLabel: string;
}> = {
  lab: {
    placeholder: "Ask anything…",
    emptyTitle: "Lab",
    emptySubtitle: "Operational research. No guardrails.",
    statusLabel: "LAB",
  },
  school: {
    placeholder: "Ask anything…",
    emptyTitle: "School",
    emptySubtitle: "Structured progression. First principles first.",
    statusLabel: "SCHOOL",
  },
  creation: {
    placeholder: "Ask anything…",
    emptyTitle: "Creation",
    emptySubtitle: "Output engine. Directive in, artifact out.",
    statusLabel: "CREATION",
  },
};

// Per-chamber accent
const CHAMBER_ACCENT: Record<Tab, string> = {
  lab:      "#1a1916",
  school:   "#5b52e8",
  creation: "#3d9b6e",
};
const CHAMBER_TAG: Record<Tab, string> = {
  lab:      "LAB",
  school:   "SCHOOL",
  creation: "CREATION",
};

// ---------------------------------------------------------------------------
// Figma glyph — per-chamber empty state
// ---------------------------------------------------------------------------
function ChamberGlyph({ tab }: { tab: Tab }) {
  if (tab === "lab") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted/60">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M19.1 4.9l-2.1 2.1M7.1 16.9l-2.1 2.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  if (tab === "school") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted/60">
        <path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9 5v8M15 5v8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 2" />
        <path d="M9 10h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ruberra-muted/60">
      <path d="M3 17l5-10 4 7 3-4 5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const { emptyTitle, emptySubtitle } = CHAMBER[tab];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2.5 select-none pb-16">
      <ChamberGlyph tab={tab} />
      <div className="flex flex-col items-center gap-1">
        <span className="text-ruberra-text/60 text-[14px] font-medium tracking-tight">{emptyTitle}</span>
        <span className="text-ruberra-muted text-[11.5px] text-center max-w-[200px] leading-relaxed">
          {emptySubtitle}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResponseHeader — ● dot, chamber tag, turn number
// ---------------------------------------------------------------------------
function ResponseHeader({ tab, turn, streaming }: { tab: Tab; turn: number; streaming?: boolean }) {
  const accentColor = CHAMBER_ACCENT[tab];
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-1.5"
      style={{ borderBottom: "1px solid #e8e6e2", background: "#f5f4f2", borderLeft: `3px solid ${accentColor}` }}
    >
      <span
        className={`font-mono text-[11px] shrink-0 select-none leading-none ${streaming ? "animate-pulse" : ""}`}
        style={{ color: accentColor }}
      >●</span>
      <span className="font-mono text-[10px] font-semibold tracking-[0.1em] uppercase select-none" style={{ color: accentColor }}>
        {CHAMBER_TAG[tab]}
      </span>
      <span className="font-mono text-[9px] text-ruberra-muted/40 select-none tabular-nums ml-auto">#{turn}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------
function MessageBubble({ msg, turnIndex }: { msg: Message; turnIndex: number }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="flex flex-col items-end gap-1 max-w-[68%]">
          {/* User micro-label */}
          <span className="font-mono text-[9px] text-ruberra-muted/40 uppercase tracking-[0.09em] select-none pr-1">
            you
          </span>
          <div
            className="rounded-xl rounded-br-sm px-4 py-2.5 bg-[#e8e6e2] text-ruberra-text text-[13.5px] leading-[1.65] w-full"
            style={{ boxShadow: "0 1px 2px rgba(26,25,22,0.05)" }}
          >
            {msg.content}
          </div>
        </div>
      ) : (
        <div
          className="w-full rounded-xl rounded-bl-sm overflow-hidden bg-white"
          style={{ boxShadow: "0 1px 3px rgba(26,25,22,0.07), 0 0 0 1px #e2e0dc" }}
        >
          <ResponseHeader tab={msg.tab} turn={turnIndex} streaming={msg.streaming} />
          <div className="px-4 py-3.5">
            <RenderedOutput content={msg.content} streaming={msg.streaming} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Figma bottom status bar — dot color reactive to state
// ---------------------------------------------------------------------------
function StatusBar({ activeTab, streaming }: { activeTab: Tab; streaming: boolean }) {
  const dotColor = streaming ? "#5b52e8" : "#3d9b6e";
  const statusText = streaming ? "PROCESSING" : "CONNECTED";
  return (
    <div
      className="flex items-center gap-2.5 px-6 h-7 shrink-0 select-none"
      style={{ borderTop: "1px solid #e2e0dc", background: "#fafaf8" }}
    >
      <span
        className={`font-mono text-[9.5px] leading-none ${streaming ? "animate-pulse" : ""}`}
        style={{ color: dotColor }}
      >●</span>
      <span className="font-mono text-[9.5px] text-ruberra-muted/70 uppercase tracking-[0.07em]">
        RUBERRA CORE
      </span>
      <span className="font-mono text-[9px] text-ruberra-muted/30">·</span>
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.07em]"
        style={{ color: dotColor }}
      >
        {statusText}
      </span>
      <div className="ml-auto flex items-center gap-2.5">
        <span className="font-mono text-[9px] text-ruberra-muted/35">Model: RUBERRA-7B-15</span>
        <span className="font-mono text-[9px] text-ruberra-muted/25">·</span>
        <span className="font-mono text-[9px] text-ruberra-muted/40 uppercase tracking-[0.08em]">
          {CHAMBER_TAG[activeTab]}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function MainSurface({ activeTab, messages, onSubmit, streaming }: MainSurfaceProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { placeholder } = CHAMBER[activeTab];

  const visibleMessages = messages.filter((m) => m.tab === activeTab);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
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
          <div className="flex flex-col gap-3 px-8 py-7 max-w-[760px] mx-auto w-full">
            {(() => {
              let assistantTurn = 0;
              return visibleMessages.map((msg) => {
                if (msg.role === "assistant") assistantTurn++;
                return <MessageBubble key={msg.id} msg={msg} turnIndex={assistantTurn} />;
              });
            })()}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-8 pb-5 pt-2 max-w-[760px] mx-auto w-full">
        {/* Figma-style input: paperclip left, textarea, send right */}
        <div
          className="flex items-end gap-2.5 bg-white rounded-2xl px-3.5 py-2.5 transition-shadow duration-150"
          style={{ boxShadow: streaming ? "0 0 0 1px #e2e0dc" : "0 0 0 1px #e2e0dc, 0 1px 4px rgba(26,25,22,0.05)" }}
        >
          {/* Paperclip icon */}
          <button
            className="shrink-0 text-ruberra-muted/50 hover:text-ruberra-subtext transition-colors pb-0.5 self-end"
            tabIndex={-1}
            aria-label="Attach"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.5 6.5L6 12a3.5 3.5 0 01-4.95-4.95L6.6 1.5A2.33 2.33 0 0110.1 4.9L4.5 10.5a1.17 1.17 0 01-1.65-1.65l5.3-5.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

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
                streaming ? "0 0 0 1px #e2e0dc" : "0 0 0 1px #e2e0dc, 0 1px 4px rgba(26,25,22,0.05)";
            }}
            placeholder={placeholder}
            disabled={streaming}
            className="flex-1 bg-transparent text-ruberra-text text-[13.5px] placeholder:text-ruberra-muted outline-none resize-none leading-relaxed min-h-[20px] disabled:opacity-40"
          />

          {/* Send / Generate button */}
          {activeTab === "creation" && draft.trim() ? (
            <button
              onClick={submit}
              disabled={streaming}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end mb-0.5"
              style={{ background: "#3d9b6e" }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 5.5h9M6.5 2l3.5 3.5L6.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Generate
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!draft.trim() || streaming}
              aria-label="Send"
              className="text-ruberra-muted hover:text-ruberra-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors shrink-0 self-end pb-0.5"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-right text-ruberra-muted/30 text-[9px] mt-1 select-none font-mono pr-1">
          ↵ send · ⇧↵ newline
        </p>
      </div>

      {/* Figma bottom status bar */}
      <StatusBar activeTab={activeTab} streaming={streaming} />
    </main>
  );
}
