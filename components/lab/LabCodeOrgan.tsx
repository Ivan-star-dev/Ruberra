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
  seq:       number;
}

function extractBlocks(messages: Message[]): CodeBlock[] {
  const pairs: CodeBlock[] = [];
  let seq = 1;
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === "user" && messages[i + 1]?.role === "assistant") {
      pairs.push({
        id:        messages[i].id,
        prompt:    messages[i].content,
        output:    messages[i + 1].content,
        timestamp: messages[i + 1].timestamp,
        status:    "complete",
        seq:       seq++,
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
      seq:       seq,
    });
  }
  return pairs.reverse();
}

// Classify output to determine how to render it
function classifyOutput(output: string): "code" | "analysis" | "list" | "prose" {
  if (output.includes("```") || output.match(/^(def |class |function |const |import |export )/m)) return "code";
  if (/TYPE:|SECTION:|STATUS:/.test(output)) return "analysis";
  if (/^[\-\*•]\s/m.test(output) || /^\d+\.\s/m.test(output)) return "list";
  return "prose";
}

export default function LabCodeOrgan({ messages, isLoading, onSend }: LabCodeOrganProps) {
  const [draft, setDraft]   = useState("");
  const textRef             = useRef<HTMLTextAreaElement>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const blocks              = extractBlocks(messages);
  const totalExchanges      = messages.filter(m => m.role === "assistant" && m.content.length > 0).length;

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

      {/* ── Terminal header ────────────────────────────────────────── */}
      <div
        className="flex items-center gap-0 border-b shrink-0"
        style={{ borderColor: "var(--rt-border)", backgroundColor: "var(--rt-surface)" }}
      >
        {/* Left: identity */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
          <TerminalIcon />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-[10px] uppercase tracking-widest shrink-0"
              style={{ color: "var(--rt-amber)" }}
            >
              lab · code
            </span>
            <span
              className="text-[10px] shrink-0"
              style={{ color: "var(--rt-border)" }}
            >
              /
            </span>
            <span
              className="text-[10px] shrink-0"
              style={{ color: "var(--rt-subtext)" }}
            >
              analysis engine
            </span>
          </div>
        </div>

        {/* Right: status strip */}
        <div
          className="flex items-center gap-4 px-4 border-l"
          style={{ borderColor: "var(--rt-border)" }}
        >
          <KernelStat label="exchanges" value={String(totalExchanges)} />
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: isLoading ? "var(--rt-amber)" : "var(--rt-ok)",
                animation: isLoading ? "pulse 1s ease-in-out infinite" : "none",
              }}
            />
            <span className="text-[10px]" style={{ color: "var(--rt-subtext)" }}>
              {isLoading ? "running" : "ready"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Block stream ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0">
        {blocks.length === 0 ? (
          <EmptyLabState onSend={onSend} />
        ) : (
          blocks.map((block) => (
            <LabExchangeBlock key={block.id} block={block} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <div
        className="px-4 pb-4 pt-2.5 border-t shrink-0"
        style={{ borderColor: "var(--rt-border)" }}
      >
        <div
          className="flex items-end gap-2 border px-3 py-2"
          style={{
            borderColor: "var(--rt-border-dash)",
            backgroundColor: "var(--rt-surface)",
          }}
        >
          <span
            className="text-[11px] shrink-0 pb-0.5 select-none"
            style={{ color: "var(--rt-amber)" }}
          >
            ›_
          </span>
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
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="text-[10px] px-2 py-0.5 border transition-colors duration-150 disabled:opacity-30 shrink-0"
            style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-amber)" }}
          >
            run
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 px-0.5">
          <p className="text-[9px]" style={{ color: "var(--rt-dim)" }}>
            Enter to run · Shift+Enter for newline · Lab context only
          </p>
          <span className="text-[9px] font-mono" style={{ color: "var(--rt-dim)" }}>
            lab::code-organ
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Lab exchange block ───────────────────────────────────────────────────── */

function LabExchangeBlock({ block }: { block: CodeBlock }) {
  const outputKind = block.output ? classifyOutput(block.output) : null;

  return (
    <div
      className="border-b py-3"
      style={{ borderColor: "var(--rt-border)" }}
    >
      {/* Prompt row */}
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className="text-[10px] font-semibold shrink-0 mt-0.5 select-none"
          style={{ color: "var(--rt-amber)" }}
        >
          ›
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: "var(--rt-text)" }}
          >
            {block.prompt}
          </p>
        </div>
        <span
          className="text-[9px] shrink-0 tabular-nums"
          style={{ color: "var(--rt-dim)" }}
        >
          #{block.seq}
        </span>
      </div>

      {/* Output */}
      {(block.output || block.status === "active") && (
        <div
          className="ml-4 pl-3 border-l"
          style={{ borderColor: "var(--rt-border-dash)" }}
        >
          {block.status === "active" && block.output.length === 0 ? (
            <div className="flex items-center gap-2 py-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--rt-amber)", animationDelay: `${i * 100}ms` }}
                />
              ))}
              <span className="text-[10px]" style={{ color: "var(--rt-subtext)" }}>
                reasoning…
              </span>
            </div>
          ) : outputKind === "code" ? (
            <CodeOutput content={block.output} />
          ) : outputKind === "list" ? (
            <ListOutput content={block.output} />
          ) : (
            <p
              className="text-[11px] leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--rt-subtext)" }}
            >
              {block.output}
            </p>
          )}

          {block.status === "complete" && (
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[9px] font-mono"
                style={{ color: "var(--rt-ok)" }}
              >
                ✓ complete
              </span>
              <span style={{ color: "var(--rt-dim)" }} className="text-[9px]">
                ·
              </span>
              <span
                className="text-[9px] font-mono tabular-nums"
                style={{ color: "var(--rt-dim)" }}
              >
                {new Date(block.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Code output with syntax visual ─────────────────────────────────────── */

function CodeOutput({ content }: { content: string }) {
  const lines = content.split("\n");
  const inCode = { current: false };
  return (
    <div
      className="text-[10px] leading-5 overflow-x-auto"
      style={{ color: "var(--rt-text)" }}
    >
      {lines.map((line, i) => {
        const isFence = line.trim().startsWith("```");
        if (isFence) { inCode.current = !inCode.current; return null; }
        return (
          <div
            key={i}
            className="whitespace-pre"
            style={{
              color: inCode.current ? "var(--rt-amber-glow)" : "var(--rt-subtext)",
            }}
          >
            {line || "\u00a0"}
          </div>
        );
      })}
    </div>
  );
}

/* ── List output ─────────────────────────────────────────────────────────── */

function ListOutput({ content }: { content: string }) {
  const lines = content.split("\n").filter(l => l.trim().length > 0);
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const isItem = /^[\-\*•]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim());
        const text = line.trim().replace(/^[\-\*•]\s/, "").replace(/^\d+\.\s/, "");
        if (!isItem) {
          return (
            <p key={i} className="text-[11px] leading-relaxed" style={{ color: "var(--rt-subtext)" }}>
              {line}
            </p>
          );
        }
        return (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[10px] shrink-0 mt-0.5 select-none" style={{ color: "var(--rt-copper)" }}>·</span>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--rt-subtext)" }}>{text}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

function EmptyLabState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="pt-6 space-y-4 select-none">
      {/* Identity header */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-copper)" }}>
          ── lab / code analysis context ──
        </div>
        <div className="text-[11px]" style={{ color: "var(--rt-subtext)" }}>
          Isolated code and logic analysis. No cross-chamber memory.
        </div>
      </div>

      {/* Seed queries */}
      <div className="space-y-0">
        <div
          className="text-[9px] uppercase tracking-widest mb-1.5"
          style={{ color: "var(--rt-dim)" }}
        >
          quick queries
        </div>
        {[
          { label: "analyze this function", hint: "trace · audit" },
          { label: "trace the execution path", hint: "flow · deps" },
          { label: "explain the data contract", hint: "schema · types" },
          { label: "find edge cases", hint: "bounds · fail" },
          { label: "audit this for security issues", hint: "sec · vuln" },
        ].map(({ label, hint }) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            className="w-full text-left flex items-center gap-3 px-2 py-1.5 border-b transition-colors duration-150"
            style={{ borderColor: "var(--rt-border)", backgroundColor: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--rt-surface)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span className="text-[10px]" style={{ color: "var(--rt-amber)" }}>›</span>
            <span className="flex-1 text-[11px]" style={{ color: "var(--rt-subtext)" }}>{label}</span>
            <span className="text-[9px]" style={{ color: "var(--rt-dim)" }}>{hint}</span>
          </button>
        ))}
      </div>

      {/* Mode info strip */}
      <div
        className="border px-3 py-2 space-y-1"
        style={{ borderColor: "var(--rt-border-dash)" }}
      >
        {[
          { k: "context", v: "lab only" },
          { k: "output",  v: "analysis / trace / audit" },
          { k: "mode",    v: "operational" },
        ].map(({ k, v }) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--rt-dim)" }}>{k}</span>
            <span className="text-[9px] font-mono" style={{ color: "var(--rt-subtext)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared primitives ───────────────────────────────────────────────────── */

function KernelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 py-2.5">
      <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--rt-dim)" }}>{label}</span>
      <span className="text-[10px] font-mono" style={{ color: "var(--rt-subtext)" }}>{value}</span>
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
