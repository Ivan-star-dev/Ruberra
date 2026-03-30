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
}

const KIND_COLOR: Record<ArtifactKind, string> = {
  draft:   "var(--rt-amber)",
  output:  "var(--rt-ok)",
  prompt:  "var(--rt-copper)",
  brief:   "var(--rt-subtext)",
  version: "var(--rt-amber-glow)",
};

const KIND_ICON: Record<ArtifactKind, string> = {
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
    }))
    .reverse()
    .slice(0, 8);
}

type PanelMode = "forge" | "artifacts";

export default function CreationTerminal({ messages, isLoading, onSend }: CreationTerminalProps) {
  const [draft, setDraft]   = useState("");
  const [panel, setPanel]   = useState<PanelMode>("forge");
  const [expanded, setExpanded] = useState<string | null>(null);
  const textRef             = useRef<HTMLTextAreaElement>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const artifacts           = deriveArtifacts(messages);

  const pairs = (() => {
    const result: { user: Message; assistant: Message | null }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "user") {
        result.push({ user: messages[i], assistant: messages[i + 1] ?? null });
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

      {/* Terminal header */}
      <div className="flex items-center gap-0 border-b"
        style={{ borderColor: "var(--rt-border)", backgroundColor: "var(--rt-surface)" }}>
        <div className="flex items-center gap-2.5 px-5 py-2.5 flex-1">
          <ForgeIcon />
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-amber)" }}>
            creation · forge
          </span>
          {isLoading && (
            <span className="flex gap-0.5 ml-2">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1 h-1 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--rt-amber)", animationDelay: `${i * 100}ms` }} />
              ))}
            </span>
          )}
        </div>
        {/* Panel tabs */}
        <div className="flex border-l" style={{ borderColor: "var(--rt-border)" }}>
          {(["forge", "artifacts"] as PanelMode[]).map(p => (
            <button key={p}
              onClick={() => setPanel(p)}
              className="px-4 py-2.5 text-[10px] uppercase tracking-widest transition-colors duration-150"
              style={{
                color:           panel === p ? "var(--rt-amber)" : "var(--rt-subtext)",
                backgroundColor: panel === p ? "var(--rt-bg)"    : "transparent",
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {panel === "forge" ? (
        <>
          {/* Build stream */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {pairs.length === 0 && (
              <div className="space-y-3 pt-4 select-none">
                <div className="text-[10px]" style={{ color: "var(--rt-copper)" }}>
                  ── creation forge / sovereign build terminal ──
                </div>
                <div className="text-[11px]" style={{ color: "var(--rt-subtext)" }}>
                  Draft. Build. Generate. Version. Export.
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  {[
                    "write a product brief for…",
                    "draft a structured proposal for…",
                    "build an outline for…",
                    "generate a technical spec for…",
                  ].map(s => (
                    <button key={s}
                      onClick={() => onSend(s)}
                      className="text-left text-[10px] px-2 py-1 border border-dashed transition-colors duration-150"
                      style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-subtext)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--rt-text)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--rt-subtext)")}>
                      › {s}
                    </button>
                  ))}
                </div>

                {/* Plugin/import readiness strips */}
                <div className="mt-6 border border-dashed space-y-0"
                  style={{ borderColor: "var(--rt-border-dash)" }}>
                  <div className="px-3 py-1.5 border-b text-[9px] uppercase tracking-widest"
                    style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-copper)" }}>
                    input / plugin surface
                  </div>
                  {[
                    { label: "Import document", icon: "↑" },
                    { label: "Attach reference", icon: "⊕" },
                    { label: "Insert media",     icon: "⊞" },
                    { label: "Connect plugin",   icon: "⌥" },
                    { label: "Load context",     icon: "⊗" },
                  ].map(item => (
                    <div key={item.label}
                      className="flex items-center gap-3 px-3 py-1.5 border-b last:border-b-0"
                      style={{ borderColor: "var(--rt-border-dash)" }}>
                      <span className="text-[10px] w-4" style={{ color: "var(--rt-amber)" }}>
                        {item.icon}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--rt-dim)" }}>
                        {item.label}
                      </span>
                      <span className="ml-auto text-[9px]" style={{ color: "var(--rt-dim)" }}>
                        soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pairs.map(({ user, assistant }) => (
              <div key={user.id} className="space-y-2">
                {/* Directive */}
                <div className="flex items-start gap-2">
                  <span style={{ color: "var(--rt-copper)" }} className="text-[10px] shrink-0 mt-0.5">◇</span>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--rt-text)" }}>
                    {user.content}
                  </p>
                </div>
                {/* Output block */}
                {assistant && (
                  <div className="border-l-2 pl-3 ml-3"
                    style={{ borderColor: "var(--rt-amber)" }}>
                    {assistant.content.length === 0 ? (
                      <div className="flex gap-1 items-center py-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1 h-1 rounded-full animate-bounce"
                            style={{ backgroundColor: "var(--rt-amber)", animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] leading-relaxed whitespace-pre-wrap"
                        style={{ color: "var(--rt-subtext)" }}>
                        {assistant.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Forge input */}
          <div className="px-5 pb-4 pt-2 border-t" style={{ borderColor: "var(--rt-border)" }}>
            <div className="border border-dashed px-3 py-2"
              style={{ borderColor: "var(--rt-border-dash)", backgroundColor: "var(--rt-surface)" }}>
              <div className="flex items-start gap-2">
                <span className="text-[10px] shrink-0 pt-0.5" style={{ color: "var(--rt-copper)" }}>◇_</span>
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
                <button onClick={submit} disabled={!draft.trim() || isLoading}
                  className="text-[10px] px-2 py-0.5 border border-dashed transition-colors disabled:opacity-30 shrink-0"
                  style={{ borderColor: "var(--rt-border-dash)", color: "var(--rt-amber)" }}>
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
                ].map(item => (
                  <button key={item.label}
                    className="text-[9px] flex items-center gap-1 transition-colors duration-150"
                    style={{ color: "var(--rt-dim)" }}
                    title={`${item.label} — coming soon`}>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 animate-panel-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-copper)" }}>
              artifact registry
            </span>
            <span className="text-[10px] font-mono" style={{ color: "var(--rt-subtext)" }}>
              {artifacts.length} items
            </span>
          </div>

          {artifacts.length === 0 ? (
            <p className="text-[11px]" style={{ color: "var(--rt-dim)" }}>
              No artifacts yet. Start forging.
            </p>
          ) : (
            <div className="space-y-2">
              {artifacts.map((art) => (
                <div key={art.id} className="border border-dashed"
                  style={{ borderColor: "var(--rt-border-dash)" }}>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left"
                    onClick={() => setExpanded(expanded === art.id ? null : art.id)}>
                    <span className="text-[10px]" style={{ color: KIND_COLOR[art.kind] }}>
                      {KIND_ICON[art.kind]}
                    </span>
                    <span className="flex-1 text-[10px]" style={{ color: "var(--rt-text)" }}>
                      {art.label}
                    </span>
                    <span className="text-[9px]" style={{ color: KIND_COLOR[art.kind] }}>
                      {art.kind}
                    </span>
                    <span className="text-[9px] ml-1" style={{ color: "var(--rt-dim)" }}>
                      {expanded === art.id ? "▾" : "▸"}
                    </span>
                  </button>
                  {expanded === art.id && (
                    <div className="px-3 pb-3 pt-0 border-t border-dashed animate-panel-in"
                      style={{ borderColor: "var(--rt-border-dash)" }}>
                      <p className="text-[10px] leading-relaxed whitespace-pre-wrap mt-2"
                        style={{ color: "var(--rt-subtext)" }}>
                        {art.content.slice(0, 500)}{art.content.length > 500 ? "…" : ""}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
