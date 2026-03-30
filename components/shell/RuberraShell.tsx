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
  type SessionStats,
} from "./types";

type TabMessages = Record<Tab, Message[]>;
type TabLoading  = Record<Tab, boolean>;
type TabSignals  = Record<Tab, SignalStatus>;

const TABS: Tab[] = ["lab", "school", "creation"];

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map((t) => [t, value])) as Record<Tab, T>;
}

function fmtDate(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RuberraShell() {
  const [activeTab,    setActiveTab]    = useState<Tab>("lab");
  const [messages,     setMessages]     = useState<TabMessages>(emptyRecord<Message[]>([]));
  const [loading,      setLoading]      = useState<TabLoading>(emptyRecord(false));
  const [signals,      setSignals]      = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));

  const [labView,      setLabView]      = useState<LabView>("chat");
  const [schoolView,   setSchoolView]   = useState<SchoolView>("chat");
  const [creationView, setCreationView] = useState<CreationView>("chat");

  const [notes, setNotes]   = useState<FloatingNote[]>([]);
  const [theme, setTheme]   = useState<Theme>("dark");

  /* Session stats — latency measured from send to first byte */
  const [stats, setStats] = useState<SessionStats>({
    latencyMs: 0,
    model:     "RUBERRA-7B-r1",
    context:   "128k",
    date:      fmtDate(),
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme", theme === "light" ? "light" : ""
    );
    if (theme === "dark") {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  /* ── Stream handler ─────────────────────────────────────── */
  const handleSend = useCallback(async (text: string) => {
    const tab   = activeTab;
    const t0    = Date.now();

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      tab,
      timestamp: t0,
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
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          tab,
          messages: messagesRef.current[tab]
            .filter(m => m.id !== assistantId)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      /* Record first-byte latency */
      const firstByteMs = Date.now() - t0;
      setStats(s => ({ ...s, latencyMs: firstByteMs }));

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

  /* ── Session reset ──────────────────────────────────────── */
  function handleNewSession() {
    const tab = activeTab;
    setMessages((prev) => ({ ...prev, [tab]: [] }));
    setSignals((prev)  => ({ ...prev, [tab]: "idle" }));
    setStats(s => ({ ...s, latencyMs: 0, date: fmtDate() }));
    /* Reset to default view for tab */
    if (tab === "lab")      setLabView("chat");
    if (tab === "school")   setSchoolView("chat");
    if (tab === "creation") setCreationView("chat");
  }

  /* ── Notes ──────────────────────────────────────────────── */
  function addNote() {
    setNotes((prev) => [...prev, {
      id:        crypto.randomUUID(),
      content:   "",
      tab:       activeTab,
      pinned:    false,
      x:         Math.max(80, window.innerWidth / 2 - 128 + Math.random() * 60),
      y:         Math.max(80, 120 + Math.random() * 80),
      timestamp: Date.now(),
    }]);
  }

  function updateNote(id: string, updates: Partial<FloatingNote>) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n));
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id || n.pinned));
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--r-bg)" }}
    >
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
          onNewSession={handleNewSession}
        />

        <MainSurface
          activeTab={activeTab}
          messages={messages[activeTab]}
          isLoading={loading[activeTab]}
          onSend={handleSend}
          labView={labView}
          schoolView={schoolView}
          creationView={creationView}
          stats={stats}
        />
      </div>

      <FloatingNoteSystem
        notes={notes}
        onChange={updateNote}
        onRemove={removeNote}
      />
    </div>
  );
}
