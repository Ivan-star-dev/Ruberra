"use client";

import { type Tab } from "./TabSwitcher";
import { type Message, type Signal, type SignalStatus } from "./types";

interface SideRailProps {
  activeTab: Tab;
  messages: Message[];
  signal: Signal;
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

function Section({ label, children }: SectionProps) {
  return (
    <section>
      <p className="text-ruberra-subtext/60 text-[10px] uppercase tracking-widest mb-2.5 select-none font-medium">
        {label}
      </p>
      {children}
    </section>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="h-7 rounded bg-ruberra-border/25 flex items-center px-3">
      <span className="text-ruberra-subtext/30 text-xs truncate">{label}</span>
    </div>
  );
}

const SIGNAL_DOT: Record<SignalStatus, string> = {
  idle:      "bg-ruberra-pulse/60",
  streaming: "bg-ruberra-accent animate-pulse",
  completed: "bg-ruberra-pulse",
  error:     "bg-red-500",
};

const SIGNAL_LABEL: Record<SignalStatus, string> = {
  idle:      "Idle",
  streaming: "Streaming",
  completed: "Completed",
  error:     "Error",
};

function SignalsSection({ signal }: { signal: Signal }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SIGNAL_DOT[signal.status]}`} />
        <span className="text-ruberra-subtext/70 text-xs">{SIGNAL_LABEL[signal.status]}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-ruberra-subtext/20" />
        <span className="text-ruberra-subtext/40 text-xs">
          {signal.tab ? `mode · ${signal.tab}` : "no active run"}
        </span>
      </div>
    </div>
  );
}

export default function SideRail({ activeTab, messages, signal }: SideRailProps) {
  const tabMessages = messages.filter((m) => m.tab === activeTab && m.role === "user");

  const historyItems = tabMessages
    .slice()
    .reverse()
    .slice(0, 6);

  const artifactMessages = messages.filter((m) => m.tab === activeTab && m.role === "assistant");
  const artifactItems = artifactMessages
    .slice()
    .reverse()
    .slice(0, 4);

  return (
    <aside className="w-56 shrink-0 border-r border-ruberra-border bg-ruberra-rail flex flex-col gap-5 px-4 py-5 overflow-y-auto">

      {/* Artifacts */}
      <Section label="Artifacts">
        {artifactItems.length === 0 ? (
          <>
            <EmptySlot label="No artifacts yet" />
            <EmptySlot label="—" />
          </>
        ) : (
          <div className="space-y-1">
            {artifactItems.map((m) => (
              <div
                key={m.id}
                className="h-7 rounded bg-ruberra-border/30 flex items-center px-3 group cursor-default"
                title={m.content}
              >
                <span className="text-ruberra-subtext/70 text-xs truncate group-hover:text-ruberra-text/80 transition-colors">
                  {m.content.slice(0, 32)}{m.content.length > 32 ? "…" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* History */}
      <Section label="History">
        {historyItems.length === 0 ? (
          <>
            <EmptySlot label="No history yet" />
            <EmptySlot label="—" />
          </>
        ) : (
          <div className="space-y-1">
            {historyItems.map((m) => (
              <div
                key={m.id}
                className="h-7 rounded bg-ruberra-border/30 flex items-center px-3 group cursor-default"
                title={m.content}
              >
                <span className="text-ruberra-subtext/70 text-xs truncate group-hover:text-ruberra-text/80 transition-colors">
                  {m.content.slice(0, 32)}{m.content.length > 32 ? "…" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Signals */}
      <Section label="Signals">
        <SignalsSection signal={signal} />
      </Section>

      {/* Mode indicator */}
      <div className="mt-auto pt-2 border-t border-ruberra-border/40">
        <span className="text-ruberra-subtext/50 text-[10px] capitalize tracking-widest select-none">
          MODE · <span className="text-ruberra-accent/80">{activeTab.toUpperCase()}</span>
        </span>
      </div>
    </aside>
  );
}
