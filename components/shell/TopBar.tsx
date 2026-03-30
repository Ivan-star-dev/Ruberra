"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab, type Theme } from "./types";

interface TopBarProps {
  activeTab:     Tab;
  onTabChange:   (tab: Tab) => void;
  theme:         Theme;
  onThemeToggle: () => void;
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
      {/* Wordmark */}
      <div className="flex items-center" style={{ paddingLeft: "20px", paddingRight: "24px", gap: "10px" }}>
        <span
          className="font-semibold select-none"
          style={{
            fontSize:      "13px",
            color:         "var(--r-text)",
            letterSpacing: "-0.025em",
          }}
        >
          RUBERRA
        </span>

        {/* LIVE badge */}
        <span
          className="font-mono flex items-center gap-1.5"
          style={{ fontSize: "9px", color: "var(--r-ok)", letterSpacing: "0.08em" }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: "var(--r-ok)" }}
          />
          LIVE
        </span>
      </div>

      {/* Chamber tabs — centered */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-stretch"
        style={{ top: 0, height: "44px" }}
      >
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2.5" style={{ paddingRight: "16px" }}>
        <button
          onClick={onThemeToggle}
          className="flex items-center justify-center transition-colors duration-150"
          style={{ color: "var(--r-subtext)", width: "28px", height: "28px" }}
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
      <path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.4 3.4l.7.7M9.9 9.9l.7.7M9.9 4.1l-.7.7M4.1 9.9l-.7.7"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 8A5 5 0 016 2.5a5 5 0 100 9A5 5 0 0011.5 8z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
