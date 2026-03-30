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
    <nav
      className="flex items-center gap-px p-0.5 rounded-lg"
      style={{ background: "#ebe9e5" }}
      aria-label="Ruberra modes"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              "px-3.5 py-1 rounded-md text-[12px] font-medium tracking-wide transition-all duration-100 select-none",
              isActive
                ? "bg-ruberra-surface text-ruberra-text shadow-[0_1px_2px_rgba(26,25,22,0.08)]"
                : "text-ruberra-subtext hover:text-ruberra-text/80",
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
