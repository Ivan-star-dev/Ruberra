"use client";

import TabSwitcher from "./TabSwitcher";
import { type Tab, type Theme } from "./types";

interface TopBarProps {
  activeTab:     Tab;
  onTabChange:   (tab: Tab) => void;
  theme:         Theme;
  onThemeToggle: () => void;
}

const CHAMBER_LABEL: Record<Tab, string> = {
  lab:      "LAB",
  school:   "SCHOOL",
  creation: "CREATION",
};

export default function TopBar({ activeTab, onTabChange, theme, onThemeToggle }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between shrink-0 border-b"
      style={{
        height:          "52px",
        backgroundColor: "var(--r-surface)",
        borderColor:     "var(--r-border)",
        padding:         "0 16px",
        position:        "relative",
      }}
    >
      {/* ── Left: logo block ── */}
      <div className="flex items-center gap-2.5">
        {/* Logo mark — square icon */}
        <span
          className="flex items-center justify-center"
          style={{
            width:           "28px",
            height:          "28px",
            backgroundColor: "var(--r-text)",
            borderRadius:    "6px",
            color:           "var(--r-surface)",
            fontSize:        "11px",
            fontWeight:      700,
            letterSpacing:   "-0.02em",
            flexShrink:      0,
          }}
        >
          R
        </span>
        <span
          className="font-semibold select-none"
          style={{
            fontSize:      "14px",
            color:         "var(--r-text)",
            letterSpacing: "-0.02em",
          }}
        >
          RUBERRA
        </span>
        {/* LIVE badge */}
        <span
          className="flex items-center gap-1.5"
          style={{ fontSize: "11px", color: "var(--r-subtext)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--r-ok)" }}
          />
          LIVE
        </span>
      </div>

      {/* ── Center: tabs (absolute) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center"
        style={{ top: 0, bottom: 0 }}
      >
        <TabSwitcher activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* ── Right: chamber badge + tools ── */}
      <div className="flex items-center gap-3">
        {/* Active chamber label */}
        <span
          className="flex items-center gap-1.5 font-mono select-none"
          style={{ fontSize: "11px", color: "var(--r-subtext)", letterSpacing: "0.05em" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--r-accent)" }}
          />
          {CHAMBER_LABEL[activeTab]}
        </span>

        {/* Thin divider */}
        <span className="w-px h-4" style={{ backgroundColor: "var(--r-border)" }} />

        {/* Search */}
        <IconButton label="Search" onClick={() => {}}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </IconButton>

        {/* Bell */}
        <IconButton label="Notifications" onClick={() => {}}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a4 4 0 00-4 4v3l-1.5 2h11L12 9V6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </IconButton>

        {/* Theme toggle */}
        <IconButton label={theme === "light" ? "Dark mode" : "Light mode"} onClick={onThemeToggle}>
          {theme === "light" ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M13 8.5A5.5 5.5 0 017.5 3a5.5 5.5 0 100 11A5.5 5.5 0 0013 8.5z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.8 3.8l.7.7M11.5 11.5l.7.7M11.5 4.5l-.7.7M4.5 11.5l-.7.7"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          )}
        </IconButton>

        {/* Avatar / profile block */}
        <span
          className="flex items-center justify-center rounded-lg select-none"
          style={{
            width:           "28px",
            height:          "28px",
            backgroundColor: "var(--r-border)",
            color:           "var(--r-subtext)",
            fontSize:        "11px",
            fontWeight:      600,
          }}
        >
          U
        </span>
      </div>
    </header>
  );
}

function IconButton({
  label, onClick, children,
}: {
  label:    string;
  onClick:  () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center justify-center transition-colors duration-150"
      style={{
        width:  "30px",
        height: "30px",
        color:  "var(--r-subtext)",
        borderRadius: "6px",
      }}
    >
      {children}
    </button>
  );
}
