"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab } from "./TabSwitcher";

export default function RuberraShell() {
  const [activeTab, setActiveTab] = useState<Tab>("lab");

  return (
    <div className="h-screen w-screen flex flex-col bg-ruberra-bg overflow-hidden">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 min-h-0">
        <SideRail activeTab={activeTab} />
        <MainSurface activeTab={activeTab} />
      </div>
    </div>
  );
}
