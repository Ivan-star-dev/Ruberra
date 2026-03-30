"use client";

import { useRef, useState, useEffect, type PointerEvent } from "react";
import { type FloatingNote, type Tab } from "./types";

interface FloatingNoteSystemProps {
  notes:    FloatingNote[];
  onChange: (id: string, updates: Partial<FloatingNote>) => void;
  onRemove: (id: string) => void;
}

export default function FloatingNoteSystem({ notes, onChange, onRemove }: FloatingNoteSystemProps) {
  return (
    <>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onChange={(updates) => onChange(note.id, updates)}
          onRemove={() => onRemove(note.id)}
        />
      ))}
    </>
  );
}

function NoteCard({
  note,
  onChange,
  onRemove,
}: {
  note: FloatingNote;
  onChange: (u: Partial<FloatingNote>) => void;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("textarea, button")) return;
    setDragging(true);
    const rect = cardRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    cardRef.current!.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const x = e.clientX - offset.current.x;
    const y = e.clientY - offset.current.y;
    onChange({ x: Math.max(0, x), y: Math.max(0, y) });
  }

  function onPointerUp() {
    setDragging(false);
  }

  const tabAccent: Record<Tab, string> = {
    lab:      "var(--r-accent)",
    school:   "var(--r-ok)",
    creation: "var(--rt-amber)",
  };

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-64 flex flex-col shadow-lg"
      style={{
        left: note.x,
        top:  note.y,
        backgroundColor: "var(--r-elevated)",
        border: `1px solid var(--r-border)`,
        borderTop: `2px solid ${tabAccent[note.tab]}`,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: "var(--r-border-soft)" }}>
        <span className="text-[9px] uppercase tracking-widest"
          style={{ color: tabAccent[note.tab] }}>
          note · {note.tab}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Pin toggle */}
          <button
            onClick={() => onChange({ pinned: !note.pinned })}
            className="text-[10px] leading-none transition-colors duration-150"
            style={{ color: note.pinned ? "var(--r-accent)" : "var(--r-dim)" }}
            title={note.pinned ? "Unpin" : "Pin note"}>
            ⊕
          </button>
          {/* Dismiss */}
          <button
            onClick={onRemove}
            className="text-[10px] leading-none transition-colors duration-150"
            style={{ color: "var(--r-dim)" }}
            title="Dismiss">
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <textarea
        value={note.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Note…"
        rows={4}
        className="w-full bg-transparent outline-none resize-none text-[11px] leading-relaxed px-3 py-2"
        style={{
          color: "var(--r-text)",
          cursor: "text",
          userSelect: "text",
        }}
      />

      {/* Footer timestamp */}
      <div className="px-3 pb-1.5 pt-0">
        <span className="text-[9px]" style={{ color: "var(--r-dim)" }}>
          {new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {note.pinned && <span className="ml-2" style={{ color: "var(--r-accent)" }}>pinned</span>}
        </span>
      </div>
    </div>
  );
}
