"use client";

import { type Tab } from "./TabSwitcher";
import { type Message, type Signal, type SignalStatus } from "./types";

interface SideRailProps {
  activeTab: Tab;
  messages: Message[];
  signal: Signal;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-ruberra-muted text-[10px] uppercase tracking-[0.1em] mb-2 select-none font-medium">
      {children}
    </p>
  );
}

// Strip block fences and markdown symbols to get a clean summary
function extractSummary(content: string): string {
  return content
    .replace(/```block:\w+\n[\s\S]*?```/g, "")
    .replace(/```[\w]*\n[\s\S]*?```/g, "[code]")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

function formatAge(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function RailItem({
  primary,
  secondary,
  faint = false,
  age,
}: {
  primary: string;
  secondary?: string;
  faint?: boolean;
  age?: string;
}) {
  return (
    <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md group cursor-default hover:bg-ruberra-border/50 transition-colors">
      <div className="flex-1 min-w-0">
        <span
          className={[
            "text-[11.5px] leading-snug block truncate transition-colors",
            faint
              ? "text-ruberra-muted"
              : "text-ruberra-subtext group-hover:text-ruberra-text/75",
          ].join(" ")}
        >
          {primary}
        </span>
        {secondary && (
          <span className="text-[10px] text-ruberra-muted/70 block truncate mt-0.5 leading-none">
            {secondary}
          </span>
        )}
      </div>
      {age && (
        <span className="text-[9.5px] font-mono text-ruberra-muted/50 shrink-0 mt-0.5 tabular-nums">
          {age}
        </span>
      )}
    </div>
  );
}

const SIGNAL_DOT: Record<SignalStatus, string> = {
  idle:      "bg-ruberra-pulse/50",
  streaming: "bg-ruberra-accent animate-pulse",
  completed: "bg-ruberra-pulse",
  error:     "bg-red-400",
};

const SIGNAL_LABEL: Record<SignalStatus, string> = {
  idle:      "Ready",
  streaming: "Streaming",
  completed: "Done",
  error:     "Error",
};

const CHAMBER_DESC: Record<Tab, string> = {
  lab:      "Analysis · Research",
  school:   "Learning · Mastery",
  creation: "Build · Output",
};

export default function SideRail({ activeTab, messages, signal }: SideRailProps) {
  const userMsgs = messages
    .filter((m) => m.tab === activeTab && m.role === "user")
    .slice()
    .reverse()
    .slice(0, 6);

  const artifactMsgs = messages
    .filter((m) => m.tab === activeTab && m.role === "assistant" && !m.streaming && m.content.length > 10)
    .slice()
    .reverse()
    .slice(0, 4);

  const totalMessages = messages.filter((m) => m.tab === activeTab).length;

  return (
    <aside
      className="w-48 shrink-0 bg-ruberra-rail flex flex-col px-3 py-4 overflow-y-auto gap-5"
      style={{ boxShadow: "1px 0 0 0 #e2e0dc" }}
    >
      {/* Artifacts */}
      <section>
        <SectionLabel>Artifacts</SectionLabel>
        <div>
          {artifactMsgs.length === 0 ? (
            <RailItem primary="No artifacts yet" faint />
          ) : (
            artifactMsgs.map((m) => {
              const summary = extractSummary(m.content);
              const preview = summary.slice(0, 38) + (summary.length > 38 ? "…" : "");
              return (
                <RailItem
                  key={m.id}
                  primary={preview || "Response"}
                  age={formatAge(m.timestamp)}
                />
              );
            })
          )}
        </div>
      </section>

      {/* History */}
      <section>
        <SectionLabel>History</SectionLabel>
        <div>
          {userMsgs.length === 0 ? (
            <RailItem primary="No history yet" faint />
          ) : (
            userMsgs.map((m) => {
              const preview = m.content.slice(0, 38) + (m.content.length > 38 ? "…" : "");
              return (
                <RailItem
                  key={m.id}
                  primary={preview}
                  age={formatAge(m.timestamp)}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Signals */}
      <section>
        <SectionLabel>Signals</SectionLabel>
        <div className="space-y-1.5 px-1">
          {/* Primary signal */}
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SIGNAL_DOT[signal.status]}`} />
            <span className="text-[11.5px] text-ruberra-subtext">{SIGNAL_LABEL[signal.status]}</span>
          </div>
          {/* Message count */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-ruberra-muted/30" />
            <span className="text-[11px] text-ruberra-muted tabular-nums font-mono">
              {totalMessages > 0 ? `${totalMessages} msg` : "empty"}
            </span>
          </div>
        </div>
      </section>

      {/* Chamber context — bottom */}
      <div className="mt-auto pt-3" style={{ borderTop: "1px solid #e2e0dc" }}>
        <p className="text-[10px] text-ruberra-text/60 font-medium uppercase tracking-[0.1em] select-none mb-0.5">
          {activeTab}
        </p>
        <p className="text-[10px] text-ruberra-muted/70 select-none">
          {CHAMBER_DESC[activeTab]}
        </p>
      </div>
    </aside>
  );
}
