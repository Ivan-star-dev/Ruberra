"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TopBar from "./TopBar";
import SideRail from "./SideRail";
import MainSurface from "./MainSurface";
import { type Tab, type Message, type SignalStatus } from "./types";

type TabMessages = Record<Tab, Message[]>;
type TabLoading  = Record<Tab, boolean>;
type TabSignals  = Record<Tab, SignalStatus>;
type TabDrafts   = Record<Tab, string>;

const TABS: Tab[] = ["lab", "school", "creation"];

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map((t) => [t, value])) as Record<Tab, T>;
}

const STORAGE_KEY = "ruberra_messages";
const MAX_CONTEXT = 20;

function loadMessages(): TabMessages {
  if (typeof window === "undefined") return emptyRecord<Message[]>([]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TabMessages;
      if (TABS.every((t) => Array.isArray(parsed[t]))) return parsed;
    }
  } catch { /* corrupt storage — ignore */ }
  return emptyRecord<Message[]>([]);
}

export default function RuberraShell() {
  const [activeTab, setActiveTab] = useState<Tab>("lab");
  const [messages,  setMessages]  = useState<TabMessages>(loadMessages);
  const [loading,   setLoading]   = useState<TabLoading>(emptyRecord(false));
  const [signals,   setSignals]   = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));
  // Per-tab draft state — preserved independently when switching chambers
  const [drafts,    setDrafts]    = useState<TabDrafts>(emptyRecord(""));

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const abortRefs = useRef<Record<Tab, AbortController | null>>(
    emptyRecord<AbortController | null>(null)
  );

  // Persist messages to localStorage (debounced 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch { /* storage full — ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleCancel = useCallback(() => {
    abortRefs.current[activeTab]?.abort();
  }, [activeTab]);

  const handleDraftChange = useCallback((text: string) => {
    setDrafts((prev) => ({ ...prev, [activeTab]: text }));
  }, [activeTab]);

  const handleClearTab = useCallback((tab: Tab) => {
    setMessages((prev) => ({ ...prev, [tab]: [] }));
    // Clear persisted storage for this tab immediately
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TabMessages;
        parsed[tab] = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;

    // Abort any existing stream on this tab
    abortRefs.current[tab]?.abort();
    const controller = new AbortController();
    abortRefs.current[tab] = controller;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      timestamp: Date.now(),
    };

    setMessages((prev) => ({ ...prev, [tab]: [...prev[tab], userMsg] }));
    setLoading((prev)  => ({ ...prev, [tab]: true }));
    setSignals((prev)  => ({ ...prev, [tab]: "streaming" }));

    const assistantId = crypto.randomUUID();

    setMessages((prev) => ({
      ...prev,
      [tab]: [
        ...prev[tab],
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ],
    }));

    try {
      const history = messagesRef.current[tab]
        .filter((m) => m.id !== assistantId)
        .slice(-MAX_CONTEXT)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tab, messages: history }),
        signal:  controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => ({
            ...prev,
            [tab]: prev[tab].map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            ),
          }));
        }
      } finally {
        reader.releaseLock();
      }

      setSignals((prev) => ({ ...prev, [tab]: "completed" }));
      setTimeout(() => {
        setSignals((prev) =>
          prev[tab] === "completed" ? { ...prev, [tab]: "idle" } : prev
        );
      }, 2400);

    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";

      if (isAbort) {
        setSignals((prev) => ({ ...prev, [tab]: "idle" }));
      } else {
        console.error("Stream error", err);
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
          setSignals((prev) =>
            prev[tab] === "error" ? { ...prev, [tab]: "idle" } : prev
          );
        }, 2400);
      }

    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
      abortRefs.current[tab] = null;
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
          onClearTab={handleClearTab}
        />
        <MainSurface
          activeTab={activeTab}
          messages={messages[activeTab]}
          isLoading={loading[activeTab]}
          draft={drafts[activeTab]}
          onDraftChange={handleDraftChange}
          onSend={handleSend}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
