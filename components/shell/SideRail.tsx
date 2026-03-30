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

function RailItem({ text, faint = false }: { text: string; faint?: boolean }) {
  return (
    <div className="flex items-center gap-2 h-6 px-2 rounded-md group cursor-default hover:bg-ruberra-border/60 transition-colors">
      <span
        className={[
          "text-[11px] truncate leading-none transition-colors",
          faint
            ? "text-ruberra-muted"
            : "text-ruberra-subtext group-hover:text-ruberra-text/70",
        ].join(" ")}
      >
        {text}
      </span>
    </div>
  );
}

const SIGNAL_DOT: Record<SignalStatus, string> = {
  idle:      "bg-ruberra-pulse/50",
  streaming: "bg-ruberra-accent animate-pulse",
  completed: "bg-ruberra-pulse",
  error:     "bg-red-400",
};

const SIGNAL_TEXT: Record<SignalStatus, string> = {
  idle:      "Idle",
  streaming: "Streaming",
  completed: "Completed",
  error:     "Error",
};

export default function SideRail({ activeTab, messages, signal }: SideRailProps) {
  const userMsgs = messages
    .filter((m) => m.tab === activeTab && m.role === "user")
    .slice()
    .reverse()
    .slice(0, 6);

  const artifactMsgs = messages
    .filter((m) => m.tab === activeTab && m.role === "assistant" && !m.streaming && m.content.length > 0)
    .slice()
    .reverse()
    .slice(0, 4);

  return (
    <aside
      className="w-48 shrink-0 bg-ruberra-rail flex flex-col px-3 py-4 overflow-y-auto gap-5"
      style={{ boxShadow: "1px 0 0 0 #e2e0dc" }}
    >
      {/* Artifacts */}
      <section>
        <SectionLabel>Artifacts</SectionLabel>
        <div className="space-y-0.5">
          {artifactMsgs.length === 0 ? (
            <>
              <RailItem text="No artifacts yet" faint />
              <RailItem text="—" faint />
            </>
          ) : (
            artifactMsgs.map((m) => (
              <RailItem
                key={m.id}
                text={m.content.slice(0, 36) + (m.content.length > 36 ? "…" : "")}
              />
            ))
          )}
        </div>
      </section>

      {/* History */}
      <section>
        <SectionLabel>History</SectionLabel>
        <div className="space-y-0.5">
          {userMsgs.length === 0 ? (
            <>
              <RailItem text="No history yet" faint />
              <RailItem text="—" faint />
            </>
          ) : (
            userMsgs.map((m) => (
              <RailItem
                key={m.id}
                text={m.content.slice(0, 36) + (m.content.length > 36 ? "…" : "")}
              />
            ))
          )}
        </div>
      </section>

      {/* Signals */}
      <section>
        <SectionLabel>Signals</SectionLabel>
        <div className="space-y-1.5 px-2">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SIGNAL_DOT[signal.status]}`} />
            <span className="text-[11px] text-ruberra-subtext">{SIGNAL_TEXT[signal.status]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-ruberra-muted/40" />
            <span className="text-[11px] text-ruberra-muted">
              {signal.tab ? signal.tab : "no active run"}
            </span>
          </div>
        </div>
      </section>

      {/* Mode badge — bottom */}
      <div className="mt-auto pt-2" style={{ borderTop: "1px solid #e2e0dc" }}>
        <span className="text-[10px] text-ruberra-muted tracking-[0.1em] uppercase select-none">
          {activeTab}
        </span>
      </div>
    </aside>
  );
}
