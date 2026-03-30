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
  return Object.fromEntries(TABS.map(t => [t, value])) as Record<Tab, T>;
}

function fmtDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function RuberraShell() {
  const [activeTab,    setActiveTab]    = useState<Tab>("lab");
  const [messages,     setMessages]     = useState<TabMessages>(emptyRecord<Message[]>([]));
  const [loading,      setLoading]      = useState<TabLoading>(emptyRecord(false));
  const [signals,      setSignals]      = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));

  const [labView,      setLabView]      = useState<LabView>("home");
  const [schoolView,   setSchoolView]   = useState<SchoolView>("curriculum");
  const [creationView, setCreationView] = useState<CreationView>("create");

  const [notes, setNotes]   = useState<FloatingNote[]>([]);
  const [theme, setTheme]   = useState<Theme>("light");
  const [stats, setStats]   = useState<SessionStats>({
    latencyMs: 0,
    model:     "RUBERRA-7B-r1",
    context:   "128k",
    date:      fmtDate(),
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;
    const t0  = Date.now();

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      role:      "user",
      content:   text,
      tab,
      timestamp: t0,
    };

    setMessages(prev => ({ ...prev, [tab]: [...prev[tab], userMsg] }));
    setLoading(prev  => ({ ...prev, [tab]: true }));
    setSignals(prev  => ({ ...prev, [tab]: "streaming" }));

    const assistantId = crypto.randomUUID();
    setMessages(prev => ({
      ...prev,
      [tab]: [...prev[tab], { id: assistantId, role: "assistant", content: "", tab, timestamp: Date.now() }],
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
      setStats(s => ({ ...s, latencyMs: Date.now() - t0 }));

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => ({
          ...prev,
          [tab]: prev[tab].map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m),
        }));
      }

      setSignals(prev => ({ ...prev, [tab]: "completed" }));
      setTimeout(() => setSignals(prev => prev[tab] === "completed" ? { ...prev, [tab]: "idle" } : prev), 2400);

    } catch (err) {
      console.error("[Ruberra] stream error", err);
      setMessages(prev => ({
        ...prev,
        [tab]: prev[tab].map(m => m.id === assistantId ? { ...m, content: "Error — please try again." } : m),
      }));
      setSignals(prev => ({ ...prev, [tab]: "error" }));
      setTimeout(() => setSignals(prev => prev[tab] === "error" ? { ...prev, [tab]: "idle" } : prev), 2400);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [activeTab]);

  function addNote() {
    setNotes(prev => [...prev, {
      id:        crypto.randomUUID(),
      content:   "",
      tab:       activeTab,
      pinned:    false,
      x:         Math.max(80, window.innerWidth / 2 - 128 + Math.random() * 60),
      y:         Math.max(80, 120 + Math.random() * 80),
      timestamp: Date.now(),
    }]);
  }

  const CHAMBER_LABEL: Record<Tab, string> = {
    lab: "LAB CHAMBER", school: "SCHOOL CHAMBER", creation: "CREATION CHAMBER",
  };

  const latency = stats.latencyMs > 0 ? `${stats.latencyMs}ms` : "42ms";

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--r-bg)" }}
    >
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === "light" ? "dark" : "light")}
      />

      {/* Main body */}
      <div className="flex flex-1 min-h-0">
        <SideRail
          activeTab={activeTab}
          labView={labView}
          schoolView={schoolView}
          creationView={creationView}
          onLabView={setLabView}
          onSchoolView={setSchoolView}
          onCreationView={setCreationView}
          onNewNote={addNote}
        />

        {/* Content + status bar */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <MainSurface
            activeTab={activeTab}
            messages={messages[activeTab]}
            isLoading={loading[activeTab]}
            onSend={handleSend}
            labView={labView}
            schoolView={schoolView}
            creationView={creationView}
            onLabView={setLabView}
          />

          {/* Status bar — matches reference bottom strip */}
          <div
            className="shrink-0 border-t flex items-center justify-between font-mono select-none"
            style={{
              height:          "28px",
              borderColor:     "var(--r-border)",
              backgroundColor: "var(--r-surface)",
              padding:         "0 20px",
              fontSize:        "10px",
              color:           "var(--r-dim)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: loading[activeTab] ? "var(--r-accent)" : "var(--r-ok)" }}
              />
              <span style={{ color: "var(--r-subtext)" }}>
                {loading[activeTab] ? "Processing…" : "CONNECTED"}
              </span>
              <span>·</span>
              <span>RUBERRA-7B-r1</span>
              <span>·</span>
              <span>128k context</span>
              <span>·</span>
              <span>{latency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{CHAMBER_LABEL[activeTab]}</span>
              <span>·</span>
              <span>{stats.date}</span>
            </div>
          </div>
        </div>
      </div>

      <FloatingNoteSystem
        notes={notes}
        onChange={(id, u) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...u } : n))}
        onRemove={id => setNotes(prev => prev.filter(n => n.id !== id || n.pinned))}
      />
    </div>
  );
}
