"use client";

import { useState, useCallback, useRef } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab } from "./TabSwitcher";
import { type Message, type Signal } from "./types";

const IDLE_SIGNAL: Signal = { status: "idle", label: "Idle", tab: null };

function toApiMessages(msgs: Message[], tab: Tab) {
  return msgs
    .filter((m) => m.tab === tab && !m.streaming)
    .map((m) => ({ role: m.role, content: m.content }));
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [signal, setSignal] = useState<Signal>(IDLE_SIGNAL);

  // Stable ref so handleSubmit never stales on messages
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const handleSubmit = useCallback(
    async (text: string) => {
      const tab = activeTab;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        tab,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);
      setSignal({ status: "streaming", label: "Streaming", tab });

      const assistantId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          tab,
          timestamp: Date.now(),
          streaming: true,
        },
      ]);

      try {
        const history = toApiMessages([...messagesRef.current, userMsg], tab);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tab, messages: history }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`API error ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot, streaming: true } : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, streaming: false } : m
          )
        );
        setSignal({ status: "completed", label: "Completed", tab });
      } catch (err) {
        console.error("[Ruberra] stream error", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Stream error. Please try again.", streaming: false }
              : m
          )
        );
        setSignal({ status: "error", label: "Error", tab });
      } finally {
        setStreaming(false);
        setTimeout(() => setSignal(IDLE_SIGNAL), 2400);
      }
    },
    [activeTab]
  );
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
        <SideRail activeTab={activeTab} messages={messages} signal={signal} />
        <MainSurface
          activeTab={activeTab}
          messages={messages}
          onSubmit={handleSubmit}
          streaming={streaming}
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
