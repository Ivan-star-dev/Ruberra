"use client";

import { type Message } from "../shell/types";

interface LabArchiveProps {
  messages: Message[];
}

export default function LabArchive({ messages }: LabArchiveProps) {
  const pairs: { user: Message; assistant: Message | null }[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({ user: messages[i], assistant: messages[i + 1] ?? null });
    }
  }

  if (pairs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
        <ArchiveGlyph />
        <p className="text-xs" style={{ color: "var(--r-subtext)" }}>No session history yet</p>
        <p className="text-[10px]" style={{ color: "var(--r-dim)" }}>Lab exchanges will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 animate-panel-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium" style={{ color: "var(--r-text)" }}>Session Archive</h2>
        <span className="text-[10px] font-mono" style={{ color: "var(--r-subtext)" }}>
          {pairs.length} exchange{pairs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {pairs.slice().reverse().map(({ user, assistant }, i) => (
          <div key={user.id} className="border rounded overflow-hidden"
            style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>
            <div className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: "var(--r-border-soft)", backgroundColor: "var(--r-elevated)" }}>
              <span className="text-[9px] font-mono" style={{ color: "var(--r-dim)" }}>
                #{pairs.length - i}
              </span>
              <span className="text-[10px]" style={{ color: "var(--r-subtext)" }}>
                {new Date(user.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="px-4 py-2.5 space-y-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest block mb-0.5"
                  style={{ color: "var(--r-accent)" }}>Query</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--r-text)" }}>
                  {user.content}
                </p>
              </div>
              {assistant && assistant.content && (
                <div>
                  <span className="text-[9px] uppercase tracking-widest block mb-0.5"
                    style={{ color: "var(--r-subtext)" }}>Response</span>
                  <p className="text-[11px] leading-relaxed line-clamp-4" style={{ color: "var(--r-subtext)" }}>
                    {assistant.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
      <rect x="3" y="4" width="22" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 10v14h20V10" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M10 17h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
