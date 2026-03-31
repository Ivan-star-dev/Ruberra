/**
 * RUBERRA School — Learning Chamber  ·  Metamorphosis Edition
 * Home → Chat / Library / Archive / Track / Lesson / Role / Browse
 */

import { useEffect, useRef } from "react";
import { type Message, type SchoolView, type NavFn } from "../shell-types";
import { BlockRenderer } from "../BlockRenderer";
import { ChamberChat, SchoolGlyph, type ChamberConfig } from "../ChamberChat";
import { RuberraTerminal } from "../RuberraTerminal";

const SCHOOL_CONFIG: ChamberConfig = {
  id:          "school",
  label:       "School",
  tagline:     "Deep learning. First principles. Mastery.",
  placeholder: "Ask the School…",
  accent:      "var(--r-accent)",
  glyph:       <SchoolGlyph />,
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
    </div>
  );
}

// ─── School Home ──────────────────────────────────────────────────────────────

function SchoolHome({ onStartSession, navigate }: { onStartSession: () => void; navigate: NavFn }) {
  const topics = [
    { label: "Distributed Systems",     hint: "consensus · CAP · Raft" },
    { label: "Machine Learning Theory", hint: "gradients · optimization" },
    { label: "Cryptography",            hint: "ZKP · TLS · elliptic curves" },
    { label: "Operating Systems",       hint: "scheduling · memory · IPC" },
    { label: "Compilers & PL Theory",   hint: "parsing · types · IR" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--r-bg)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ opacity: 0.5, marginBottom: "16px" }}><SchoolGlyph /></div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              School
            </p>
            <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6 }}>
              Learn from first principles. Build durable knowledge.
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
              Start a session →
            </button>
            <button
              onClick={() => navigate("school", "library")}
              style={{ padding: "8px 16px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "transparent", cursor: "pointer", outline: "none", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.1s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--r-text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--r-subtext)"; }}
            >
              Library
            </button>
          </div>

          {/* Topic list */}
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
            Browse topics
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {topics.map(({ label, hint }) => (
              <button
                key={label}
                onClick={() => navigate("school", "chat")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</span>
                <span style={{ fontSize: "10px", color: "var(--r-dim)", fontFamily: "monospace" }}>{hint}</span>
              </button>
            ))}
          </div>
 * RUBERRA School — Learning Chamber (no motion/react)
 */

import { useState, useEffect, useRef } from 'react';
import { type Message, type SchoolView, type NavFn } from '../shell-types';
import { ChamberChat, SchoolGlyph, type ChamberConfig } from '../ChamberChat';
import { SchoolDiscover } from '../discovery/SchoolDiscover';
import { SchoolTrackDetail } from '../detail/SchoolTrackDetail';
import { SchoolLessonDetail } from '../detail/SchoolLessonDetail';
import { SchoolRoleDetail } from '../detail/SchoolRoleDetail';
import { SCHOOL_ROLES } from '../product-data';

const SCHOOL_CONFIG: ChamberConfig = {
  id: 'school', label: 'School',
  tagline: 'Structured progression. First principles first.',
  placeholder: 'Ask School…',
  accent: 'var(--r-ok)',
  glyph: <SchoolGlyph />,
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

interface LibraryResource { id: string; title: string; category: string; desc: string; kind: 'framework'|'blueprint'|'guide'|'reference'|'track'; }

const LIBRARY: LibraryResource[] = [
  { id: 'r1',  title: 'First Principles Thinking',  category: 'Frameworks', desc: 'Break any problem to its foundational axioms before reasoning upward.',                kind: 'framework' },
  { id: 'r2',  title: 'Feynman Technique',           category: 'Frameworks', desc: 'Teach what you learn, expose gaps, simplify until mastered.',                          kind: 'framework' },
  { id: 'r3',  title: 'Zettelkasten Method',         category: 'Blueprints', desc: 'Networked note system for building a living knowledge graph.',                         kind: 'blueprint' },
  { id: 'r4',  title: 'Spaced Repetition',           category: 'Blueprints', desc: 'Review intervals timed to the forgetting curve for lasting retention.',                kind: 'blueprint' },
  { id: 'r5',  title: 'Systems Thinking',            category: 'Frameworks', desc: 'Understand feedback loops, emergence, and leverage points.',                           kind: 'framework' },
  { id: 'r6',  title: 'Analytical Reading',          category: 'Guides',     desc: 'Active reading as dialogue: question, annotate, synthesize, judge.',                  kind: 'guide'     },
  { id: 'r7',  title: 'Mental Models Index',         category: 'References', desc: 'Curated mental models from physics, mathematics, and psychology.',                    kind: 'reference' },
  { id: 'r8',  title: 'Deep Work Protocol',          category: 'Guides',     desc: 'Structure focused sessions to produce cognitively demanding output.',                 kind: 'guide'     },
  { id: 'r9',  title: 'Logic & Argumentation',       category: 'Tracks',     desc: 'From syllogisms to informal fallacies — clean reasoning foundation.',                kind: 'track'     },
  { id: 'r10', title: 'Research Methods',            category: 'Tracks',     desc: 'Empirical design, evidence hierarchy, and analytical writing.',                       kind: 'track'     },
];

const KIND_ACCENT: Record<string, string> = { framework: 'var(--r-accent)', blueprint: 'var(--r-ok)', guide: 'var(--r-warn)', reference: 'var(--r-subtext)', track: 'var(--r-pulse)' };
const CATS = ['All', 'Frameworks', 'Blueprints', 'Guides', 'References', 'Tracks'];

function SchoolLibrary() {
  const [filter, setFilter]     = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const visible = filter === 'All' ? LIBRARY : LIBRARY.filter(r => r.category === filter);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--r-bg)' }}>
      <div style={{ padding: '14px 32px 12px', borderBottom: '1px solid var(--r-border)', background: 'var(--r-surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Library</p>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)' }}>{visible.length} resources</span>
        </div>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '4px', border: 'none', background: filter === cat ? 'var(--r-border)' : 'transparent', color: filter === cat ? 'var(--r-text)' : 'var(--r-subtext)', cursor: 'pointer', outline: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: filter === cat ? 500 : 400, transition: 'background 0.1s ease' }}>{cat}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 32px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {visible.map(r => (
            <div key={r.id} style={{ border: '1px solid var(--r-border)', borderRadius: '6px', background: 'var(--r-surface)', marginBottom: '6px', overflow: 'hidden' }}>
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', outline: 'none' }}>
                <span style={{ width: '2px', alignSelf: 'stretch', borderRadius: '1px', background: KIND_ACCENT[r.kind], flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '9px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>{r.title}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '8px', letterSpacing: '0.10em', color: KIND_ACCENT[r.kind], textTransform: 'uppercase', opacity: 0.8 }}>{r.kind}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '1.55', margin: 0 }}>{r.desc}</p>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--r-dim)', flexShrink: 0, marginTop: '1px' }}>{expanded === r.id ? '▾' : '▸'}</span>
              </button>
              {expanded === r.id && (
                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid var(--r-border-soft)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '1.6', margin: 0 }}>{r.desc} Ask School to guide you through it, generate a study plan, or produce examples.</p>
                  <span style={{ fontSize: '10px', color: 'var(--r-dim)', fontFamily: "'Inter', system-ui, sans-serif" }}>{r.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Library ──────────────────────────────────────────────────────────────────

function SchoolLibrary({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const lessonBlocks = messages
    .filter((m) => m.role === "assistant" && m.blocks && m.blocks.length > 0)
    .flatMap((m) => (m.blocks ?? []).filter((b) => b.type === "lesson"));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            Lesson Library
          </p>
          <button
            onClick={() => navigate("school", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>

        {lessonBlocks.length === 0 ? (
          <div style={{ paddingTop: "24px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>
              No lessons yet — start a learning session in Chat
            </p>
            <button
              onClick={() => navigate("school", "chat")}
              style={{ marginTop: "12px", fontSize: "10px", color: "var(--r-accent)", fontFamily: "monospace", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.05em" }}
            >
              → Go to Chat
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lessonBlocks.map((block, i) => (
              <div key={i}><BlockRenderer blocks={[block]} /></div>
            ))}
          </div>
        )}
function SchoolArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const all = [...messages].reverse();
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'var(--r-bg)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>School Archive</p>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)' }}>{all.length} entries</span>
        </div>
        {all.length === 0
          ? <p style={{ fontSize: '11px', color: 'var(--r-dim)', fontFamily: "'Inter', system-ui, sans-serif" }}>No messages yet</p>
          : all.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
              <div style={{ maxWidth: '72%', fontSize: '12px', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '1.62', padding: '9px 13px', borderRadius: m.role === 'user' ? '10px 10px 3px 10px' : '3px 10px 10px 10px', background: m.role === 'user' ? 'var(--r-elevated)' : 'var(--r-surface)', border: '1px solid var(--r-border)', color: 'var(--r-text)' }}>
                {m.content.slice(0, 300)}{m.content.length > 300 ? '…' : ''}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────

function SchoolArchive({ messages, navigate }: { messages: Message[]; navigate: NavFn }) {
  const sessions = messages.filter((m) => m.role === "user").reverse();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "-0.01em" }}>
            School Archive
          </p>
          <button
            onClick={() => navigate("school", "home")}
            style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", outline: "none", letterSpacing: "0.06em" }}
          >
            ← Home
          </button>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "'Inter', system-ui, sans-serif" }}>No sessions yet</p>
        ) : (
          sessions.map((m, i) => (
            <button
              key={m.id}
              onClick={() => navigate("school", "chat")}
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
function SchoolBrowse({ navigate }: { navigate: NavFn }) {
  const DEMAND_COLOR: Record<string, string> = { Critical: 'var(--r-err)', High: 'var(--r-warn)', Emerging: 'var(--r-ok)' };
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'var(--r-bg)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>Future Role Paths</p>
          <button onClick={() => navigate('school', 'home')} style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--r-dim)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SCHOOL_ROLES.map(role => (
            <button key={role.id} onClick={() => navigate('school', 'role', role.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px', border: '1px solid var(--r-border)', borderRadius: '8px', background: 'var(--r-surface)', cursor: 'pointer', outline: 'none', textAlign: 'left', transition: 'background 0.1s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--r-elevated)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--r-surface)'; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.01em' }}>{role.title}</span>
                  <span style={{ fontSize: '8px', fontFamily: 'monospace', color: DEMAND_COLOR[role.demand], letterSpacing: '0.08em' }}>{role.demand}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", margin: '0 0 8px', lineHeight: 1.5 }}>{role.desc.slice(0, 100)}…</p>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {role.skills.map(s => <span key={s} style={{ fontSize: '8px', fontFamily: 'monospace', color: 'var(--r-dim)', background: 'var(--r-rail)', border: '1px solid var(--r-border)', padding: '2px 6px', borderRadius: '3px' }}>{s}</span>)}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--r-dim)', flexShrink: 0, marginTop: '2px' }}>{role.requiredTracks.length} tracks →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SchoolMode({
  messages, isLoading, draft, onDraftChange, onSend, onCancel,
  schoolView, onSchoolView, navigate, detailId,
}: {
  messages:       Message[];
  isLoading:      boolean;
  draft:          string;
  onDraftChange:  (t: string) => void;
  onSend:         (t: string) => void;
  onCancel:       () => void;
  schoolView:     SchoolView;
  onSchoolView:   (v: SchoolView) => void;
  navigate:       NavFn;
  detailId:       string;
}) {
  const showHome = schoolView === "home" || (!messages.length && schoolView === "chat");

  if (showHome) return (
    <FadeIn style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <SchoolHome
        onStartSession={() => {
          onSchoolView("chat");
          onSend("Teach me distributed consensus from first principles, starting with the core problem and building up to modern algorithms.");
        }}
        navigate={navigate}
      />
    </FadeIn>
  );

  if (schoolView === "library")  return <SchoolLibrary  messages={messages} navigate={navigate} />;
  if (schoolView === "archive")  return <SchoolArchive  messages={messages} navigate={navigate} />;

  if (schoolView === "track" || schoolView === "lesson" || schoolView === "role" || schoolView === "browse") return (
    <RuberraTerminal
      messages={messages}
      isLoading={isLoading}
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={onSend}
      onCancel={onCancel}
      chamberLabel="School · Deep Study"
      placeholder="Enter a topic or learning directive…"
    />
  );

  return (
    <ChamberChat
      messages={messages} isLoading={isLoading} draft={draft}
      onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel}
      config={SCHOOL_CONFIG}
    />
  );
export function SchoolMode({ messages, isLoading, draft, onDraftChange, onSend, onCancel, schoolView, onSchoolView, navigate, detailId }: {
  messages: Message[]; isLoading: boolean; draft: string;
  onDraftChange: (t: string) => void; onSend: (t: string) => void; onCancel: () => void;
  schoolView: SchoolView; onSchoolView: (v: SchoolView) => void; navigate: NavFn; detailId: string;
}) {
  const showHome = schoolView === 'home' || (!messages.length && schoolView === 'chat');
  if (showHome) return (
    <FadeIn style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SchoolDiscover onEnterLesson={() => { onSchoolView('chat'); onSend('I want to learn about distributed systems — start from first principles'); }} navigate={navigate} />
    </FadeIn>
  );
  if (schoolView === 'track')  return <SchoolTrackDetail  trackId={detailId}  navigate={navigate} onStartChat={p => { onSchoolView('chat'); onSend(p); }} />;
  if (schoolView === 'lesson') return <SchoolLessonDetail lessonId={detailId} navigate={navigate} onStartChat={p => { onSchoolView('chat'); onSend(p); }} />;
  if (schoolView === 'role')   return <SchoolRoleDetail   roleId={detailId}   navigate={navigate} onStartChat={p => { onSchoolView('chat'); onSend(p); }} />;
  if (schoolView === 'browse') return <SchoolBrowse navigate={navigate} />;
  if (schoolView === 'library') return <SchoolLibrary />;
  if (schoolView === 'archive') return <SchoolArchive messages={messages} navigate={navigate} />;
  return <ChamberChat messages={messages} isLoading={isLoading} draft={draft} onDraftChange={onDraftChange} onSend={onSend} onCancel={onCancel} config={SCHOOL_CONFIG} />;
}
