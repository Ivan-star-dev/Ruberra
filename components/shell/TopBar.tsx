"use client";

import TabSwitcher, { type Tab } from "./TabSwitcher";

interface TopBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-ruberra-border bg-ruberra-surface shrink-0">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-ruberra-text font-semibold text-base tracking-tight select-none">
          Ruberra
        </span>
      </div>

      {/* Tab switcher — center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Status pulse — right */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ruberra-pulse opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-ruberra-pulse" />
        </span>
        <span className="text-ruberra-subtext text-xs tracking-wide">Live</span>
      </div>
    </header>
  );
}
