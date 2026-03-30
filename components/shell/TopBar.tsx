"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab } from "./types";

interface TopBarProps {
  activeTab:   Tab;
  onTabChange: (tab: Tab) => void;
  isLive:      boolean;
}

export default function TopBar({ activeTab, onTabChange, isLive }: TopBarProps) {
  return (
    <header className="relative flex items-center justify-between px-5 h-11 border-b border-ruberra-border bg-ruberra-surface shrink-0">
      {/* Wordmark */}
      <span className="text-ruberra-text text-sm font-medium tracking-tight select-none opacity-80">
        Ruberra
      </span>

      {/* Tab switcher — center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Live indicator — truthful: visible only when streaming */}
      <div className="flex items-center gap-1.5 w-[52px] justify-end">
        {isLive && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-ruberra-pulse animate-pulse shrink-0" />
            <span className="text-ruberra-subtext text-[10px] tracking-[0.1em] uppercase select-none">Live</span>
          </>
        )}
      </div>
    </header>
  );
}
