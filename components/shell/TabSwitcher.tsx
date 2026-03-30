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
    <nav className="flex items-center" aria-label="Ruberra chambers">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-4 py-3 text-xs font-medium tracking-wide transition-colors duration-150 select-none"
            style={{
              color: isActive ? "var(--r-text)" : "var(--r-subtext)",
            }}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {/* Underline indicator — premium, not pill */}
            {isActive && (
              <span
                className="absolute bottom-0 left-4 right-4 h-px"
                style={{ backgroundColor: "var(--r-accent)" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
