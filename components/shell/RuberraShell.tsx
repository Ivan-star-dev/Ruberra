"use client";

import { useState, useCallback } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab, type Message } from "./types";

type TabMessages = Record<Tab, Message[]>;
type TabLoading = Record<Tab, boolean>;

const EMPTY_MESSAGES: TabMessages = { lab: [], school: [], creation: [] };
const EMPTY_LOADING: TabLoading  = { lab: false, school: false, creation: false };

export default function RuberraShell() {
  const [activeTab, setActiveTab]     = useState<Tab>("lab");
  const [messages,  setMessages]      = useState<TabMessages>(EMPTY_MESSAGES);
  const [loading,   setLoading]       = useState<TabLoading>(EMPTY_LOADING);

  const handleSend = useCallback((text: string) => {
    const tab = activeTab;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      timestamp: Date.now(),
    };

    setMessages((prev) => ({
      ...prev,
      [tab]: [...prev[tab], userMsg],
    }));

    setLoading((prev) => ({ ...prev, [tab]: true }));

    // Simulate a brief "thinking" delay then stream a response
    const assistantId = crypto.randomUUID();
    const responseText = SIMULATED_RESPONSES[tab][
      Math.floor(Math.random() * SIMULATED_RESPONSES[tab].length)
    ];

    // Insert empty assistant message placeholder
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [tab]: [
          ...prev[tab],
          { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
        ],
      }));

      // Stream characters one by one
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setMessages((prev) => ({
          ...prev,
          [tab]: prev[tab].map((m) =>
            m.id === assistantId
              ? { ...m, content: responseText.slice(0, i) }
              : m
          ),
        }));

        if (i >= responseText.length) {
          clearInterval(interval);
          setLoading((prev) => ({ ...prev, [tab]: false }));
        }
      }, 18);
    }, 420);
  }, [activeTab]);

  return (
    <div className="h-screen w-screen flex flex-col bg-ruberra-bg overflow-hidden">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 min-h-0">
        <SideRail
          activeTab={activeTab}
          messages={messages}
        />
        <MainSurface
          activeTab={activeTab}
          messages={messages[activeTab]}
          isLoading={loading[activeTab]}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

const SIMULATED_RESPONSES: Record<Tab, string[]> = {
  lab: [
    "Analyzing the problem space. The key variables here are constrained by the underlying model — let me reason through the edge cases systematically.",
    "That's an interesting hypothesis. If we hold the first assumption constant and vary the second, the output diverges in a non-linear way around the boundary condition.",
    "Let me think through this step by step. The first principle here is that complexity compounds — so the cleanest path is to isolate variables before drawing conclusions.",
    "The reasoning checks out up to the third inference. The fourth step introduces a hidden dependency that may invalidate the chain if the source data has noise above 12%.",
  ],
  school: [
    "Great question. The core concept here builds on three foundational ideas — let me unpack each one before connecting them to your specific case.",
    "This is a common point of confusion. The distinction is subtle but important: the first term describes a process, while the second describes a state. They're related but not interchangeable.",
    "Think of it this way: the underlying mechanism is like a feedback loop. Once you understand that the output feeds back into the input, the rest of the behavior becomes predictable.",
    "You're on the right track. The gap in your reasoning is around the boundary condition — what happens when the input approaches zero? That's where the model reveals its true structure.",
  ],
  creation: [
    "Here's a strong structural approach for this: start with the invariant core, define the interfaces, then let the implementation details follow from the constraints rather than leading them.",
    "The rough shape looks solid. Two things to tighten before shipping: the error boundary around the async path, and the fallback state when the data source returns empty.",
    "I'd push back slightly on the naming — the function does more than its name implies, which will create maintenance confusion at scale. Consider splitting it at the seam where the behavior changes.",
    "That pattern works. One refinement: instead of threading the callback three levels deep, lift the shared state one level and pass a stable reference down. It'll simplify testing significantly.",
  ],
};
