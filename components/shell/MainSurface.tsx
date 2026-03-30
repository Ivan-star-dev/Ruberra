"use client";

import { type Tab } from "./TabSwitcher";

interface MainSurfaceProps {
  activeTab: Tab;
}

const MODE_LABELS: Record<Tab, { title: string; hint: string }> = {
  lab:      { title: "Lab",      hint: "Explore, experiment, and reason." },
  school:   { title: "School",   hint: "Learn, study, and deepen understanding." },
  creation: { title: "Creation", hint: "Build, write, and make things real." },
};

export default function MainSurface({ activeTab }: MainSurfaceProps) {
  const { title, hint } = MODE_LABELS[activeTab];

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-ruberra-bg">
      {/* Execution / output area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <h1 className="text-ruberra-text text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-ruberra-subtext text-sm text-center max-w-xs">
          {hint}
        </p>
      </div>

      {/* Input bar */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 bg-ruberra-surface border border-ruberra-border rounded-xl px-4 py-3">
          <input
            type="text"
            placeholder={`Ask ${title}…`}
            className="flex-1 bg-transparent text-ruberra-text text-sm placeholder:text-ruberra-muted outline-none"
          />
          <button
            className="text-ruberra-subtext hover:text-ruberra-accent transition-colors"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 8L2 2l3 6-3 6 12-6z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
