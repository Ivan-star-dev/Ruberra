"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab } from "./types";

interface TopBarProps {
  activeTab:   Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  return (
    <header className="relative flex items-center justify-between px-5 h-11 border-b border-ruberra-border bg-ruberra-surface shadow-sm shrink-0">
      {/* Wordmark */}
      <span className="text-ruberra-text text-sm font-medium tracking-tight select-none opacity-80">
        Ruberra
      </span>

      {/* Tab switcher — center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Static live dot — right */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-ruberra-pulse" />
        <span className="text-ruberra-subtext text-xs tracking-wide">Live</span>
      </div>
    </header>
  );
}
