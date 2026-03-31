'use client';
/**
 * RUBERRA — Mother Shell (Next.js entry)
 * Full state management with Supabase edge function streaming.
 * CSS keyframe animations — no motion/react dependency.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SovereignBar }       from '../../src/app/components/SovereignBar';
import { ShellSideRail }      from '../../src/app/components/ShellSideRail';
import { FloatingNoteSystem } from '../../src/app/components/FloatingNoteSystem';
import { LabMode }            from '../../src/app/components/modes/LabMode';
import { SchoolMode }         from '../../src/app/components/modes/SchoolMode';
import { CreationMode }       from '../../src/app/components/modes/CreationMode';
import { parseBlocks }        from '../../src/app/components/parseBlocks';
import type {
  Tab, Message, SignalStatus, LabView, SchoolView,
  CreationView, FloatingNote, Theme, NavFn,
} from '../../src/app/components/shell-types';

// ─── Constants ─────────────────────────────────────────────────────────────────────────────

const TABS: Tab[]      = ['lab', 'school', 'creation'];
const STORAGE_KEY      = 'ruberra_messages_v2';
const MAX_CONTEXT      = 20;
const SERVER_URL       = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/functions/v1/make-server-b9f46b68`;
const PUBLIC_ANON_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const SHELL_KF = `
  @keyframes shell-tab-in  { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shell-pulse   { 0%,100%{opacity:0.3} 50%{opacity:0.9} }
`;

type TabMessages = Record<Tab, Message[]>;
type TabLoading  = Record<Tab, boolean>;
type TabSignals  = Record<Tab, SignalStatus>;
type TabDrafts   = Record<Tab, string>;

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map(t => [t, value])) as Record<Tab, T>;
}

function loadMessages(): TabMessages {
  if (typeof window === 'undefined') return emptyRecord<Message[]>([]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TabMessages;
      if (TABS.every(t => Array.isArray(parsed[t]))) return parsed;
    }
  } catch { /* corrupt */ }
  return emptyRecord<Message[]>([]);
}

