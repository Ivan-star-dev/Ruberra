"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { type Message } from "../shell/types";

interface CreationTerminalProps {
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}

type ArtifactKind = "draft" | "output" | "prompt" | "brief" | "version";

interface Artifact {
  id:        string;
  kind:      ArtifactKind;
  label:     string;
  content:   string;
  timestamp: number;
  seq:       number;
}

const KIND_COLOR: Record<ArtifactKind, string> = {
  draft:   "var(--rt-amber)",
  output:  "var(--rt-ok)",
  prompt:  "var(--rt-copper)",
  brief:   "var(--rt-subtext)",
  version: "var(--rt-amber-glow)",
};

const KIND_SYMBOL: Record<ArtifactKind, string> = {
  draft:   "◈",
  output:  "◉",
  prompt:  "◇",
  brief:   "○",
  version: "◆",
};

function classifyArtifact(content: string, index: number): ArtifactKind {
  if (content.includes("```") || content.match(/```[\w]+/)) return "output";
  if (content.length < 80) return "prompt";
  if (index === 0) return "brief";
  if (content.split("\n").length > 8) return "draft";
  return "version";
}

function deriveArtifacts(messages: Message[]): Artifact[] {
  return messages
    .filter((m) => m.role === "assistant" && m.content.length > 20)
    .map((m, i) => ({
      id:        m.id,
      kind:      classifyArtifact(m.content, i),
      label:     `Artifact ${i + 1}`,
      content:   m.content,
      timestamp: m.timestamp,
      seq:       i + 1,
    }))
    .reverse()
    .slice(0, 8);
}

type PanelMode = "forge" | "artifacts";

export default function CreationTerminal({ messages, isLoading, onSend }: CreationTerminalProps) {
  const [draft, setDraft]       = useState("");
  const [panel, setPanel]       = useState<PanelMode>("forge");
  const [expanded, setExpanded] = useState<string | null>(null);
  const textRef                 = useRef<HTMLTextAreaElement>(null);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const artifacts               = deriveArtifacts(messages);
  const totalBuilds             = messages.filter(m => m.role === "user").length;

  const pairs = (() => {
    const result: { user: Message; assistant: Message | null; seq: number }[] = [];
    let seq = 1;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "user") {
        result.push({ user: messages[i], assistant: messages[i + 1] ?? null, seq: seq++ });
      }
    }
    return result.reverse();
  })();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft("");
    onSend(text);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 font-mono" style={{ backgroundColor: "var(--rt-bg)" }}>

      {/* ── Terminal header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-0 border-b shrink-0"
        style={{ borderColor: "var(--rt-border)", backgroundColor: "var(--rt-surface)" }}
      >
        {/* Identity */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-1 min-w-0">
          <ForgeIcon />
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-amber)" }}>
              creation · forge
            </span>
            <span className="text-[10px]" style={{ color: "var(--rt-border)" }}>/</span>
            <span className="text-[10px]" style={{ color: "var(--rt-subtext)" }}>
              sovereign build terminal
            </span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 ml-2">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--rt-amber)" }}
              />
              <span className="text-[9px]" style={{ color: "var(--rt-amber)" }}>building</span>
            </div>
          )}
        </div>

        {/* Status + panel tabs */}
        <div className="flex items-center border-l" style={{ borderColor: "var(--rt-border)" }}>
          <div className="flex items-center gap-3 px-4 border-r" style={{ borderColor: "var(--rt-border)" }}>
            <KernelStat label="builds" value={String(totalBuilds)} />
            <KernelStat label="artifacts" value={String(artifacts.length)} />
          </div>
          {(["forge", "artifacts"] as PanelMode[]).map(p => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className="px-4 py-2.5 text-[10px] uppercase tracking-widest transition-colors duration-150"
              style={{
                color:           panel === p ? "var(--rt-amber)"   : "var(--rt-subtext)",
                backgroundColor: panel === p ? "var(--rt-bg)"      : "transparent",
                borderRight:     "1px solid var(--rt-border)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      {panel === "forge" ? (
        <>
          {/* Build stream */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0">
            {pairs.length === 0 ? (
              <EmptyForgeState onSend={onSend} />
            ) : (
              pairs.map(({ user, assistant, seq }) => (
                <ForgeExchangeBlock
                  key={user.id}
                  directive={user.content}
                  output={assistant?.content ?? null}
                  isStreaming={isLoading && !assistant?.content}
                  seq={seq}
                  timestamp={assistant?.timestamp ?? user.timestamp}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Forge input */}
          <div
            className="px-4 pb-4 pt-2.5 border-t shrink-0"
            style={{ borderColor: "var(--rt-border)" }}
          >
            <div
              className="border px-3 py-2"
              style={{ borderColor: "var(--rt-border-dash)", backgroundColor: "var(--rt-surface)" }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="text-[11px] shrink-0 pt-0.5 select-none"
                  style={{ color: "var(--rt-copper)" }}
                >
                  ◇_
                </span>
                <textarea
                  ref={textRef}
                  rows={1}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={isLoading}
                  placeholder="directive…"
                  className="flex-1 bg-transparent outline-none resize-none text-[11px] leading-relaxed disabled:opacity-40"
                  style={{ color: "var(--rt-text)", minHeight: "20px", maxHeight: "160px" }}
                />
                <button
                  onClick={submit}
                  disabled={!draft.trim() || isLoading}
                  className="text-[10px] px-2 py-0.5 border transition-colors disabled:opacity-30 shrink-0"
                  style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-amber)" }}
                >
                  forge
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 px-0.5">
              <p className="text-[9px]" style={{ color: "var(--rt-dim)" }}>
                Enter to forge · Shift+Enter for newline
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "export", icon: "↓" },
                  { label: "version", icon: "⊕" },
                  { label: "attach", icon: "⊞" },
                ].map(item => (
                  <button
                    key={item.label}
                    className="text-[9px] flex items-center gap-1 transition-colors duration-150"
                    style={{ color: "var(--rt-dim)" }}
                    title={`${item.label} — coming soon`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Artifacts panel */
        <ArtifactsPanel artifacts={artifacts} expanded={expanded} onExpand={setExpanded} />
      )}
    </div>
  );
}

/* ── Forge exchange block ──────────────────────────────────────────────────── */

function ForgeExchangeBlock({
  directive, output, isStreaming, seq, timestamp,
}: {
  directive:   string;
  output:      string | null;
  isStreaming: boolean;
  seq:         number;
  timestamp:   number;
}) {
  const hasOutput = output !== null && output.length > 0;

  return (
    <div
      className="border-b py-3"
      style={{ borderColor: "var(--rt-border)" }}
    >
      {/* Directive row */}
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className="text-[10px] shrink-0 mt-0.5 select-none"
          style={{ color: "var(--rt-copper)" }}
        >
          ◇
        </span>
        <p
          className="flex-1 text-[11px] leading-relaxed"
          style={{ color: "var(--rt-text)" }}
        >
          {directive}
        </p>
        <span
          className="text-[9px] tabular-nums shrink-0"
          style={{ color: "var(--rt-dim)" }}
        >
          #{seq}
        </span>
      </div>

      {/* Output */}
      {(hasOutput || isStreaming) && (
        <div
          className="ml-4 pl-3 border-l"
          style={{ borderColor: "var(--rt-amber)" }}
        >
          {isStreaming && !hasOutput ? (
            <div className="flex items-center gap-2 py-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--rt-amber)", animationDelay: `${i * 100}ms` }}
                />
              ))}
              <span className="text-[10px]" style={{ color: "var(--rt-subtext)" }}>forging…</span>
            </div>
          ) : (
            <>
              <p
                className="text-[11px] leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--rt-subtext)" }}
              >
                {output}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "var(--rt-ok)" }}
                >
                  ✓ forged
                </span>
                <span style={{ color: "var(--rt-dim)" }} className="text-[9px]">·</span>
                <span
                  className="text-[9px] font-mono tabular-nums"
                  style={{ color: "var(--rt-dim)" }}
                >
                  {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Artifacts panel ──────────────────────────────────────────────────────── */

function ArtifactsPanel({
  artifacts, expanded, onExpand,
}: {
  artifacts: Artifact[];
  expanded:  string | null;
  onExpand:  (id: string | null) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 animate-panel-in">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-3 pb-2 border-b"
        style={{ borderColor: "var(--rt-border)" }}
      >
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-copper)" }}>
          artifact registry
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--rt-subtext)" }}>
          {artifacts.length} item{artifacts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {artifacts.length === 0 ? (
        <p className="text-[11px]" style={{ color: "var(--rt-dim)" }}>
          No artifacts yet. Start forging.
        </p>
      ) : (
        <div className="space-y-px">
          {artifacts.map((art) => (
            <div
              key={art.id}
              className="border"
              style={{ borderColor: "var(--rt-border-dash)" }}
            >
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150"
                style={{ backgroundColor: expanded === art.id ? "var(--rt-surface)" : "transparent" }}
                onClick={() => onExpand(expanded === art.id ? null : art.id)}
              >
                <span className="text-[11px] shrink-0" style={{ color: KIND_COLOR[art.kind] }}>
                  {KIND_SYMBOL[art.kind]}
                </span>
                <span className="flex-1 text-[10px]" style={{ color: "var(--rt-text)" }}>
                  {art.label}
                </span>
                <span
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: KIND_COLOR[art.kind] }}
                >
                  {art.kind}
                </span>
                <span
                  className="text-[9px] font-mono tabular-nums ml-1"
                  style={{ color: "var(--rt-dim)" }}
                >
                  {new Date(art.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-[9px] ml-1" style={{ color: "var(--rt-dim)" }}>
                  {expanded === art.id ? "▾" : "▸"}
                </span>
              </button>
              {expanded === art.id && (
                <div
                  className="px-3 pb-3 pt-0 border-t animate-panel-in"
                  style={{ borderColor: "var(--rt-border-dash)" }}
                >
                  <p
                    className="text-[10px] leading-relaxed whitespace-pre-wrap mt-2"
                    style={{ color: "var(--rt-subtext)" }}
                  >
                    {art.content.slice(0, 600)}{art.content.length > 600 ? "…" : ""}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Empty forge state ────────────────────────────────────────────────────── */

function EmptyForgeState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="pt-6 space-y-4 select-none">
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-copper)" }}>
          ── creation forge / sovereign build terminal ──
        </div>
        <div className="text-[11px]" style={{ color: "var(--rt-subtext)" }}>
          Draft. Build. Generate. Version. Export.
        </div>
      </div>

      {/* Seed directives */}
      <div className="space-y-0">
        <div className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "var(--rt-dim)" }}>
          quick directives
        </div>
        {[
          { label: "write a product brief for…",       hint: "brief · doc" },
          { label: "draft a structured proposal for…", hint: "proposal" },
          { label: "build an outline for…",            hint: "structure" },
          { label: "generate a technical spec for…",   hint: "spec · eng" },
          { label: "create a build plan for…",         hint: "plan · phases" },
        ].map(({ label, hint }) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            className="w-full text-left flex items-center gap-3 px-2 py-1.5 border-b transition-colors duration-150"
            style={{ borderColor: "var(--rt-border)", backgroundColor: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--rt-surface)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <span className="text-[10px]" style={{ color: "var(--rt-copper)" }}>◇</span>
            <span className="flex-1 text-[11px]" style={{ color: "var(--rt-subtext)" }}>{label}</span>
            <span className="text-[9px]" style={{ color: "var(--rt-dim)" }}>{hint}</span>
          </button>
        ))}
      </div>

      {/* Input surface readiness strip */}
      <div className="border space-y-0" style={{ borderColor: "var(--rt-border-dash)" }}>
        <div
          className="px-3 py-1.5 border-b text-[9px] uppercase tracking-widest"
          style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-copper)" }}
        >
          input surface
        </div>
        {[
          { label: "Import document", icon: "↑", status: "soon" },
          { label: "Attach reference", icon: "⊕", status: "soon" },
          { label: "Insert media",     icon: "⊞", status: "soon" },
          { label: "Connect plugin",   icon: "⌥", status: "soon" },
          { label: "Load context",     icon: "⊗", status: "soon" },
        ].map(item => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-3 py-1.5 border-b last:border-b-0"
            style={{ borderColor: "var(--rt-border-dash)" }}
          >
            <span className="text-[10px] w-4" style={{ color: "var(--rt-amber)" }}>{item.icon}</span>
            <span className="flex-1 text-[10px]" style={{ color: "var(--rt-dim)" }}>{item.label}</span>
            <span className="text-[9px]" style={{ color: "var(--rt-dim)" }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────────────────────────── */

function KernelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 py-2.5">
      <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--rt-dim)" }}>{label}</span>
      <span className="text-[10px] font-mono" style={{ color: "var(--rt-subtext)" }}>{value}</span>
    </div>
  );
}

function ForgeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--rt-amber)" }}>
      <path d="M5 1l1.5 3h3L7 6l1 3L5 7.5 2 9l1-3L.5 4H3.5L5 1z"
        stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
