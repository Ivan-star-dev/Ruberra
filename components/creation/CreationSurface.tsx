"use client";

/**
 * CREATION CANON — LOCKED STANDARD
 * ─────────────────────────────────────────────────────────────────────────────
 * This component defines the canonical Creation chamber surface for Ruberra.
 * It is the approved, permanent output grammar for the Creation tab.
 *
 * VISUAL LAW (do not override):
 *   - mineral-white shell background (r-* tokens only)
 *   - Creation does NOT use terminal-dark regime by default
 *   - clean sans-serif for all body content
 *   - mono ONLY for: labels, chips, metadata strips, counters, technical tags
 *   - hairline borders only — no thick strokes, no dashed in mineral context
 *   - semantic green = var(--r-ok), restrained moss — never neon
 *   - no amber/copper — those belong to Lab code organ and terminal insets
 *   - no decorative gradients, no visual noise
 *   - no rounded-xl — rounded-sm or square edges only
 *
 * CANONICAL BLOCKS (do not remove or replace):
 *   - compact CREATION chamber label top-left
 *   - dominant central output card
 *   - progress bar with restrained semantic fill
 *   - deliverables checklist with clearly readable checked/pending states
 *   - build phases sequence strip
 *   - phase / blocking issues / steps remaining meta strip
 *   - active/running chip
 *   - integrated input bar directly below the output card
 *   - operational footer meta strip
 *
 * WHAT MUST NEVER HAPPEN:
 *   - do not replace this with rt-* terminal-dark regime
 *   - do not turn this into a generic chat surface
 *   - do not inject neon greens, electric accents, or copper
 *   - do not remove the progress bar or checklist grammar
 *   - do not flatten the card hierarchy
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { type Message } from "../shell/types";

interface CreationSurfaceProps {
  messages:  Message[];
  isLoading: boolean;
  onSend:    (text: string) => void;
}

/* ── Types ──────────────────────────────────────────────────── */

type BuildPhase = "ready" | "briefing" | "building" | "reviewing" | "done";

interface DeliverableItem {
  text:    string;
  checked: boolean;
}

interface OutputCard {
  buildNum:     number;
  directive:    string;
  body:         string;
  deliverables: DeliverableItem[];
  progressPct:  number;
  phase:        BuildPhase;
  isStreaming:  boolean;
}

/* ── Parsing ────────────────────────────────────────────────── */

const LIST_RE = /^[\-\*\•]\s+(.+)$/;
const ORDERED_RE = /^\d+\.\s+(.+)$/;
const CHECKED_RE = /^\[x\]\s+(.+)$/i;
const UNCHECKED_RE = /^\[\s\]\s+(.+)$/i;

function parseDeliverables(content: string): DeliverableItem[] {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  const items: DeliverableItem[] = [];

  for (const line of lines) {
    if (CHECKED_RE.test(line)) {
      items.push({ text: line.replace(CHECKED_RE, "$1"), checked: true });
    } else if (UNCHECKED_RE.test(line)) {
      items.push({ text: line.replace(UNCHECKED_RE, "$1"), checked: false });
    } else if (LIST_RE.test(line)) {
      items.push({ text: line.replace(LIST_RE, "$1"), checked: false });
    } else if (ORDERED_RE.test(line)) {
      items.push({ text: line.replace(ORDERED_RE, "$1"), checked: false });
    }
    if (items.length >= 7) break;
  }

  return items;
}

function extractBody(content: string): string {
  const lines = content.split("\n").map(l => l.trim());
  const prose = lines.filter(l =>
    l.length > 0 &&
    !LIST_RE.test(l) &&
    !ORDERED_RE.test(l) &&
    !CHECKED_RE.test(l) &&
    !UNCHECKED_RE.test(l)
  );
  return prose.slice(0, 3).join(" ").slice(0, 320);
}

