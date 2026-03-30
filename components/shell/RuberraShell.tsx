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
        />
      </div>
    </div>
  );
}
