"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab, type Theme } from "./types";

interface TopBarProps {
  activeTab:    Tab;
  onTabChange:  (tab: Tab) => void;
  theme:        Theme;
  onThemeToggle: () => void;
}

export default function TopBar({
  activeTab,
  onTabChange,
  theme,
  onThemeToggle,
}: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between px-5 h-11 border-b shrink-0"
      style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3 min-w-[120px]">
        <span
          className="text-sm font-semibold select-none"
          style={{ color: "var(--r-text)", letterSpacing: "-0.01em" }}
        >
          RUBERRA
        </span>
      </div>

      {/* Tab switcher — center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 min-w-[120px] justify-end">
        {/* Status pulse */}
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ backgroundColor: "var(--r-pulse)" }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ backgroundColor: "var(--r-pulse)" }}
          />
        </span>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors duration-150"
          style={{ color: "var(--r-subtext)" }}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M10.01 3.99l-1.06 1.06M3.99 10.01l-1.06 1.06"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12 7.5A5.5 5.5 0 016.5 2 5.5 5.5 0 1012 7.5z"
                stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