function buildOutputCard(
  messages: Message[],
  isLoading: boolean,
  streamingProgress: number,
): OutputCard | null {
  const userMsgs      = messages.filter(m => m.role === "user");
  const assistantMsgs = messages.filter(m => m.role === "assistant");
  const buildNum      = userMsgs.length;

  if (buildNum === 0) return null;

  const lastUser      = userMsgs[userMsgs.length - 1];
  const lastAssistant = assistantMsgs[assistantMsgs.length - 1];

  const content     = lastAssistant?.content ?? "";
  const deliverables = parseDeliverables(content);
  const body        = extractBody(content);

  const checkedCount = deliverables.filter(d => d.checked).length;
  const progressPct  = isLoading
    ? streamingProgress
    : deliverables.length > 0
      ? Math.round((checkedCount / deliverables.length) * 100)
      : content.length > 0 ? 100 : 0;

  const phase: BuildPhase =
    isLoading && content.length === 0 ? "briefing"
    : isLoading                        ? "building"
    : content.length > 0 && buildNum > 1 ? "done"
    : content.length > 0               ? "reviewing"
    : "ready";

  return {
    buildNum,
    directive:    lastUser.content,
    body,
    deliverables,
    progressPct,
    phase,
    isStreaming:  isLoading,
  };
}

/* ── Main component ─────────────────────────────────────────── */

export default function CreationSurface({ messages, isLoading, onSend }: CreationSurfaceProps) {
  const [draft, setDraft]           = useState("");
  const [streamPct, setStreamPct]   = useState(0);
  const textRef                     = useRef<HTMLTextAreaElement>(null);
  const threadRef                   = useRef<HTMLDivElement>(null);

  /* Animate progress bar during streaming */
  useEffect(() => {
    if (!isLoading) { setStreamPct(0); return; }
    setStreamPct(12);
    const ticks = [800, 1800, 3200, 5000, 7500];
    const targets = [28, 44, 61, 74, 82];
    const timers = ticks.map((ms, i) =>
      setTimeout(() => setStreamPct(targets[i]), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  /* Auto-scroll on new messages */
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textRef.current;
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

  const card   = buildOutputCard(messages, isLoading, streamPct);
  const builds = messages.filter(m => m.role === "user").length;

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* ── Chamber header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--r-subtext)" }}>
          Creation
        </span>
        <div className="flex items-center gap-2">
          {isLoading && <ActiveChip />}
          {builds > 0 && !isLoading && (
            <span className="font-mono text-[10px]" style={{ color: "var(--r-dim)" }}>
              {builds} build{builds !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable area ────────────────────────────────── */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-6 pb-2">

        {/* Empty state — canonical template */}
        {!card && (
          <EmptyOutputCard />
        )}

        {/* Active / populated output card */}
        {card && (
          <OutputCardBlock card={card} />
        )}

        {/* Previous builds — compact history */}
        {builds > 1 && (
          <PreviousBuilds messages={messages} currentBuildNum={builds} />
        )}

      </div>

      {/* ── Integrated input bar ───────────────────────────── */}
      <div className="px-6 pb-5 pt-3 shrink-0 border-t" style={{ borderColor: "var(--r-border)" }}>
        <div
          className="flex items-end gap-3 px-4 py-3 border transition-colors duration-150"
          style={{
            backgroundColor: "var(--r-surface)",
            borderColor:     "var(--r-border)",
          }}
        >
          <textarea
            ref={textRef}
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Directive — describe what to build…"
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed disabled:opacity-40"
            style={{ color: "var(--r-text)", minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || isLoading}
            className="text-xs font-mono px-3 py-1 border transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            style={{
              borderColor: "var(--r-border)",
              color:       "var(--r-subtext)",
              backgroundColor: "var(--r-elevated)",
            }}
          >
            build
          </button>
        </div>

        {/* Operational meta strip */}
        <div className="flex items-center justify-between mt-1.5 px-0.5">
          <span className="font-mono text-[10px]" style={{ color: "var(--r-dim)" }}>
            Enter to build · Shift+Enter for newline
          </span>
          <div className="flex items-center gap-3">
            <MetaAction label="export" icon="↓" />
            <MetaAction label="version" icon="⊕" />
            <MetaAction label="attach" icon="⊞" />
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Empty output card — canonical grammar template ─────────── */

function EmptyOutputCard() {
  return (
    <div className="mt-2 mb-4 border animate-panel-in"
      style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>

      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "var(--r-border-soft)" }}>
        <div className="flex items-center gap-2.5">
          <BuildGlyph />
          <span className="text-xs font-medium" style={{ color: "var(--r-text)" }}>
            Output
          </span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: "var(--r-dim)" }}>
          ready
        </span>
      </div>

      {/* Progress bar — empty */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--r-subtext)" }}>
            Deliverables
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--r-dim)" }}>
            0%
          </span>
        </div>
        <ProgressBar pct={0} streaming={false} />
      </div>

      {/* Placeholder checklist */}
      <div className="px-5 pb-4 pt-1 space-y-2">
        {["First deliverable", "Second deliverable", "Third deliverable"].map((label, i) => (
          <ChecklistItem key={i} text={label} checked={false} placeholder />
        ))}
      </div>

      {/* Phase strip */}
      <PhaseStrip phase="ready" stepsRemaining={0} blocking="none" />
    </div>
  );
}

/* ── Active / populated output card ─────────────────────────── */

function OutputCardBlock({ card }: { card: OutputCard }) {
  return (
    <div className="mt-2 mb-4 border animate-panel-in"
      style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>

      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "var(--r-border-soft)" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <BuildGlyph active={card.isStreaming} />
          <span className="text-[10px] font-mono shrink-0"
            style={{ color: "var(--r-dim)" }}>
            build #{card.buildNum}
          </span>
          <span className="text-xs truncate" style={{ color: "var(--r-text)" }}>
            {card.directive.slice(0, 64)}{card.directive.length > 64 ? "…" : ""}
          </span>
        </div>
        {card.isStreaming && <ActiveChip inline />}
      </div>

      {/* Body prose — if any, above deliverables */}
      {card.body && !card.isStreaming && (
        <div className="px-5 pt-3 pb-1">
          <p className="text-sm leading-relaxed" style={{ color: "var(--r-text)" }}>
            {card.body}
          </p>
        </div>
      )}

      {/* Streaming skeleton */}
      {card.isStreaming && card.body.length === 0 && (
        <div className="px-5 pt-3 pb-1 flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1 h-1 rounded-full animate-bounce"
              style={{ backgroundColor: "var(--r-ok)", animationDelay: `${i * 120}ms` }} />
          ))}
          <span className="text-xs" style={{ color: "var(--r-subtext)" }}>
            {card.phase === "briefing" ? "Briefing…" : "Building…"}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--r-subtext)" }}>
            Deliverables
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--r-dim)" }}>
            {card.progressPct}%
          </span>
        </div>
        <ProgressBar pct={card.progressPct} streaming={card.isStreaming} />
      </div>

      {/* Checklist */}
      <div className="px-5 pb-3 pt-1 space-y-2">
        {card.deliverables.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--r-subtext)" }}>
            {card.isStreaming ? "Deriving deliverables…" : "Output ready below ↑"}
          </p>
        ) : (
          card.deliverables.map((item, i) => (
            <ChecklistItem key={i} text={item.text} checked={item.checked} />
          ))
        )}
      </div>

      {/* Phase strip */}
      <PhaseStrip
        phase={card.phase}
        stepsRemaining={card.deliverables.filter(d => !d.checked).length}
        blocking="none"
      />
    </div>
  );
}

