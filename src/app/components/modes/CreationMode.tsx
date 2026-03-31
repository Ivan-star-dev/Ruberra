/**
 * RUBERRA Creation — Build Chamber  ·  Metamorphosis Edition
 * Home → Chat / Terminal / Archive / Blueprint / Engine / Artifact
 */

import { useEffect, useRef } from "react";
import { type Message, type CreationView, type NavFn } from "../shell-types";
import { BlockRenderer } from "../BlockRenderer";
import { ChamberChat, CreationGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const CREATION_CONFIG: ChamberConfig = {
  id:          "creation",
  label:       "Creation",
  tagline:     "Architect. Build. Ship. No compromises.",
  placeholder: "Describe what you want to build…",
  accent:      "var(--r-accent)",
  glyph:       <CreationGlyph />,
};

// ─── Fade wrapper ─────────────────────────────────────────────────────────────

function FadeIn({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.18s ease";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, ...style }}>
      {children}
 * RUBERRA Creation — Execution Chamber (no motion/react)
 * CSS keyframe animations for loading states.
 */

import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { type Message, type CreationView, type NavFn } from '../shell-types';
import { BlockRenderer } from '../BlockRenderer';
import { ChamberChat, CreationGlyph, type ChamberConfig } from '../ChamberChat';
import { CreationDiscover } from '../discovery/CreationDiscover';
import { CreationBlueprintDetail } from '../detail/CreationBlueprintDetail';
import { CreationEngineDetail } from '../detail/CreationEngineDetail';
import { RuberraTerminal } from '../RuberraTerminal';

const CM_KF = `
  @keyframes cm-dot { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
  @keyframes cm-run { 0%,100%{opacity:0.4} 50%{opacity:1}   }
`;

const CREATION_CONFIG: ChamberConfig = {
  id: 'creation', label: 'Creation',
  tagline: 'Output engine. Directive in, artifact out.',
  placeholder: 'Directive — describe what to build…',
  accent: 'var(--r-warn)',
  glyph: <CreationGlyph />,
};

function FadeIn({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = '0';
    const id = requestAnimationFrame(() => { el.style.transition = 'opacity 0.18s ease'; el.style.opacity = '1'; });
    return () => cancelAnimationFrame(id);
  }, []);
  return <div ref={ref} style={{ opacity: 0, ...style }}>{children}</div>;
}

function CreationArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const artifacts = [...messages].filter(m => m.role === 'assistant').reverse();
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'var(--r-bg)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Artifact Archive</p>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)' }}>{artifacts.length} artifacts</span>
        </div>
        {artifacts.length === 0
          ? <p style={{ fontSize: '11px', color: 'var(--r-dim)', fontFamily: "'Inter', system-ui, sans-serif" }}>No artifacts yet</p>
          : artifacts.map(m => (
            <div key={m.id} style={{ border: '1px solid var(--r-border)', borderRadius: '6px', background: 'var(--r-surface)', padding: '13px 16px', marginBottom: '8px' }}>
              {m.blocks && m.blocks.length > 0 ? <BlockRenderer blocks={m.blocks} /> : (
                <p style={{ fontSize: '12px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '1.65' }}>{m.content.slice(0, 300)}{m.content.length > 300 ? '…' : ''}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Creation Home ────────────────────────────────────────────────────────────

function CreationHome({ onStartSession, navigate, onSend }: { onStartSession: () => void; navigate: NavFn; onSend: (t: string) => void }) {
  const starters = [
    { label: "Build a distributed job queue",          hint: "architecture · eng" },
    { label: "Design an AI agent orchestration system", hint: "blueprint · plan" },
    { label: "Create a technical API specification",    hint: "spec · REST" },
    { label: "Draft an executive strategy brief",       hint: "brief · leadership" },
    { label: "Generate a secure service architecture",  hint: "security · infra" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--r-bg)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ opacity: 0.5, marginBottom: "16px" }}><CreationGlyph /></div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              Creation
            </p>
            <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 }}>
              Build real things. Blueprint to artifact in one flow.
            </p>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            <button
              onClick={onStartSession}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
            >
              Start building →
            </button>
            <button
              onClick={() => navigate("creation", "terminal")}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "transparent", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--r-text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--r-subtext)"; }}
            >
              Terminal
            </button>
          </div>

          {/* Starter directives */}
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Quick directives
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {starters.map(({ label, hint }) => (
              <button
                key={label}
                onClick={() => onSend(label)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</span>
                <span style={{ fontSize: "10px", color: "var(--r-dim)", fontFamily: "monospace" }}>{hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
type BuildPhase = 'ready' | 'briefing' | 'building' | 'reviewing' | 'done';
const PHASES: BuildPhase[] = ['ready', 'briefing', 'building', 'reviewing', 'done'];
const PHASE_LABEL: Record<BuildPhase, string> = { ready: 'Ready', briefing: 'Brief', building: 'Build', reviewing: 'Review', done: 'Done' };

const LIST_RE      = /^[-*•]\s+(.+)$/;
const CHECKED_RE   = /^\[x\]\s+(.+)$/i;
const UNCHECKED_RE = /^\[ \]\s+(.+)$/i;

function parseDeliverables(content: string) {
  const items: { text: string; checked: boolean }[] = [];
  for (const line of content.split('\n').map(l => l.trim())) {
    if (CHECKED_RE.test(line))        items.push({ text: line.replace(CHECKED_RE, '$1'), checked: true });
    else if (UNCHECKED_RE.test(line)) items.push({ text: line.replace(UNCHECKED_RE, '$1'), checked: false });
    else if (LIST_RE.test(line))      items.push({ text: line.replace(LIST_RE, '$1'), checked: false });
    if (items.length >= 7) break;
  }
  return items;
}

function extractBody(content: string) {
  return content.split('\n').map(l => l.trim()).filter(l => l && !LIST_RE.test(l) && !CHECKED_RE.test(l) && !UNCHECKED_RE.test(l) && !l.startsWith('TYPE:')).slice(0, 3).join(' ').slice(0, 320);
}

function ProgressBar({ pct, streaming }: { pct: number; streaming: boolean }) {
  return (
    <div style={{ height: '2px', background: 'var(--r-border)', borderRadius: '1px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: 'var(--r-ok)', borderRadius: '1px', transition: 'width 0.8s ease', opacity: streaming ? 0.65 : 1 }} />
    </div>
  );
}

// ─── Blueprint view ───────────────────────────────────────────────────────────

function CreationBlueprint({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const blueprintBlocks = messages
    .filter((m) => m.role === "assistant" && m.blocks && m.blocks.length > 0)
    .flatMap((m) => (m.blocks ?? []).filter((b) => ["execution", "creation", "blueprint"].includes(b.type)));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Blueprint
          </p>
          <button
            onClick={() => navigate("creation", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>

        {blueprintBlocks.length === 0 ? (
          <div style={{ paddingTop: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              No blueprints yet — generate execution plans or architecture specs in Chat
            </p>
            <button
              onClick={() => navigate("creation", "chat")}
              style={{ marginTop: "12px", fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
            >
              → Go to Chat
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {blueprintBlocks.map((block, i) => (
              <div key={i}><BlockRenderer blocks={[block]} /></div>
            ))}
          </div>
        )}
      </div>
function CheckItem({ text, checked, placeholder = false }: { text: string; checked: boolean; placeholder?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', opacity: placeholder ? 0.35 : 1 }}>
      <span style={{ width: '13px', height: '13px', borderRadius: '3px', border: `1.5px solid ${checked ? 'var(--r-ok)' : 'var(--r-border)'}`, background: checked ? 'var(--r-ok)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'background 0.15s ease' }}>
        {checked && <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span style={{ fontSize: '12px', fontFamily: "'Inter', system-ui, sans-serif", color: checked ? 'var(--r-muted)' : 'var(--r-text)', lineHeight: '1.55', textDecoration: checked ? 'line-through' : 'none' }}>{text}</span>
    </div>
  );
}

function PhaseStrip({ phase }: { phase: BuildPhase }) {
  const idx = PHASES.indexOf(phase);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '7px 16px', borderTop: '1px solid var(--r-border-soft)', background: 'var(--r-rail)', gap: '2px' }}>
      {PHASES.map((p, i) => (
        <span key={p} style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.06em', color: i < idx ? 'var(--r-ok)' : i === idx ? 'var(--r-text)' : 'var(--r-dim)', fontWeight: i === idx ? 600 : 400, opacity: i > idx ? 0.5 : 1 }}>
          {PHASE_LABEL[p]}{i < PHASES.length - 1 && <span style={{ color: 'var(--r-dim)', marginLeft: '4px', marginRight: '2px' }}>›</span>}
        </span>
      ))}
    </div>
  );
}

function PrevBuilds({ messages, current }: { messages: Message[]; current: number }) {
  const [open, setOpen] = useState(false);
  const userMsgs = messages.filter(m => m.role === 'user').slice(0, -1);
  if (userMsgs.length === 0) return null;
  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={() => setOpen(o => !o)} style={{ fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--r-dim)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', padding: '0 2px', transition: 'color 0.1s ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-subtext)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-dim)'; }}
      >{open ? '▾' : '▸'} Previous builds ({userMsgs.length})</button>
      {open && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {userMsgs.slice().reverse().map((m, i) => (
            <div key={m.id} style={{ border: '1px solid var(--r-border)', background: 'var(--r-surface)', borderRadius: '5px', padding: '9px 13px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', marginBottom: '5px', letterSpacing: '0.06em' }}>build #{current - 1 - i}</p>
              <p style={{ fontSize: '12px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", margin: 0 }}>{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function CreationArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const sessions = messages.filter((m) => m.role === "user").reverse();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Creation Archive
          </p>
          <button
            onClick={() => navigate("creation", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No builds yet</p>
        ) : (
          sessions.map((m, i) => (
            <button
              key={m.id}
              onClick={() => navigate("creation", "chat")}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "6px", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.content.slice(0, 80)}{m.content.length > 80 ? "…" : ""}
              </span>
              <span style={{ fontSize: "9px", color: "var(--r-dim)", fontFamily: "monospace", flexShrink: 0 }}>→</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CreationMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  creationView, onCreationView, navigate, detailId,
}: {
  messages:        Message[];
  isLoading:       boolean;
  draft:           string;
  onDraftChange:   (t: string) => void;
  onSend:          (t: string) => void;
  onCancel:        () => void;
  creationView:    CreationView;
  onCreationView:  (v: CreationView) => void;
  navigate:        NavFn;
  detailId:        string;
}) {
  const showHome = creationView === "home" || (!messages.length && creationView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <CreationHome
        onStartSession={() => {
          onCreationView("chat");
          onSend("Design an AI agent orchestration system: define the interface contract, execution model, and error boundary strategy.");
        }}
        navigate={navigate}
        onSend={(t) => { onCreationView("chat"); onSend(t); }}
      />
    </FadeIn>
  );

  if (creationView === "terminal" || creationView === "engine") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Creation · Build Terminal"
      placeholder="Enter a build directive, spec request, or architecture query…"
    />
  );

  if (creationView === "blueprint") return <CreationBlueprint messages={messages} navigate={navigate} />;
  if (creationView === "archive")   return <CreationArchive   messages={messages} navigate={navigate} />;

  if (creationView === "artifact") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="Creation · Artifacts"
      placeholder="Refine or export your artifact…"
    />
  );

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={CREATION_CONFIG}
    />
  );
function BuildSurface({ messages, isLoading, draft, onDraftChange, onSend, onCancel }: { messages: Message[]; isLoading: boolean; draft: string; onDraftChange: (t: string) => void; onSend: (t: string) => void; onCancel: () => void; }) {
  const [streamPct, setStreamPct] = useState(0);
  const textRef   = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) { setStreamPct(0); return; }
    setStreamPct(12);
    const ticks = [800, 1800, 3200, 5000, 7500]; const targets = [28, 44, 61, 74, 82];
    const timers = ticks.map((ms, i) => setTimeout(() => setStreamPct(targets[i]), ms));
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages]);
  useEffect(() => { const el = textRef.current; if (!el) return; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 152)}px`; }, [draft]);

  function submit() { const text = draft.trim(); if (!text || isLoading) return; onDraftChange(''); onSend(text); }

  const userMsgs = messages.filter(m => m.role === 'user');
  const asstMsgs = messages.filter(m => m.role === 'assistant');
  const buildNum = userMsgs.length;
  const lastUser = userMsgs[userMsgs.length - 1];
  const lastAsst = asstMsgs[asstMsgs.length - 1];
  const content  = lastAsst?.content ?? '';
  const deliverables = parseDeliverables(content);
  const body = extractBody(content);
  const checkedCount = deliverables.filter(d => d.checked).length;
  const progressPct  = isLoading ? streamPct : deliverables.length > 0 ? Math.round((checkedCount / deliverables.length) * 100) : content.length > 0 ? 100 : 0;
  const phase: BuildPhase = isLoading && content.length === 0 ? 'briefing' : isLoading ? 'building' : content.length > 0 && buildNum > 1 ? 'done' : content.length > 0 ? 'reviewing' : 'ready';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--r-bg)' }}>
      <div style={{ padding: '10px 32px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--r-dim)' }}>Creation</span>
        {isLoading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--r-ok)' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--r-ok)', display: 'inline-block', animation: 'cm-run 1s ease-in-out infinite' }} />
            running
          </span>
        )}
      </div>

      <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: '0 32px 14px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ border: '1px solid var(--r-border)', background: 'var(--r-surface)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--r-border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: isLoading ? 'var(--r-ok)' : 'var(--r-subtext)', flexShrink: 0 }}><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" /><path d="M3.5 6h5M3.5 4h3M3.5 8h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                {buildNum > 0 && <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', flexShrink: 0, letterSpacing: '0.06em' }}>build #{buildNum}</span>}
                {lastUser && <span style={{ fontSize: '11px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastUser.content.slice(0, 72)}{lastUser.content.length > 72 ? '…' : ''}</span>}
              </div>
            </div>

            {body && !isLoading && (
              <div style={{ padding: '13px 16px 6px' }}>
                <p style={{ fontSize: '12px', lineHeight: '1.65', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", margin: 0 }}>{body}</p>
              </div>
            )}

            {isLoading && content.length === 0 && (
              <div style={{ padding: '13px 16px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--r-ok)', display: 'inline-block', animation: `cm-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                ))}
                <span style={{ fontSize: '11px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif" }}>{phase === 'briefing' ? 'Briefing…' : 'Building…'}</span>
              </div>
            )}

            {lastAsst?.blocks && lastAsst.blocks.length > 0 && <div style={{ padding: '8px 16px' }}><BlockRenderer blocks={lastAsst.blocks} /></div>}

            <div style={{ padding: '12px 16px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--r-subtext)' }}>Deliverables</span>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)' }}>{progressPct}%</span>
              </div>
              <ProgressBar pct={progressPct} streaming={isLoading} />
            </div>

            <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {deliverables.length === 0
                ? (buildNum === 0
                    ? ['First deliverable', 'Second deliverable', 'Third deliverable'].map((l, i) => <CheckItem key={i} text={l} checked={false} placeholder />)
                    : <p style={{ fontSize: '11px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", margin: 0 }}>{isLoading ? 'Deriving deliverables…' : 'Output ready above'}</p>)
                : deliverables.map((d, i) => <CheckItem key={i} text={d.text} checked={d.checked} />)}
            </div>
            <PhaseStrip phase={phase} />
          </div>
          {buildNum > 1 && <PrevBuilds messages={messages} current={buildNum} />}
        </div>
      </div>

      <div style={{ padding: '10px 32px 18px', borderTop: '1px solid var(--r-border)', background: 'var(--r-bg)', flexShrink: 0 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', border: '1px solid var(--r-border)', background: 'var(--r-surface)', borderRadius: '8px', padding: '10px 12px 9px 14px' }}>
            <textarea ref={textRef} rows={1} value={draft} onChange={e => onDraftChange(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              disabled={isLoading} placeholder="Directive — describe what to build…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--r-text)', minHeight: '22px', maxHeight: '120px', lineHeight: '1.6' }}
            />
            <button onClick={submit} disabled={!draft.trim() || isLoading}
              style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--r-border)', background: draft.trim() && !isLoading ? 'var(--r-text)' : 'var(--r-rail)', color: draft.trim() && !isLoading ? 'white' : 'var(--r-dim)', cursor: draft.trim() && !isLoading ? 'pointer' : 'default', outline: 'none', borderRadius: '4px', flexShrink: 0, transition: 'background 0.15s ease' }}
            >build</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', letterSpacing: '0.04em' }}>↵ build · ⇧↵ newline</span>
            {isLoading && <button onClick={onCancel} style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-muted)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>esc to stop</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreationMode({ messages, isLoading, draft, onDraftChange, onSend, onCancel, creationView, onCreationView, navigate, detailId }: {
  messages: Message[]; isLoading: boolean; draft: string;
  onDraftChange: (t: string) => void; onSend: (t: string) => void; onCancel: () => void;
  creationView: CreationView; onCreationView: (v: CreationView) => void; navigate: NavFn; detailId: string;
}) {
  const showHome = creationView === 'home' || (!messages.length && creationView === 'chat');
  if (showHome) return (
    <>
      <style>{CM_KF}</style>
      <FadeIn style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CreationDiscover onEnterGenerator={() => { onCreationView('terminal'); }} navigate={navigate} />
      </FadeIn>
    </>
  );
  if (creationView === 'blueprint') return <CreationBlueprintDetail blueprintId={detailId} navigate={navigate} onStartChat={p => { onCreationView('terminal'); onSend(p); }} />;
  if (creationView === 'engine')    return <CreationEngineDetail    engineId={detailId}    navigate={navigate} onStartChat={p => { onCreationView('chat'); onSend(p); }} />;
  if (creationView === 'archive')   return <CreationArchive messages={messages} navigate={navigate} />;
  if (creationView === 'terminal')  return (
    <><style>{CM_KF}</style><RuberraTerminal messages={messages} isLoading={isLoading} draft={draft} onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel} chamberLabel="Creation · Build" placeholder="Directive — describe what to build, generate, or forge…" /></>
  );
  return <ChamberChat messages={messages} isLoading={isLoading} draft={draft} onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel} config={CREATION_CONFIG} />;
}
