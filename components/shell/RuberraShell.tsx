"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab, type Message, type SignalStatus } from "./types";

type TabMessages  = Record<Tab, Message[]>;
type TabLoading   = Record<Tab, boolean>;
type TabSignals   = Record<Tab, SignalStatus>;

const TABS: Tab[] = ["lab", "school", "creation"];

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map((t) => [t, value])) as Record<Tab, T>;
}

export default function RuberraShell() {
  const [activeTab, setActiveTab] = useState<Tab>("lab");
  const [messages,  setMessages]  = useState<TabMessages>(emptyRecord<Message[]>([]));
  const [loading,   setLoading]   = useState<TabLoading>(emptyRecord(false));
  const [signals,   setSignals]   = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));

  // Ref mirror to avoid stale closures inside async streaming callbacks
  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      timestamp: Date.now(),
    };

    // Append user message and mark loading
    setMessages((prev) => ({ ...prev, [tab]: [...prev[tab], userMsg] }));
    setLoading((prev)   => ({ ...prev, [tab]: true }));
    setSignals((prev)   => ({ ...prev, [tab]: "streaming" }));

    const assistantId = crypto.randomUUID();

    // Insert empty assistant placeholder immediately
    setMessages((prev) => ({
      ...prev,
      [tab]: [
        ...prev[tab],
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ],
    }));

    try {
      // Build history for the API (exclude the empty placeholder)
      const history = messagesRef.current[tab]
        .filter((m) => !(m.id === assistantId))
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tab, messages: history }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => ({
          ...prev,
          [tab]: prev[tab].map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          ),
        }));
      }

      setSignals((prev) => ({ ...prev, [tab]: "completed" }));

      // Auto-reset signal to idle after 2.4 s
      setTimeout(() => {
        setSignals((prev) => (prev[tab] === "completed" ? { ...prev, [tab]: "idle" } : prev));
      }, 2400);

    } catch (err) {
      console.error("Stream error", err);

      // Write inline error into the assistant placeholder
      setMessages((prev) => ({
        ...prev,
        [tab]: prev[tab].map((m) =>
          m.id === assistantId
            ? { ...m, content: "Error — please try again." }
            : m
        ),
      }));

      setSignals((prev) => ({ ...prev, [tab]: "error" }));

      setTimeout(() => {
        setSignals((prev) => (prev[tab] === "error" ? { ...prev, [tab]: "idle" } : prev));
      }, 2400);

    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
    }
  }, [activeTab]);

  return (
    <div className="h-screen w-screen flex flex-col bg-ruberra-bg overflow-hidden">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 min-h-0">
        <SideRail
          activeTab={activeTab}
          messages={messages}
          signals={signals}
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
