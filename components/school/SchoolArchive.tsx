"use client";

import { type Message } from "../shell/types";

interface SchoolArchiveProps {
  messages: Message[];
}

export default function SchoolArchive({ messages }: SchoolArchiveProps) {
  const pairs: { user: Message; assistant: Message | null }[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({ user: messages[i], assistant: messages[i + 1] ?? null });
    }
  }

  if (pairs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: "var(--r-dim)" }}>
          <path d="M4 6h20v4H4zM4 10v14h20V10M10 17h8" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
        <p className="text-xs" style={{ color: "var(--r-subtext)" }}>No study sessions yet</p>
        <p className="text-[10px]" style={{ color: "var(--r-dim)" }}>School exchanges appear here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 animate-panel-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium" style={{ color: "var(--r-text)" }}>Study Archive</h2>
        <span className="text-[10px] font-mono" style={{ color: "var(--r-subtext)" }}>
          {pairs.length} session{pairs.length !== 1 ? "s" : ""}
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
                  style={{ color: "var(--r-accent)" }}>Study Query</span>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--r-text)" }}>{user.content}</p>
              </div>
              {assistant?.content && (
                <div>
                  <span className="text-[9px] uppercase tracking-widest block mb-0.5"
                    style={{ color: "var(--r-subtext)" }}>Guide Response</span>
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
