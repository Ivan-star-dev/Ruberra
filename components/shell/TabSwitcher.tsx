"use client";

export type Tab = "lab" | "school" | "creation";

interface TabSwitcherProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "lab",      label: "Lab"      },
  { id: "school",   label: "School"   },
  { id: "creation", label: "Creation" },
];

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <nav className="flex items-center gap-1" aria-label="Ruberra modes">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-medium tracking-wide transition-all duration-150",
              isActive
                ? "bg-ruberra-border text-ruberra-text"
                : "text-ruberra-subtext hover:text-ruberra-text hover:bg-ruberra-border/50",
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
