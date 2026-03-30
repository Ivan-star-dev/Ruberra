"use client";

import { useState, useCallback, useRef } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab } from "./TabSwitcher";
import { type Message } from "./types";

const SIMULATED_RESPONSES: Record<Tab, string[]> = {
  lab: [
    "Reasoning kernel initialized. Processing your query against the active context layer.",
    "Analysis complete. The signal pattern you described aligns with the second-order effect model. Here is the derived output.",
    "Hypothesis logged. Running cross-reference against prior session artifacts.",
    "Experimental branch opened. Confidence: high.",
  ],
  school: [
    "Curriculum context loaded. Let me break this down into first-principles components.",
    "Concept retrieved. The core mechanism here is best understood through the following structured decomposition.",
    "Study path generated. Three interconnected knowledge nodes are relevant to your question.",
    "Understanding confirmed. The distinction you are drawing is precise and correct.",
  ],
  creation: [
    "Builder kernel active. Generating structured output from your directive.",
    "Draft produced. Review the output and specify refinements as needed.",
    "Creation artifact initialized. The composition follows your intent with one interpretive expansion.",
    "Output complete. Artifact registered to the current session.",
  ],
};

function pickResponse(tab: Tab, count: number): string {
  const pool = SIMULATED_RESPONSES[tab];
  return pool[count % pool.length];
}

export default function RuberraShell() {
  const [activeTab, setActiveTab] = useState<Tab>("lab");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const turnCount = useRef<Record<Tab, number>>({ lab: 0, school: 0, creation: 0 });

  const handleSubmit = useCallback(
    (text: string) => {
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        tab: activeTab,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      const count = turnCount.current[activeTab];
      const fullResponse = pickResponse(activeTab, count);
      turnCount.current[activeTab] = count + 1;

      const assistantId = `a-${Date.now()}`;
      const streamingMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        tab: activeTab,
        timestamp: Date.now(),
        streaming: true,
      };

      setMessages((prev) => [...prev, streamingMsg]);

      // Character-by-character stream simulation
      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        const chunk = fullResponse.slice(0, i);
        const done = i >= fullResponse.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: chunk, streaming: !done }
              : m
          )
        );

        if (done) {
          clearInterval(interval);
          setStreaming(false);
        }
      }, 18);
    },
    [activeTab]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-ruberra-bg overflow-hidden">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 min-h-0">
        <SideRail activeTab={activeTab} messages={messages} />
        <MainSurface
          activeTab={activeTab}
          messages={messages}
          onSubmit={handleSubmit}
          streaming={streaming}
        />
      </div>
    </div>
  );
}
