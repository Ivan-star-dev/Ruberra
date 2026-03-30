/**
 * RUBERRA — Mother Shell
 * Full state management ported from github.com/Ivan-star-dev/Ruberra
 * with Make-environment streaming via Supabase edge function.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SovereignBar } from "./components/SovereignBar";
import { ShellSideRail } from "./components/ShellSideRail";
import { FloatingNoteSystem } from "./components/FloatingNoteSystem";
import { LabMode } from "./components/modes/LabMode";
import { SchoolMode } from "./components/modes/SchoolMode";
import { CreationMode } from "./components/modes/CreationMode";
import {
  type Tab,
  type Message,
  type SignalStatus,
  type LabView,
  type SchoolView,
  type CreationView,
  type FloatingNote,
  type Theme,
} from "./components/shell-types";
import { parseBlocks } from "./components/parseBlocks";

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS: Tab[] = ["lab", "school", "creation"];
const STORAGE_KEY = "ruberra_messages_v2";
const MAX_CONTEXT = 20;
// NOTE: Replace SERVER_URL with your Supabase project endpoint
// const SERVER_URL = `https://<PROJECT_ID>.supabase.co/functions/v1/make-server-b9f46b68`;

type TabMessages = Record<Tab, Message[]>;
type TabLoading  = Record<Tab, boolean>;
type TabSignals  = Record<Tab, SignalStatus>;
type TabDrafts   = Record<Tab, string>;

function emptyRecord<T>(value: T): Record<Tab, T> {
  return Object.fromEntries(TABS.map((t) => [t, value])) as Record<Tab, T>;
}

function loadMessages(): TabMessages {
  if (typeof window === "undefined") return emptyRecord<Message[]>([]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TabMessages;
      if (TABS.every((t) => Array.isArray(parsed[t]))) return parsed;
    }
  } catch { /* corrupt storage */ }
  return emptyRecord<Message[]>([]);
}

