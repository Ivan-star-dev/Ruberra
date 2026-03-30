"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { type Message } from "../shell/types";

interface LabCodeOrganProps {
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}

interface CodeBlock {
  id:        string;
  prompt:    string;
  output:    string;
  timestamp: number;
  status:    "pending" | "active" | "complete";
}

/* Extract code-like content from assistant messages */
function extractBlocks(messages: Message[]): CodeBlock[] {
  const pairs: CodeBlock[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === "user" && messages[i + 1]?.role === "assistant") {
      pairs.push({
        id:        messages[i].id,
        prompt:    messages[i].content,
        output:    messages[i + 1].content,
        timestamp: messages[i + 1].timestamp,
        status:    "complete",
      });
    }
  }
  const last = messages[messages.length - 1];
  if (last?.role === "assistant" && last.content.length === 0) {
    pairs.push({
      id:        last.id,
      prompt:    messages[messages.length - 2]?.content ?? "",
      output:    "",
      timestamp: last.timestamp,
      status:    "active",
    });
  }
  return pairs.reverse();
}

export default function LabCodeOrgan({ messages, isLoading, onSend }: LabCodeOrganProps) {
  const [draft, setDraft]   = useState("");
  const textRef             = useRef<HTMLTextAreaElement>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const blocks              = extractBlocks(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
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

  return (
    <div className="flex-1 flex flex-col min-h-0 font-mono" style={{ backgroundColor: "var(--rt-bg)" }}>

      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b"
        style={{ borderColor: "var(--rt-border)", backgroundColor: "var(--rt-surface)" }}>
        <TerminalIcon />
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-amber)" }}>
          lab · code organ
        </span>
        <span className="ml-auto text-[10px]" style={{ color: "var(--rt-subtext)" }}>
          {isLoading ? "reasoning…" : "ready"}
        </span>
      </div>

      {/* Block stream */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {blocks.length === 0 && (
          <div className="flex flex-col gap-2 pt-6 select-none">
            <div className="text-[10px]" style={{ color: "var(--rt-copper)" }}>── lab / code context ──</div>
            <div className="text-[11px]" style={{ color: "var(--rt-subtext)" }}>
              Queries here stay inside Lab context.<br/>
              No Creation memory. No cross-chamber bleed.
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {["analyze this function", "trace the execution path", "explain the data contract", "find edge cases"].map(s => (
                <button key={s}
                  onClick={() => onSend(s)}
                  className="text-left text-[10px] px-2 py-1 border border-dashed transition-colors duration-150"
                  style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-subtext)",
                    backgroundColor: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--rt-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--rt-subtext)")}>
                  › {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {blocks.map((block) => (
          <div key={block.id} className="space-y-1">
            {/* Prompt */}
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--rt-amber)" }} className="text-[10px] shrink-0 mt-0.5">›</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--rt-text)" }}>
                {block.prompt}
              </p>
            </div>
            {/* Output */}
            {(block.output || block.status === "active") && (
              <div className="border-l-2 pl-3 ml-2"
                style={{ borderColor: "var(--rt-border-dash)" }}>
                {block.status === "active" && block.output.length === 0 ? (
                  <div className="flex gap-1 items-center py-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1 h-1 rounded-full animate-bounce"
                        style={{ backgroundColor: "var(--rt-amber)", animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--rt-subtext)" }}>
                    {block.output}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-4 pt-2 border-t" style={{ borderColor: "var(--rt-border)" }}>
        <div className="flex items-end gap-2 border border-dashed px-3 py-2"
          style={{ borderColor: "var(--rt-border-dash)", backgroundColor: "var(--rt-surface)" }}>
          <span className="text-[10px] shrink-0 pb-0.5" style={{ color: "var(--rt-copper)" }}>›_</span>
          <textarea
            ref={textRef}
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder="lab query…"
            className="flex-1 bg-transparent outline-none resize-none text-[11px] leading-relaxed disabled:opacity-40"
            style={{ color: "var(--rt-text)", minHeight: "20px", maxHeight: "140px" }}
          />
          <button onClick={submit} disabled={!draft.trim() || isLoading}
            className="text-[10px] px-2 py-0.5 border border-dashed transition-colors duration-150 disabled:opacity-30 shrink-0"
            style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-amber)" }}>
            run
          </button>
        </div>
        <p className="text-[9px] mt-1 ml-1" style={{ color: "var(--rt-dim)" }}>
          Enter to run · Shift+Enter for newline · Lab context only
        </p>
      </div>
    </div>
  );
}

function TerminalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--rt-amber)" }}>
      <path d="M1 3l2.5 2L1 7M4.5 7h4.5" stroke="currentColor" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
