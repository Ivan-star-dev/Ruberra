"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TopBar             from "./TopBar";
import SideRail           from "./SideRail";
import MainSurface        from "./MainSurface";
import FloatingNoteSystem from "./FloatingNoteSystem";
import {
  type Tab,
  type Message,
  type SignalStatus,
  type LabView,
  type SchoolView,
  type CreationView,
  type FloatingNote,
  type Theme,
} from "./types";

type TabMessages = Record<Tab, Message[]>;
type TabLoading  = Record<Tab, boolean>;
type TabSignals  = Record<Tab, SignalStatus>;

const TABS: Tab[] = ["lab", "school", "creation"];

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map((t) => [t, value])) as Record<Tab, T>;
}

export default function RuberraShell() {
  const [activeTab,    setActiveTab]    = useState<Tab>("lab");
  const [messages,     setMessages]     = useState<TabMessages>(emptyRecord<Message[]>([]));
  const [loading,      setLoading]      = useState<TabLoading>(emptyRecord(false));
  const [signals,      setSignals]      = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));

  /* Chamber view state */
  const [labView,      setLabView]      = useState<LabView>("chat");
  const [schoolView,   setSchoolView]   = useState<SchoolView>("chat");
  const [creationView, setCreationView] = useState<CreationView>("chat");

  /* Floating notes */
  const [notes, setNotes] = useState<FloatingNote[]>([]);

  /* Theme */
  const [theme, setTheme] = useState<Theme>("dark");

  /* Apply theme to document */
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  /* ── Stream handler ────────────────────────────────────── */
  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      tab,
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
        { id: assistantId, role: "assistant", content: "", tab, timestamp: Date.now() },
      ],
    }));

    try {
      const history = messagesRef.current[tab]
        .filter((m) => m.id !== assistantId)
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
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          ),
        }));
      }

      setSignals((prev) => ({ ...prev, [tab]: "completed" }));
      setTimeout(() => {
        setSignals((prev) =>
          prev[tab] === "completed" ? { ...prev, [tab]: "idle" } : prev
        );
      }, 2400);

    } catch (err) {
      console.error("[Ruberra] stream error", err);
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
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
    }
  }, [activeTab]);

  /* ── Notes handlers ────────────────────────────────────── */
  function addNote() {
    const note: FloatingNote = {
      id:        crypto.randomUUID(),
      content:   "",
      tab:       activeTab,
      pinned:    false,
      x:         Math.max(80, window.innerWidth / 2 - 128 + Math.random() * 60),
      y:         Math.max(80, 120 + Math.random() * 80),
      timestamp: Date.now(),
    };
    setNotes((prev) => [...prev, note]);
  }

  function updateNote(id: string, updates: Partial<FloatingNote>) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n));
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id || n.pinned));
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--r-bg)" }}>

      <TopBar
        activeTab={activeTab}
        onTabChange={(t) => { setActiveTab(t); }}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
      />

      <div className="flex flex-1 min-h-0">
        <SideRail
          activeTab={activeTab}
          messages={messages}
          signals={signals}
          labView={labView}
          schoolView={schoolView}
          creationView={creationView}
          onLabView={setLabView}
          onSchoolView={setSchoolView}
          onCreationView={setCreationView}
          onNewNote={addNote}
        />

        <MainSurface
          activeTab={activeTab}
          messages={messages[activeTab]}
          isLoading={loading[activeTab]}
          onSend={handleSend}
          labView={labView}
          schoolView={schoolView}
          creationView={creationView}
        />
      </div>

      {/* Floating note layer */}
      <FloatingNoteSystem
        notes={notes}
        onChange={updateNote}
        onRemove={removeNote}
      />
    </div>
  );
}
