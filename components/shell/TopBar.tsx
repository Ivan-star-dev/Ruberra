"use client";

import TabSwitcher, { type Tab } from "./TabSwitcher";

interface TopBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  return (
    <header
      className="relative flex items-center justify-between px-6 h-11 bg-ruberra-surface shrink-0"
      style={{ boxShadow: "0 1px 0 0 #e2e0dc" }}
    >
      {/* Wordmark */}
      <span className="text-ruberra-text/80 font-semibold text-[13px] tracking-tight select-none">
        Ruberra
      </span>

      {/* Tab switcher — true center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Live dot — right */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-ruberra-pulse/80 shrink-0" />
        <span className="text-ruberra-subtext text-[11px] tracking-wide select-none">Live</span>
      </div>
    </header>
  );
}
