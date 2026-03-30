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
import { type Tab, type Message, type SignalStatus } from "./types";

const ALL_TABS: Tab[] = ["lab", "school", "creation"];

interface SideRailProps {
  activeTab: Tab;
  messages:  Record<Tab, Message[]>;
  signals:   Record<Tab, SignalStatus>;
}

export default function SideRail({ activeTab, messages, signals }: SideRailProps) {
  const currentMessages = messages[activeTab];
  const userMessages    = currentMessages.filter((m) => m.role === "user");
  const totalExchanges  = currentMessages.filter(
    (m) => m.role === "assistant" && m.content.length > 0
  ).length;
  const totalSent = userMessages.length;

  return (
    <aside className="w-56 shrink-0 border-r border-ruberra-border bg-ruberra-rail flex flex-col overflow-hidden">

      {/* Artifacts */}
      <section className="px-4 pt-5 pb-4 border-b border-ruberra-border/60">
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          Artifacts
        </p>
        {userMessages.length === 0 ? (
          <p className="text-ruberra-muted text-xs">No artifacts yet.</p>
        ) : (
          <ul className="space-y-1">
            {userMessages
              .slice(-5)
              .reverse()
              .map((msg) => (
                <li
                  key={msg.id}
                  className="text-ruberra-subtext text-xs truncate py-1 px-2 rounded hover:bg-ruberra-border/40 cursor-default transition-colors"
                  title={msg.content}
                >
                  {msg.content.length > 36
                    ? msg.content.slice(0, 36) + "…"
                    : msg.content}
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* History */}
      <section className="px-4 pt-4 pb-4 border-b border-ruberra-border/60">
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          History
        </p>
        <ul className="space-y-1.5">
          {ALL_TABS.map((tab) => {
            const count = messages[tab].filter(
              (m) => m.role === "assistant" && m.content.length > 0
            ).length;
            const isActive = tab === activeTab;
            return (
              <li
                key={tab}
                className={[
                  "flex items-center justify-between text-xs px-2 py-1 rounded",
                  isActive
                    ? "text-ruberra-text bg-ruberra-border/40"
                    : "text-ruberra-muted",
                ].join(" ")}
              >
                <span className="capitalize">{tab}</span>
                <span className={isActive ? "text-ruberra-accent" : "text-ruberra-muted"}>
                  {count > 0 ? String(count) : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Signals */}
      <section className="px-4 pt-4 pb-4">
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          Signals
        </p>
        <ul className="space-y-2.5">
          <SignalRow label="Sent"      value={totalSent > 0 ? String(totalSent) : "—"} />
          <SignalRow label="Exchanges" value={totalExchanges > 0 ? String(totalExchanges) : "—"} />
          {ALL_TABS.map((tab) => (
            <SignalStatusRow key={tab} tab={tab} status={signals[tab]} isActive={tab === activeTab} />
          ))}
        </ul>
      </section>

      {/* Mode badge */}
      <div className="mt-auto px-4 pb-4">
        <span className="text-ruberra-muted text-xs capitalize tracking-wide">
          Mode <span className="text-ruberra-accent ml-1">{activeTab}</span>
        </span>
      </div>

    </aside>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-xs">
      <span className="text-ruberra-muted">{label}</span>
      <span className="text-ruberra-subtext">{value}</span>
    </li>
  );
}

function SignalStatusRow({
  tab,
  status,
  isActive,
}: {
  tab: Tab;
  status: SignalStatus;
  isActive: boolean;
}) {
  const dotClass =
    status === "streaming"
      ? "bg-ruberra-accent animate-ping"
      : status === "completed"
      ? "bg-ruberra-pulse"
      : status === "error"
      ? "bg-red-500"
      : "bg-ruberra-muted";

  const label =
    status === "streaming"
      ? "Streaming"
      : status === "completed"
      ? "Done"
      : status === "error"
      ? "Error"
      : "Idle";

  const labelClass =
    status === "streaming"
      ? "text-ruberra-accent"
      : status === "completed"
      ? "text-ruberra-pulse"
      : status === "error"
      ? "text-red-400"
      : "text-ruberra-muted";

  return (
    <li className={["flex items-center justify-between text-xs", isActive ? "" : "opacity-50"].join(" ")}>
      <span className="text-ruberra-muted capitalize">{tab}</span>
      <span className="flex items-center gap-1.5">
        <span className={["w-1.5 h-1.5 rounded-full inline-block", dotClass].join(" ")} />
        <span className={labelClass}>{label}</span>
      </span>
    </li>
  );
}