export default function RuberraShell() {
  const [activeTab,    setActiveTab]    = useState<Tab>('lab');
  const [messages,     setMessages]     = useState<TabMessages>(loadMessages);
  const [loading,      setLoading]      = useState<TabLoading>(emptyRecord(false));
  const [signals,      setSignals]      = useState<TabSignals>(emptyRecord<SignalStatus>('idle'));
  const [drafts,       setDrafts]       = useState<TabDrafts>(emptyRecord(''));
  const [labView,      setLabView]      = useState<LabView>('home');
  const [schoolView,   setSchoolView]   = useState<SchoolView>('home');
  const [creationView, setCreationView] = useState<CreationView>('home');
  const [detailId,     setDetailId]     = useState('');
  const [notes,        setNotes]        = useState<FloatingNote[]>([]);
  const [theme,        setTheme]        = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [messages]);

  const abortRefs = useRef<Record<Tab, AbortController | null>>(emptyRecord(null));

  const navigate = useCallback<NavFn>((tab, view, id = '') => {
    setActiveTab(tab);
    if (tab === 'lab')      setLabView(view as LabView);
    if (tab === 'school')   setSchoolView(view as SchoolView);
    if (tab === 'creation') setCreationView(view as CreationView);
    setDetailId(id);
  }, []);

  const handleCancel      = useCallback(() => { abortRefs.current[activeTab]?.abort(); }, [activeTab]);
  const handleDraftChange = useCallback((text: string) => { setDrafts(prev => ({ ...prev, [activeTab]: text })); }, [activeTab]);
  const handleClearTab    = useCallback((tab: Tab) => {
    setMessages(prev => ({ ...prev, [tab]: [] }));
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) { const p = JSON.parse(s) as TabMessages; p[tab] = []; localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
    } catch {}
  }, []);

  const applyParsedBlocks = useCallback((id: string, tab: Tab) => {
    setMessages(prev => ({
      ...prev,
      [tab]: prev[tab].map(m => {
        if (m.id !== id || m.role !== 'assistant') return m;
        const blocks = parseBlocks(m.content);
        return blocks.length > 0 ? { ...m, blocks } : m;
      }),
    }));
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;
    abortRefs.current[tab]?.abort();
    const controller = new AbortController();
    abortRefs.current[tab] = controller;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, tab, timestamp: Date.now() };
    setMessages(prev => ({ ...prev, [tab]: [...prev[tab], userMsg] }));
    setLoading(prev  => ({ ...prev, [tab]: true }));
    setSignals(prev  => ({ ...prev, [tab]: 'streaming' }));

    const assistantId = crypto.randomUUID();
    setMessages(prev => ({
      ...prev,
      [tab]: [...prev[tab], { id: assistantId, role: 'assistant', content: '', tab, timestamp: Date.now() }],
    }));

    let parseOnComplete = true;
    try {
      const history = messagesRef.current[tab]
        .filter(m => m.id !== assistantId)
        .slice(-MAX_CONTEXT)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${SERVER_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PUBLIC_ANON_KEY}` },
        body:   JSON.stringify({ tab, messages: [...history, { role: 'user', content: text }] }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev => ({
            ...prev,
            [tab]: prev[tab].map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m),
          }));
        }
      } finally { reader.releaseLock(); }

      setSignals(prev => ({ ...prev, [tab]: 'completed' }));
      setTimeout(() => { setSignals(prev => prev[tab] === 'completed' ? { ...prev, [tab]: 'idle' } : prev); }, 2400);

    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      parseOnComplete = false;
      if (isAbort) {
        setSignals(prev => ({ ...prev, [tab]: 'idle' }));
      } else {
        console.error('[Ruberra] stream error', err);
        setMessages(prev => ({
          ...prev,
          [tab]: prev[tab].map(m => m.id === assistantId ? { ...m, content: 'Error — please try again.' } : m),
        }));
        setSignals(prev => ({ ...prev, [tab]: 'error' }));
        setTimeout(() => { setSignals(prev => prev[tab] === 'error' ? { ...prev, [tab]: 'idle' } : prev); }, 2400);
      }
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
      abortRefs.current[tab] = null;
      if (parseOnComplete) applyParsedBlocks(assistantId, tab);
    }
  }, [activeTab, applyParsedBlocks]);

  const addNote = useCallback(() => {
    const note: FloatingNote = {
      id: crypto.randomUUID(), content: '', tab: activeTab, pinned: false,
      x: Math.max(80, window.innerWidth / 2 - 128 + Math.random() * 60),
      y: Math.max(80, 120 + Math.random() * 80),
      timestamp: Date.now(),
    };
    setNotes(prev => [...prev, note]);
  }, [activeTab]);

  const updateNote = useCallback((id: string, updates: Partial<FloatingNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id || n.pinned));
  }, []);

  const isLive = Object.values(signals).some(s => s === 'streaming');

  return (
    <>
      <style>{SHELL_KF}</style>
      <div style={{
        width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
        background: 'var(--r-bg)', fontFamily: "'Inter', sans-serif", overflow: 'hidden',
        transition: 'background 0.2s ease',
      }}>

        <SovereignBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLive={isLive}
          theme={theme}
          onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <ShellSideRail
            activeTab={activeTab}
            messages={messages}
            signals={signals}
            labView={labView}
            schoolView={schoolView}
            creationView={creationView}
            onLabView={v => { setLabView(v); setDetailId(''); }}
            onSchoolView={v => { setSchoolView(v); setDetailId(''); }}
            onCreationView={v => { setCreationView(v); setDetailId(''); }}
            onNewNote={addNote}
            onClearTab={handleClearTab}
            navigate={navigate}
          />

          <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div
              key={activeTab}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                animation: 'shell-tab-in 0.18s ease forwards',
              }}
            >
              {activeTab === 'lab' && (
                <LabMode
                  messages={messages.lab} isLoading={loading.lab} draft={drafts.lab}
                  onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel}
                  labView={labView} onLabView={v => { setLabView(v); setDetailId(''); }}
                  navigate={navigate} detailId={detailId}
                />
              )}
              {activeTab === 'school' && (
                <SchoolMode
                  messages={messages.school} isLoading={loading.school} draft={drafts.school}
                  onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel}
                  schoolView={schoolView} onSchoolView={v => { setSchoolView(v); setDetailId(''); }}
                  navigate={navigate} detailId={detailId}
                />
              )}
              {activeTab === 'creation' && (
                <CreationMode
                  messages={messages.creation} isLoading={loading.creation} draft={drafts.creation}
                  onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel}
                  creationView={creationView} onCreationView={v => { setCreationView(v); setDetailId(''); }}
                  navigate={navigate} detailId={detailId}
                />
              )}
            </div>
          </main>
        </div>

        {/* Status bar */}
        <div style={{
          height: '22px', borderTop: '1px solid var(--r-border)', background: 'var(--r-surface)',
          display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%', display: 'inline-block',
              background: isLive ? 'var(--r-accent)' : 'var(--r-pulse)',
              animation: 'shell-pulse 3.2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.10em', color: 'var(--r-subtext)', textTransform: 'uppercase' }}>
              {isLive ? 'Streaming' : 'Connected'}
            </span>
          </div>
          <div style={{ width: '1px', height: '10px', background: 'var(--r-border)', margin: '0 12px' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', letterSpacing: '0.05em' }}>
            RUBERRA-7B-r1 · 128k ctx
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', letterSpacing: '0.05em' }}>
            {activeTab.toUpperCase()}
          </span>
          <div style={{ width: '1px', height: '10px', background: 'var(--r-border)', margin: '0 12px' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)', letterSpacing: '0.04em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <FloatingNoteSystem notes={notes} onChange={updateNote} onRemove={removeNote} />
      </div>
    </>
  );
}