/* ── Previous builds — compact history ──────────────────────── */

function PreviousBuilds({ messages, currentBuildNum }: { messages: Message[]; currentBuildNum: number }) {
  const [open, setOpen] = useState(false);
  const pairs: { user: Message; assistant: Message | null }[] = [];
  for (let i = 0; i < messages.length - 2; i++) {
    if (messages[i].role === "user") {
      pairs.push({ user: messages[i], assistant: messages[i + 1] ?? null });
    }
  }
  if (pairs.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 mb-2"
        onClick={() => setOpen(o => !o)}>
        <span className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "var(--r-dim)" }}>
          {open ? "▾" : "▸"} Previous builds ({pairs.length})
        </span>
      </button>
      {open && (
        <div className="space-y-2 animate-panel-in">
          {pairs.slice().reverse().map(({ user, assistant }, i) => (
            <div key={user.id} className="border px-4 py-2.5"
              style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px]" style={{ color: "var(--r-dim)" }}>
                  build #{currentBuildNum - 1 - i}
                </span>
                <span className="font-mono text-[9px]" style={{ color: "var(--r-dim)" }}>
                  {new Date(user.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--r-text)" }}>{user.content}</p>
              {assistant?.content && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--r-subtext)" }}>
                  {assistant.content.slice(0, 160)}{assistant.content.length > 160 ? "…" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Canonical sub-components ───────────────────────────────── */

function ProgressBar({ pct, streaming }: { pct: number; streaming: boolean }) {
  return (
    <div className="h-1 w-full rounded-full overflow-hidden"
      style={{ backgroundColor: "var(--r-border)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          backgroundColor: "var(--r-ok)",
          opacity: streaming ? 0.7 : 1,
        }}
      />
    </div>
  );
}

function ChecklistItem({
  text,
  checked,
  placeholder = false,
}: {
  text:         string;
  checked:      boolean;
  placeholder?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5"
        style={{
          borderColor:     checked ? "var(--r-ok)" : "var(--r-border)",
          backgroundColor: checked ? "var(--r-ok)" : "transparent",
          opacity:         placeholder ? 0.3 : 1,
        }}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4l2 2 3-3.5" stroke="white" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        className="text-xs leading-relaxed"
        style={{
          color:   placeholder ? "var(--r-dim)" :
                   checked     ? "var(--r-subtext)" : "var(--r-text)",
          opacity: placeholder ? 0.5 : 1,
        }}
      >
        {text}
      </span>
    </div>
  );
}

const PHASE_SEQUENCE: BuildPhase[] = ["ready", "briefing", "building", "reviewing", "done"];
const PHASE_LABEL: Record<BuildPhase, string> = {
  ready:     "Ready",
  briefing:  "Brief",
  building:  "Build",
  reviewing: "Review",
  done:      "Done",
};

function PhaseStrip({
  phase,
  stepsRemaining,
  blocking,
}: {
  phase:          BuildPhase;
  stepsRemaining: number;
  blocking:       string;
}) {
  const currentIdx = PHASE_SEQUENCE.indexOf(phase);

  return (
    <div className="flex items-center gap-0 px-5 py-2.5 border-t"
      style={{ borderColor: "var(--r-border-soft)", backgroundColor: "var(--r-elevated)" }}>

      {/* Phase chips */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {PHASE_SEQUENCE.map((p, i) => {
          const isDone    = i < currentIdx;
          const isActive  = i === currentIdx;
          const isPending = i > currentIdx;
          return (
            <span key={p}
              className="font-mono text-[9px] px-1.5 py-0.5"
              style={{
                color:           isDone   ? "var(--r-ok)" :
                                 isActive ? "var(--r-text)" :
                                 "var(--r-dim)",
                backgroundColor: isActive ? "var(--r-border)" : "transparent",
                opacity:         isPending ? 0.5 : 1,
              }}>
              {PHASE_LABEL[p]}
              {i < PHASE_SEQUENCE.length - 1 && (
                <span style={{ color: "var(--r-dim)", marginLeft: "4px" }}>›</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        {stepsRemaining > 0 && (
          <span className="font-mono text-[9px]" style={{ color: "var(--r-subtext)" }}>
            {stepsRemaining} step{stepsRemaining !== 1 ? "s" : ""} remaining
          </span>
        )}
        <span className="font-mono text-[9px]" style={{ color: "var(--r-dim)" }}>
          blocking: {blocking}
        </span>
      </div>
    </div>
  );
}

function ActiveChip({ inline = false }: { inline?: boolean }) {
  return (
    <span
      className="font-mono text-[9px] px-2 py-0.5 flex items-center gap-1.5"
      style={{
        color:           "var(--r-ok)",
        backgroundColor: "color-mix(in srgb, var(--r-ok) 12%, var(--r-surface))",
        border:          "1px solid color-mix(in srgb, var(--r-ok) 30%, var(--r-border))",
      }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--r-ok)" }} />
      running
    </span>
  );
}

function MetaAction({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      className="flex items-center gap-1 font-mono text-[9px] transition-colors duration-150"
      style={{ color: "var(--r-dim)" }}
      title={`${label} — coming soon`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function BuildGlyph({ active = false }: { active?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ color: active ? "var(--r-ok)" : "var(--r-subtext)" }}>
      <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.5 6h5M3.5 4h3M3.5 8h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
