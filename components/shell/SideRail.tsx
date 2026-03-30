"use client";

import {
  type Tab,
  type Message,
  type SignalStatus,
  type LabView,
  type SchoolView,
  type CreationView,
} from "./types";

interface SideRailProps {
  activeTab:      Tab;
  messages:       Record<Tab, Message[]>;
  signals:        Record<Tab, SignalStatus>;
  labView:        LabView;
  schoolView:     SchoolView;
  creationView:   CreationView;
  onLabView:      (v: LabView) => void;
  onSchoolView:   (v: SchoolView) => void;
  onCreationView: (v: CreationView) => void;
  onNewNote:      () => void;
}

/* ── Primitives ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] uppercase tracking-widest select-none mb-1.5"
      style={{ color: "var(--r-dim)", fontWeight: 500, letterSpacing: "0.1em" }}
    >
      {children}
    </p>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label:   string;
  icon:    React.ReactNode;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors duration-150"
      style={{
        backgroundColor: active ? "var(--r-border)" : "transparent",
        color:           active ? "var(--r-text)"   : "var(--r-subtext)",
        fontSize:        "11px",
      }}
    >
      <span
        className="w-3.5 h-3.5 shrink-0 flex items-center justify-center"
        style={{ color: active ? "var(--r-accent)" : "var(--r-dim)" }}
      >
        {icon}
      </span>
      <span className="truncate leading-none">{label}</span>
    </button>
  );
}

/* Inline status indicator without broken CSS animation property */
function StatusIndicator({ status }: { status: SignalStatus }) {
  const isActive = status === "streaming";
  return (
    <div className="flex items-center gap-2">
      <span
        className={["w-1.5 h-1.5 rounded-full shrink-0", isActive ? "animate-pulse" : ""].join(" ")}
        style={{
          backgroundColor:
            status === "streaming" ? "var(--r-accent)" :
            status === "completed" ? "var(--r-ok)"     :
            status === "error"     ? "var(--r-err)"    :
            "var(--r-dim)",
        }}
      />
      <span style={{ fontSize: "10px", color: "var(--r-subtext)" }} className="capitalize">
        {status}
      </span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between mt-1">
      <span style={{ fontSize: "9px", color: "var(--r-dim)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: "9px", color: "var(--r-subtext)" }}>{value}</span>
    </div>
  );
}

function HistoryList({ messages }: { messages: Message[] }) {
  const items = messages
    .filter(m => m.role === "user")
    .slice()
    .reverse()
    .slice(0, 5);

  if (items.length === 0) {
    return (
      <p style={{ fontSize: "10px", color: "var(--r-dim)" }} className="px-1">
        No queries yet
      </p>
    );
  }

  return (
    <ul className="space-y-px">
      {items.map(m => (
        <li
          key={m.id}
          className="px-1 py-1 truncate cursor-default"
          style={{ fontSize: "10px", color: "var(--r-subtext)", lineHeight: "1.4" }}
          title={m.content}
        >
          {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
        </li>
      ))}
    </ul>
  );
}

/* ── Lab rail ───────────────────────────────────────────────── */

function LabRail({
  activeView, onView, messages, signal,
}: {
  activeView: LabView;
  onView:     (v: LabView) => void;
  messages:   Message[];
  signal:     SignalStatus;
}) {
  const exchanges = messages.filter(m => m.role === "assistant" && m.content.length > 0).length;

  return (
    <>
      <section className="px-3 pt-3 pb-3 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Views</SectionLabel>
        <div className="space-y-px">
          <NavItem label="Chat"     active={activeView === "chat"}     onClick={() => onView("chat")}     icon={<IconChat />} />
          <NavItem label="Analysis" active={activeView === "analysis"} onClick={() => onView("analysis")} icon={<IconAnalysis />} />
          <NavItem label="Code"     active={activeView === "code"}     onClick={() => onView("code")}     icon={<IconCode />} />
          <NavItem label="Archive"  active={activeView === "archive"}  onClick={() => onView("archive")}  icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-3 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Recent</SectionLabel>
        <HistoryList messages={messages} />
      </section>

      <section className="px-3 pt-3 pb-3">
        <SectionLabel>Kernel</SectionLabel>
        <StatusIndicator status={signal} />
        <MetaRow label="exchanges" value={exchanges > 0 ? String(exchanges) : "—"} />
      </section>
    </>
  );
}

/* ── School rail ────────────────────────────────────────────── */

function SchoolRail({
  activeView, onView, messages, signal,
}: {
  activeView: SchoolView;
  onView:     (v: SchoolView) => void;
  messages:   Message[];
  signal:     SignalStatus;
}) {
  return (
    <>
      <section className="px-3 pt-3 pb-3 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Views</SectionLabel>
        <div className="space-y-px">
          <NavItem label="Chat"    active={activeView === "chat"}    onClick={() => onView("chat")}    icon={<IconChat />} />
          <NavItem label="Library" active={activeView === "library"} onClick={() => onView("library")} icon={<IconLibrary />} />
          <NavItem label="Archive" active={activeView === "archive"} onClick={() => onView("archive")} icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-3 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Recent</SectionLabel>
        <HistoryList messages={messages} />
      </section>

      <section className="px-3 pt-3 pb-3">
        <SectionLabel>Status</SectionLabel>
        <StatusIndicator status={signal} />
      </section>
    </>
  );
}

/* ── Creation rail ──────────────────────────────────────────── */

function CreationRail({
  activeView, onView, messages, signal,
}: {
  activeView: CreationView;
  onView:     (v: CreationView) => void;
  messages:   Message[];
  signal:     SignalStatus;
}) {
  const outputs = messages.filter(m => m.role === "assistant" && m.content.length > 0).length;

  return (
    <>
      <section className="px-3 pt-3 pb-3 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Views</SectionLabel>
        <div className="space-y-px">
          <NavItem label="Build"   active={activeView === "chat" || activeView === "terminal"} onClick={() => onView("chat")}     icon={<IconBuild />} />
          <NavItem label="Archive" active={activeView === "archive"} onClick={() => onView("archive")} icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-3 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Outputs</SectionLabel>
        {outputs === 0 ? (
          <p style={{ fontSize: "10px", color: "var(--r-dim)" }} className="px-1">No outputs yet</p>
        ) : (
          <HistoryList messages={messages.filter(m => m.role === "assistant")} />
        )}
      </section>

      <section className="px-3 pt-3 pb-3">
        <SectionLabel>Forge</SectionLabel>
        <StatusIndicator status={signal} />
        <MetaRow label="outputs" value={outputs > 0 ? String(outputs) : "—"} />
      </section>
    </>
  );
}

/* ── Root ───────────────────────────────────────────────────── */

export default function SideRail({
  activeTab,
  messages,
  signals,
  labView,
  schoolView,
  creationView,
  onLabView,
  onSchoolView,
  onCreationView,
  onNewNote,
}: SideRailProps) {
  return (
    <aside
      className="w-48 shrink-0 border-r flex flex-col overflow-hidden"
      style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-rail)" }}
    >
      {/* Rail header — chamber identity + new note */}
      <div
        className="flex items-center justify-between px-4 border-b"
        style={{ height: "44px", borderColor: "var(--r-border)" }}
      >
        <span
          className="text-[10px] uppercase tracking-widest font-semibold select-none"
          style={{ color: "var(--r-accent)", letterSpacing: "0.1em" }}
        >
          {activeTab}
        </span>
        <button
          onClick={onNewNote}
          className="flex items-center justify-center w-6 h-6 transition-colors duration-150"
          style={{ color: "var(--r-dim)" }}
          title="New note"
          aria-label="New floating note"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Chamber nav */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {activeTab === "lab" && (
          <LabRail
            activeView={labView}
            onView={onLabView}
            messages={messages.lab}
            signal={signals.lab}
          />
        )}
        {activeTab === "school" && (
          <SchoolRail
            activeView={schoolView}
            onView={onSchoolView}
            messages={messages.school}
            signal={signals.school}
          />
        )}
        {activeTab === "creation" && (
          <CreationRail
            activeView={creationView}
            onView={onCreationView}
            messages={messages.creation}
            signal={signals.creation}
          />
        )}
      </div>
    </aside>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

function IconChat() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M1 1.5h10v7H7l-2.5 2V8.5H1V1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function IconAnalysis() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 9.5l2.5-3.5 2 2 2.5-4 2 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 4L1.5 6l2 2M8.5 4l2 2-2 2M6.5 2.5l-1 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1.5" width="10" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 4v6h9V4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M4.5 7h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function IconLibrary() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 2.5h2v7h-2zM5 2.5h2v7H5zM8.5 3l2 .8v6l-2-.8V3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuild() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.5 5.5h5M3.5 3.5h3M3.5 7.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
