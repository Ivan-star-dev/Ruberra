"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab, type Theme } from "./types";

interface TopBarProps {
  activeTab:      Tab;
  onTabChange:    (tab: Tab) => void;
  theme:          Theme;
  onThemeToggle:  () => void;
}

export default function TopBar({ activeTab, onTabChange, theme, onThemeToggle }: TopBarProps) {
  return (
    <header
      className="flex items-stretch justify-between shrink-0 border-b"
      style={{
        height:          "44px",
        borderColor:     "var(--r-border)",
        backgroundColor: "var(--r-surface)",
      }}
    >
      {/* Wordmark — left, vertically centered */}
      <div className="flex items-center pl-5 pr-6">
        <span
          className="text-sm font-semibold select-none tracking-tight"
          style={{ color: "var(--r-text)", letterSpacing: "-0.025em" }}
        >
          Ruberra
        </span>
      </div>

      {/* Chamber tabs — absolute center, flush to header bottom for underline */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-stretch"
        style={{ top: 0, height: "44px" }}
      >
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2.5 pr-4">
        {/* Live indicator — static dot, no ping (calmer) */}
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: "var(--r-ok)", opacity: 0.7 }}
          title="Live"
        />

        {/* Thin divider */}
        <span
          className="w-px h-3.5"
          style={{ backgroundColor: "var(--r-border)" }}
        />

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="w-7 h-7 flex items-center justify-center transition-colors duration-150"
          style={{ color: "var(--r-subtext)" }}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.4 3.4l.7.7M9.9 9.9l.7.7M9.9 4.1l-.7.7M4.1 9.9l-.7.7"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.5 8A5 5 0 016 2.5a5 5 0 100 9A5 5 0 0011.5 8z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
    </svg>
  );
}
