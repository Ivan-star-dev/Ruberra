/**
 * RUBERRA Creation — Execution Chamber
 * Home → Chat / Terminal / Archive / Blueprint / Engine
 */

import { useRef, useEffect, useState } from 'react';
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
  id:          'creation',
  label:       'Creation',
  tagline:     'Output engine. Directive in, artifact out.',
  placeholder: 'Directive — describe what to build…',
  accent:      'var(--r-warn)',
  glyph:       <CreationGlyph />,
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
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Artifact Archive</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--r-dim)' }}>{artifacts.length} artifacts</span>
            <button onClick={() => navigate('creation', 'home')} style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--r-dim)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
          </div>
        </div>
        {artifacts.length === 0
          ? <p style={{ fontSize: '11px', color: 'var(--r-dim)', fontFamily: "'Inter', system-ui, sans-serif" }}>No artifacts yet — start building in Chat or Terminal</p>
          : artifacts.map(m => (
            <div key={m.id} style={{ border: '1px solid var(--r-border)', borderRadius: '6px', background: 'var(--r-surface)', padding: '13px 16px', marginBottom: '8px' }}>
              {m.blocks && m.blocks.length > 0 ? <BlockRenderer blocks={m.blocks} /> : (
                <p style={{ fontSize: '12px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '1.65' }}>
                  {m.content.slice(0, 300)}{m.content.length > 300 ? '…' : ''}
                </p>
              )}
            </div>
          ))}
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
