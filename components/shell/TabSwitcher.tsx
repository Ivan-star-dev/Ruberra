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
    <nav
      className="flex items-center gap-0.5 bg-ruberra-warm rounded-lg p-0.5"
      aria-label="Ruberra modes"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              "px-3.5 py-1 rounded-md text-xs font-medium tracking-wide transition-all duration-150",
              isActive
                ? "bg-white text-ruberra-text shadow-sm"
                : "text-ruberra-subtext hover:text-ruberra-text",
            ].join(" ")}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
