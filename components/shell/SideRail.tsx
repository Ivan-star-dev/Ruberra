"use client";

import { type Tab } from "./TabSwitcher";

interface SideRailProps {
  activeTab: Tab;
}

export default function SideRail({ activeTab }: SideRailProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-ruberra-border bg-ruberra-rail flex flex-col gap-6 px-4 py-5">
      {/* Artifacts */}
      <section>
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          Artifacts
        </p>
        <div className="space-y-1">
          <div className="h-7 rounded bg-ruberra-border/40 w-3/4 animate-pulse" />
          <div className="h-7 rounded bg-ruberra-border/40 w-full animate-pulse" />
          <div className="h-7 rounded bg-ruberra-border/40 w-2/3 animate-pulse" />
        </div>
      </section>

      {/* History */}
      <section>
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          History
        </p>
        <div className="space-y-1">
          <div className="h-7 rounded bg-ruberra-border/40 w-full animate-pulse" />
          <div className="h-7 rounded bg-ruberra-border/40 w-4/5 animate-pulse" />
        </div>
      </section>

      {/* Tools */}
      <section>
        <p className="text-ruberra-subtext text-xs uppercase tracking-widest mb-3 select-none">
          Tools
        </p>
        <div className="space-y-1">
          <div className="h-7 rounded bg-ruberra-border/40 w-2/3 animate-pulse" />
        </div>
      </section>

      {/* Active mode badge */}
      <div className="mt-auto">
        <span className="text-ruberra-subtext text-xs capitalize tracking-wide">
          Mode: <span className="text-ruberra-accent">{activeTab}</span>
        </span>
      </div>
    </aside>
  );
}
