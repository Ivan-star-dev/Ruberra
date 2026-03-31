/**
 * RUBERRA Floating Note System — draggable sticky notes
 */

import { useRef, useState, type PointerEvent } from 'react';
import { type FloatingNote, type Tab } from './shell-types';

interface FloatingNoteSystemProps {
  notes:    FloatingNote[];
  onChange: (id: string, updates: Partial<FloatingNote>) => void;
  onRemove: (id: string) => void;
}

export function FloatingNoteSystem({ notes, onChange, onRemove }: FloatingNoteSystemProps) {
  return (
    <>
      {notes.map(note => (
        <NoteCard key={note.id} note={note} onChange={updates => onChange(note.id, updates)} onRemove={() => onRemove(note.id)} />
      ))}
    </>
  );
}

function NoteCard({ note, onChange, onRemove }: { note: FloatingNote; onChange: (u: Partial<FloatingNote>) => void; onRemove: () => void; }) {
  const [dragging, setDragging] = useState(false);
  const offset  = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('textarea, button')) return;
    setDragging(true);
    const rect = cardRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    cardRef.current!.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    onChange({ x: Math.max(0, e.clientX - offset.current.x), y: Math.max(0, e.clientY - offset.current.y) });
  }

  const tabAccent: Record<Tab, string> = { lab: 'var(--r-accent)', school: 'var(--r-ok)', creation: 'var(--rt-amber)' };

  return (
    <div ref={cardRef} style={{ position: 'fixed', zIndex: 50, width: '240px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', left: note.x, top: note.y, background: 'var(--r-elevated)', border: `1px solid var(--r-border)`, borderTop: `2px solid ${tabAccent[note.tab]}`, borderRadius: '3px', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDragging(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', borderBottom: '1px solid var(--r-border-soft)' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: 'monospace', color: tabAccent[note.tab] }}>note · {note.tab}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => onChange({ pinned: !note.pinned })} style={{ fontSize: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: note.pinned ? 'var(--r-accent)' : 'var(--r-dim)', outline: 'none', lineHeight: 1 }} title={note.pinned ? 'Unpin' : 'Pin'}>⊕</button>
          <button onClick={onRemove} style={{ fontSize: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--r-dim)', outline: 'none', lineHeight: 1 }} title="Dismiss">✕</button>
        </div>
      </div>
      <textarea value={note.content} onChange={e => onChange({ content: e.target.value })} placeholder="Note…" rows={4}
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '11px', lineHeight: '1.6', padding: '8px 10px', color: 'var(--r-text)', cursor: 'text', userSelect: 'text', fontFamily: "'Inter', sans-serif" }}
      />
      <div style={{ padding: '2px 10px 6px' }}>
        <span style={{ fontSize: '9px', color: 'var(--r-dim)', fontFamily: 'monospace' }}>
          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {note.pinned && <span style={{ marginLeft: '8px', color: 'var(--r-accent)' }}>pinned</span>}
        </span>
      </div>
    </div>
  );
}
