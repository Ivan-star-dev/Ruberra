"use client";

import TabSwitcher, { type Tab } from "./TabSwitcher";

interface TopBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  return (
    <header
      className="relative flex items-center justify-between px-5 h-11 bg-ruberra-surface shrink-0 z-10"
      style={{ boxShadow: "0 1px 0 0 #e2e0dc" }}
    >
      {/* Left — wordmark + live */}
      <div className="flex items-center gap-2.5 w-40">
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold select-none shrink-0"
          style={{ background: "#1c1b19", color: "#e2e0dc" }}
        >
          R
        </span>
        <span className="text-ruberra-text/80 font-semibold text-[13px] tracking-tight select-none">
          RUBERRA
        </span>
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-ruberra-pulse shrink-0" />
          <span className="text-ruberra-subtext text-[10px] tracking-wide select-none uppercase font-medium">
            Live
          </span>
        </div>
      </div>

      {/* Center — tab switcher */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Right — session meta */}
      <div className="flex items-center gap-3 w-40 justify-end">
        <span className="text-[10px] font-mono text-ruberra-muted/50 select-none tabular-nums">
          {new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}
        </span>
      </div>
    </header>
  );
}