export default function App() {
  const [activeTab,    setActiveTab]    = useState<Tab>("lab");
  const [messages,     setMessages]     = useState<TabMessages>(loadMessages);
  const [loading,      setLoading]      = useState<TabLoading>(emptyRecord(false));
  const [signals,      setSignals]      = useState<TabSignals>(emptyRecord<SignalStatus>("idle"));
  const [drafts,       setDrafts]       = useState<TabDrafts>(emptyRecord(""));
  const [labView,      setLabView]      = useState<LabView>("chat");
  const [schoolView,   setSchoolView]   = useState<SchoolView>("chat");
  const [creationView, setCreationView] = useState<CreationView>("chat");
  const [notes, setNotes] = useState<FloatingNote[]>([]);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  const messagesRef = useRef<TabMessages>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* storage full */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  const abortRefs = useRef<Record<Tab, AbortController | null>>(emptyRecord<AbortController | null>(null));

  const handleCancel = useCallback(() => { abortRefs.current[activeTab]?.abort(); }, [activeTab]);
  const handleDraftChange = useCallback((text: string) => { setDrafts((prev) => ({ ...prev, [activeTab]: text })); }, [activeTab]);

  const handleClearTab = useCallback((tab: Tab) => {
    setMessages((prev) => ({ ...prev, [tab]: [] }));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { const parsed = JSON.parse(stored) as TabMessages; parsed[tab] = []; localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); }
    } catch { /* ignore */ }
  }, []);

  const applyParsedBlocks = useCallback((id: string, tab: Tab) => {
    setMessages((prev) => ({
      ...prev,
      [tab]: prev[tab].map((m) => {
        if (m.id !== id || m.role !== "assistant") return m;
        const blocks = parseBlocks(m.content);
        return blocks.length > 0 ? { ...m, blocks } : m;
      }),
    }));
  }, []);

  // Replace with your actual API endpoint
  const handleSend = useCallback(async (text: string) => {
    const tab = activeTab;
    abortRefs.current[tab]?.abort();
    const controller = new AbortController();
    abortRefs.current[tab] = controller;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, tab, timestamp: Date.now() };
    setMessages((prev) => ({ ...prev, [tab]: [...prev[tab], userMsg] }));
    setLoading((prev) => ({ ...prev, [tab]: true }));
    setSignals((prev) => ({ ...prev, [tab]: "streaming" }));

    const assistantId = crypto.randomUUID();
    setMessages((prev) => ({ ...prev, [tab]: [...prev[tab], { id: assistantId, role: "assistant", content: "", tab, timestamp: Date.now() }] }));

    let parseOnComplete = true;

    try {
      const history = messagesRef.current[tab].filter((m) => m.id !== assistantId).slice(-MAX_CONTEXT).map(({ role, content }) => ({ role, content }));

      // TODO: Replace with your API endpoint
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab, messages: [...history, { role: "user", content: text }] }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => ({ ...prev, [tab]: prev[tab].map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m) }));
        }
      } finally { reader.releaseLock(); }

      setSignals((prev) => ({ ...prev, [tab]: "completed" }));
      setTimeout(() => { setSignals((prev) => prev[tab] === "completed" ? { ...prev, [tab]: "idle" } : prev); }, 2400);
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      parseOnComplete = false;
      if (isAbort) {
        setSignals((prev) => ({ ...prev, [tab]: "idle" }));
      } else {
        console.error("[Ruberra] stream error", err);
        setMessages((prev) => ({ ...prev, [tab]: prev[tab].map((m) => m.id === assistantId ? { ...m, content: "Error — please try again." } : m) }));
        setSignals((prev) => ({ ...prev, [tab]: "error" }));
        setTimeout(() => { setSignals((prev) => prev[tab] === "error" ? { ...prev, [tab]: "idle" } : prev); }, 2400);
      }
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
      abortRefs.current[tab] = null;
      if (parseOnComplete) applyParsedBlocks(assistantId, tab);
    }
  }, [activeTab, applyParsedBlocks]);

  const addNote = useCallback(() => {
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), content: "", tab: activeTab, pinned: false, x: Math.max(80, window.innerWidth / 2 - 128 + Math.random() * 60), y: Math.max(80, 120 + Math.random() * 80), timestamp: Date.now() }]);
  }, [activeTab]);

  const updateNote = useCallback((id: string, updates: Partial<FloatingNote>) => { setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n)); }, []);
  const removeNote = useCallback((id: string) => { setNotes((prev) => prev.filter((n) => n.id !== id || n.pinned)); }, []);
  const isLive = Object.values(signals).some((s) => s === "streaming");

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "var(--r-bg)", fontFamily: "'Inter', sans-serif", overflow: "hidden", transition: "background 0.2s ease" }}>
      <SovereignBar activeTab={activeTab} onTabChange={setActiveTab} isLive={isLive} theme={theme} onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <ShellSideRail activeTab={activeTab} messages={messages} signals={signals} labView={labView} schoolView={schoolView} creationView={creationView} onLabView={setLabView} onSchoolView={setSchoolView} onCreationView={setCreationView} onNewNote={addNote} onClearTab={handleClearTab} />
        <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.18, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
              {activeTab === "lab" && <LabMode messages={messages.lab} isLoading={loading.lab} draft={drafts.lab} onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel} labView={labView} onLabView={setLabView} />}
              {activeTab === "school" && <SchoolMode messages={messages.school} isLoading={loading.school} draft={drafts.school} onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel} schoolView={schoolView} onSchoolView={setSchoolView} />}
              {activeTab === "creation" && <CreationMode messages={messages.creation} isLoading={loading.creation} draft={drafts.creation} onDraftChange={handleDraftChange} onSend={handleSend} onCancel={handleCancel} creationView={creationView} onCreationView={setCreationView} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <div style={{ height: "22px", borderTop: "1px solid var(--r-border)", background: "var(--r-rail)", display: "flex", alignItems: "center", padding: "0 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--r-pulse)" }} />
          <span style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.10em", color: "var(--r-subtext)", textTransform: "uppercase" }}>{isLive ? "STREAMING" : "CONNECTED"}</span>
        </div>
        <div style={{ width: "1px", height: "10px", background: "var(--r-border)", margin: "0 12px" }} />
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)", letterSpacing: "0.06em" }}>RUBERRA-7B-r1 · 128k context</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)", letterSpacing: "0.06em", marginRight: "12px" }}>{activeTab.toUpperCase()} CHAMBER</span>
        <div style={{ width: "1px", height: "10px", background: "var(--r-border)", margin: "0 12px" }} />
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)" }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
      </div>
      <FloatingNoteSystem notes={notes} onChange={updateNote} onRemove={removeNote} />
    </div>
  );
}
