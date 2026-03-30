"use client";

import { type Tab, type Message, type SignalStatus } from "./types";

const ALL_TABS: Tab[] = ["lab", "school", "creation"];

interface SideRailProps {
  activeTab: Tab;
  messages:  Record<Tab, Message[]>;
  signals:   Record<Tab, SignalStatus>;
}

export default function SideRail({ activeTab, messages, signals }: SideRailProps) {
  const currentMessages   = messages[activeTab];
  const completedResponses = currentMessages.filter(
    (m) => m.role === "assistant" && m.content.length > 0
  );
  const totalExchanges = completedResponses.length;
  const totalSent      = currentMessages.filter((m) => m.role === "user").length;

  return (
    <aside className="w-48 shrink-0 border-r border-ruberra-border bg-ruberra-rail flex flex-col overflow-hidden">

      {/* Artifacts — completed assistant responses */}
      <section className="px-3 pt-5 pb-4 border-b border-ruberra-border">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ruberra-subtext mb-2 select-none px-1">
          Artifacts
        </p>
        {completedResponses.length === 0 ? (
          <p className="text-ruberra-muted text-xs px-1">None yet.</p>
        ) : (
          <ul>
            {completedResponses
              .slice(-5)
              .reverse()
              .map((msg) => (
                <RailItem
                  key={msg.id}
                  label={msg.content.length > 40 ? msg.content.slice(0, 40) + "…" : msg.content}
                  title={msg.content}
                />
              ))}
          </ul>
        )}
      </section>

      {/* History */}
      <section className="px-3 pt-4 pb-4 border-b border-ruberra-border">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ruberra-subtext mb-2 select-none px-1">
          History
        </p>
        <ul>
          {ALL_TABS.map((tab) => {
            const count    = messages[tab].filter((m) => m.role === "assistant" && m.content.length > 0).length;
            const isActive = tab === activeTab;
            return (
              <li
                key={tab}
                className={[
                  "flex items-center justify-between h-6 px-2 rounded text-xs transition-colors",
                  isActive
                    ? "text-ruberra-text bg-ruberra-border"
                    : "text-ruberra-subtext hover:bg-ruberra-border/60",
                ].join(" ")}
              >
                <span className="capitalize">{tab}</span>
                <span className={isActive ? "text-ruberra-accent font-medium" : "text-ruberra-muted"}>
                  {count > 0 ? String(count) : "—"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Signals */}
      <section className="px-3 pt-4 pb-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ruberra-subtext mb-2 select-none px-1">
          Signals
        </p>
        <ul className="space-y-1">
          <SignalCountRow label="Sent"      value={totalSent > 0 ? String(totalSent) : "—"} />
          <SignalCountRow label="Exchanges" value={totalExchanges > 0 ? String(totalExchanges) : "—"} />
          {ALL_TABS.map((tab) => (
            <SignalStatusRow
              key={tab}
              tab={tab}
              status={signals[tab]}
              isActive={tab === activeTab}
            />
          ))}
        </ul>
      </section>

      {/* Mode badge */}
      <div className="mt-auto px-4 pb-4">
        <span className="text-ruberra-muted text-[10px] capitalize tracking-wide">
          Mode <span className="text-ruberra-accent ml-1">{activeTab}</span>
        </span>
      </div>

    </aside>
  );
}

function RailItem({ label, title }: { label: string; title?: string }) {
  return (
    <li
      className="h-6 flex items-center px-2 rounded text-xs text-ruberra-subtext hover:bg-ruberra-border/60 hover:text-ruberra-text cursor-default transition-colors truncate"
      title={title}
    >
      {label}
    </li>
  );
}

function SignalCountRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between h-6 px-2 text-xs">
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
  tab:      Tab;
  status:   SignalStatus;
  isActive: boolean;
}) {
  const dotColor =
    status === "streaming" ? "bg-ruberra-accent"
    : status === "completed" ? "bg-ruberra-pulse"
    : status === "error"    ? "bg-red-400"
    : "bg-ruberra-muted";

  const labelText =
    status === "streaming" ? "Streaming"
    : status === "completed" ? "Done"
    : status === "error"    ? "Error"
    : "Idle";

  const labelColor =
    status === "streaming" ? "text-ruberra-accent"
    : status === "completed" ? "text-ruberra-pulse"
    : status === "error"    ? "text-red-400"
    : "text-ruberra-muted";

  return (
    <li
      className={[
        "flex items-center justify-between h-6 px-2 text-xs rounded",
        isActive ? "" : "opacity-40",
      ].join(" ")}
    >
      <span className="text-ruberra-muted capitalize">{tab}</span>
      <span className="flex items-center gap-1.5">
        <span className={["w-1.5 h-1.5 rounded-full", dotColor].join(" ")} />
        <span className={labelColor}>{labelText}</span>
      </span>
    </li>
  );
}
