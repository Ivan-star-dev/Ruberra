"use client";

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
