"use client";

import { type Tab } from "./types";

interface TabSwitcherProps {
  activeTab:   Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "lab",      label: "Lab"      },
  { id: "school",   label: "School"   },
  { id: "creation", label: "Creation" },
];

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <nav className="flex items-center gap-1" aria-label="Ruberra chambers">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-1.5 transition-all duration-150 select-none"
            style={{
              fontSize:        "13px",
              fontWeight:      isActive ? 500 : 400,
              padding:         "5px 14px",
              borderRadius:    "999px",
              backgroundColor: isActive ? "var(--r-pill-bg)" : "transparent",
              color:           isActive ? "var(--r-pill-text)" : "var(--r-subtext)",
            }}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Dot prefix — only on active */}
            {isActive && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--r-pill-text)", opacity: 0.6 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
