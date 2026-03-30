"use client";

import { useState } from "react";
import { type Tab, type Message, type SignalStatus } from "./types";

const ALL_TABS: Tab[] = ["lab", "school", "creation"];

interface SideRailProps {
  activeTab:  Tab;
  messages:   Record<Tab, Message[]>;
  signals:    Record<Tab, SignalStatus>;
  onClearTab: (tab: Tab) => void;
}

export default function SideRail({ activeTab, messages, signals, onClearTab }: SideRailProps) {
  const currentMessages    = messages[activeTab];
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
                <ArtifactItem key={msg.id} content={msg.content} />
              ))}
          </ul>
        )}
      </section>

      {/* History — with per-tab clear */}
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
                  "group flex items-center justify-between h-6 px-2 rounded text-xs transition-colors",
                  isActive
                    ? "text-ruberra-text bg-ruberra-border"
                    : "text-ruberra-subtext hover:bg-ruberra-border/60",
                ].join(" ")}
              >
                <span className="capitalize">{tab}</span>
                <span className="flex items-center gap-1">
                  <span className={isActive ? "text-ruberra-accent font-medium" : "text-ruberra-muted"}>
                    {count > 0 ? String(count) : "—"}
                  </span>
                  {count > 0 && (
                    <button
                      onClick={() => onClearTab(tab)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-ruberra-muted hover:text-ruberra-text leading-none"
                      aria-label={`Clear ${tab} session`}
                      title={`Clear ${tab}`}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
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
        <ul className="space-y-0.5">
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

function ArtifactItem({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const preview = content.length > 40 ? content.slice(0, 40) + "…" : content;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => { /* clipboard unavailable */ });
  }

  return (
    <li className="group relative flex items-center h-6 px-2 rounded text-xs text-ruberra-subtext hover:bg-ruberra-border/60 hover:text-ruberra-text cursor-default transition-colors">
      <span className="truncate flex-1 pr-5" title={content}>
        {preview}
      </span>
      <button
        onClick={handleCopy}
        className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity text-ruberra-muted hover:text-ruberra-accent"
        aria-label="Copy artifact"
        title={copied ? "Copied!" : "Copy"}
      >
        {copied ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 4h1M1 4v7h7v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>
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
