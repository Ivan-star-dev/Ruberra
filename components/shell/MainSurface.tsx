"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  type Tab,
  type Message,
  type LabView,
  type SchoolView,
  type CreationView,
} from "./types";
import LabHome          from "../lab/LabHome";
import LabCodeOrgan     from "../lab/LabCodeOrgan";
import SchoolSurface    from "../school/SchoolSurface";
import CreationSurface  from "../creation/CreationSurface";

interface MainSurfaceProps {
  activeTab:    Tab;
  messages:     Message[];
  isLoading:    boolean;
  onSend:       (text: string) => void;
  labView:      LabView;
  schoolView:   SchoolView;
  creationView: CreationView;
  onLabView:    (v: LabView) => void;
}

export default function MainSurface({
  activeTab, messages, isLoading, onSend,
  labView, schoolView, creationView, onLabView,
}: MainSurfaceProps) {

  /* ── Lab ── */
  if (activeTab === "lab") {
    if (labView === "home" || labView === "research" || labView === "analysis" || labView === "general") {
      const hasMessages = messages.length > 0;
      if (!hasMessages || labView === "home") {
        return (
          <LabHome
            onNavigate={v => onLabView(v)}
            onSend={text => { onLabView("research"); onSend(text); }}
          />
        );
      }
      /* If messages exist, show chat thread */
      return (
        <ChatSurface
          activeTab={activeTab}
          messages={messages}
          isLoading={isLoading}
          onSend={onSend}
          labView={labView}
          onLabView={onLabView}
        />
      );
    }
    if (labView === "code") {
      return <LabCodeOrgan messages={messages} isLoading={isLoading} onSend={onSend} />;
    }
  }

  /* ── School ── */
  if (activeTab === "school") {
    return <SchoolSurface />;
  }

  /* ── Creation ── */
  if (activeTab === "creation") {
    return <CreationSurface messages={messages} isLoading={isLoading} onSend={onSend} />;
  }

  return (
    <ChatSurface
      activeTab={activeTab}
      messages={messages}
      isLoading={isLoading}
      onSend={onSend}
      labView={labView}
      onLabView={onLabView}
    />
  );
}

/* ── Chat / thread surface (Lab research/analysis threads) ─── */

function ChatSurface({
  activeTab, messages, isLoading, onSend, labView, onLabView,
}: {
  activeTab: Tab;
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
  labView:   LabView;
  onLabView: (v: LabView) => void;
}) {
  const [draft, setDraft]   = useState("");
  const threadRef           = useRef<HTMLDivElement>(null);
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

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

  /* Context tabs for Lab thread view */
  const LAB_CONTEXTS: { id: LabView; label: string }[] = [
    { id: "research", label: "Research" },
    { id: "analysis", label: "Analysis" },
    { id: "code",     label: "Code" },
    { id: "general",  label: "General" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* Context tab bar — Lab only */}
      {activeTab === "lab" && (
        <div
          className="flex items-center gap-1 shrink-0 border-b"
          style={{
            height:          "44px",
            padding:         "0 20px",
            borderColor:     "var(--r-border)",
            backgroundColor: "var(--r-surface)",
          }}
        >
          <span
            className="font-mono select-none mr-3"
            style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--r-dim)", textTransform: "uppercase" }}
          >
            CONTEXT
          </span>
          {LAB_CONTEXTS.map(tab => {
            const isActive = labView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onLabView(tab.id)}
                className="transition-all duration-100 select-none"
                style={{
                  fontSize:        "13px",
                  fontWeight:      isActive ? 500 : 400,
                  padding:         "4px 12px",
                  borderRadius:    "6px",
                  backgroundColor: isActive ? "var(--r-pill-bg)" : "transparent",
                  color:           isActive ? "var(--r-pill-text)" : "var(--r-subtext)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => onLabView("home")}
            className="flex items-center gap-1.5 transition-colors duration-100 select-none"
            style={{ fontSize: "12px", color: "var(--r-subtext)", padding: "4px 8px" }}
          >
            <span className="w-3 h-3 rounded-full border" style={{ borderColor: "var(--r-dim)" }} />
            New session
          </button>
        </div>
      )}

      {/* Thread */}
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ padding: "32px 40px 16px" }}
      >
        <div style={{ maxWidth: "640px" }}>
          {messages.map((msg, i) => (
            <ThreadMessage
              key={msg.id}
              msg={msg}
              isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))}
        </div>
      </div>

      {/* Status */}
      {isLoading && (
        <div
          className="shrink-0 flex items-center gap-2"
          style={{ padding: "0 40px", height: "24px" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--r-accent)" }}
          />
          <span
            className="font-mono"
            style={{ fontSize: "10px", color: "var(--r-dim)" }}
          >
            {isStreaming ? "streaming" : "thinking"}
          </span>
        </div>
      )}

      {/* Input bar — bottom border only */}
      <div className="shrink-0" style={{ padding: "0 40px 16px" }}>
        <div
          className="flex items-end gap-3"
          style={{
            borderBottom: "1px solid var(--r-border)",
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
            placeholder="Ask anything…"
            className="flex-1 bg-transparent outline-none resize-none leading-relaxed disabled:opacity-40"
            style={{ color: "var(--r-text)", fontSize: "14px", minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="shrink-0 transition-colors duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ color: "var(--r-subtext)", marginBottom: "2px" }}
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8L2.5 2.5l2.5 5.5-2.5 5.5L13.5 8z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="select-none font-mono" style={{ fontSize: "10px", color: "var(--r-dim)", marginTop: "6px" }}>
          SHIFT+ENTER for newline
        </p>
      </div>
    </div>
  );
}

/* ── Thread message ─────────────────────────────────────────── */

function ThreadMessage({ msg, isStreaming }: { msg: Message; isStreaming: boolean }) {
  const isUser = msg.role === "user";
  const time   = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <p
        style={{
          fontSize:     "14px",
          lineHeight:   "1.65",
          color:        "var(--r-text)",
          marginBottom: "24px",
        }}
      >
        {msg.content}
      </p>
    );
  }

  return (
    <div style={{ marginBottom: "28px" }}>
      <div className="flex items-center gap-2" style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--r-text)", letterSpacing: "-0.01em" }}>
          RUBERRA
        </span>
        <span className="font-mono" style={{ fontSize: "10px", color: "var(--r-dim)" }}>{time}</span>
      </div>
      <div>
        {msg.content ? (
          msg.content.split(/\n\n+/).map((para, i) => (
            <p key={i} style={{ fontSize: "14px", lineHeight: "1.75", color: "var(--r-text)", marginBottom: "14px" }}>
              {para.trim()}
            </p>
          ))
        ) : isStreaming ? (
          <span
            className="inline-block animate-pulse"
            style={{ width: "2px", height: "16px", backgroundColor: "var(--r-subtext)", opacity: 0.5 }}
          />
        ) : null}
      </div>
    </div>
  );
}

/* Exported for use by other surfaces */
export { ChatSurface };
