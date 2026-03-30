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
  onNewSession:   () => void;
}

/* ── Primitives ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="select-none font-mono"
      style={{
        fontSize:      "9px",
        letterSpacing: "0.12em",
        color:         "var(--r-dim)",
        marginBottom:  "6px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

/* Plain-text nav item — no icon, no background box. Active = full text color.
   This matches the reference design exactly. */
function ContextItem({
  label,
  active,
  onClick,
  muted = false,
}: {
  label:    string;
  active:   boolean;
  onClick:  () => void;
  muted?:   boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-colors duration-100 select-none"
      style={{
        fontSize:    "12px",
        lineHeight:  "1",
        padding:     "5px 0",
        color:       active ? "var(--r-text)"
                   : muted  ? "var(--r-dim)"
                   : "var(--r-subtext)",
        fontWeight:  active ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div
      className="shrink-0"
      style={{ height: "1px", backgroundColor: "var(--r-border-soft)", margin: "8px 0" }}
    />
  );
}

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
      <span className="font-mono capitalize" style={{ fontSize: "9px", color: "var(--r-subtext)" }}>
        {status}
      </span>
    </div>
  );
}

/* ── Lab rail ───────────────────────────────────────────────── */

function LabRail({
  activeView, onView, messages, signal, onNewSession,
}: {
  activeView:   LabView;
  onView:       (v: LabView) => void;
  messages:     Message[];
  signal:       SignalStatus;
  onNewSession: () => void;
}) {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">

      {/* CONTEXT section */}
      <section style={{ padding: "14px 16px 10px" }}>
        <SectionLabel>Context</SectionLabel>
        <div>
          <ContextItem label="General"  active={activeView === "chat"}     onClick={() => onView("chat")} />
          <ContextItem label="Research" active={activeView === "research"}  onClick={() => onView("research")} />
          <ContextItem label="Code"     active={activeView === "code"}      onClick={() => onView("code")} />
          <ContextItem label="Analysis" active={activeView === "analysis"}  onClick={() => onView("analysis")} />
          <ContextItem label="Summary"  active={activeView === "summary"}   onClick={() => onView("summary")} />
        </div>

        <Divider />

        <ContextItem
          label="New session"
          active={false}
          muted={!hasMessages}
          onClick={onNewSession}
        />
      </section>

      {/* Recent queries */}
      {hasMessages && (
        <>
          <Divider />
          <section style={{ padding: "4px 16px 10px", flex: "1", overflow: "hidden" }}>
            <SectionLabel>Recent</SectionLabel>
            <ul>
              {messages
                .filter(m => m.role === "user")
                .slice()
                .reverse()
                .slice(0, 6)
                .map(m => (
                  <li
                    key={m.id}
                    className="truncate"
                    style={{
                      fontSize:   "11px",
                      color:      "var(--r-subtext)",
                      lineHeight: "1.5",
                      padding:    "3px 0",
                    }}
                    title={m.content}
                  >
                    {m.content.slice(0, 40)}{m.content.length > 40 ? "…" : ""}
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}

      {/* Kernel status — bottom */}
      <section style={{ padding: "8px 16px 12px", marginTop: "auto" }}>
        <StatusIndicator status={signal} />
      </section>
    </div>
  );
}

/* ── School rail ────────────────────────────────────────────── */

function SchoolRail({
  activeView, onView, messages, signal, onNewSession,
}: {
  activeView:   SchoolView;
  onView:       (v: SchoolView) => void;
  messages:     Message[];
  signal:       SignalStatus;
  onNewSession: () => void;
}) {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <section style={{ padding: "14px 16px 10px" }}>
        <SectionLabel>Context</SectionLabel>
        <ContextItem label="General" active={activeView === "chat"}    onClick={() => onView("chat")} />
        <ContextItem label="Library" active={activeView === "library"} onClick={() => onView("library")} />
        <ContextItem label="Archive" active={activeView === "archive"} onClick={() => onView("archive")} />
        <Divider />
        <ContextItem label="New session" active={false} muted={!hasMessages} onClick={onNewSession} />
      </section>

      {hasMessages && (
        <>
          <Divider />
          <section style={{ padding: "4px 16px 10px" }}>
            <SectionLabel>Recent</SectionLabel>
            <ul>
              {messages.filter(m => m.role === "user").slice().reverse().slice(0, 5).map(m => (
                <li key={m.id} className="truncate"
                  style={{ fontSize: "11px", color: "var(--r-subtext)", lineHeight: "1.5", padding: "3px 0" }}
                  title={m.content}>
                  {m.content.slice(0, 40)}{m.content.length > 40 ? "…" : ""}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section style={{ padding: "8px 16px 12px", marginTop: "auto" }}>
        <StatusIndicator status={signal} />
      </section>
    </div>
  );
}

/* ── Creation rail ──────────────────────────────────────────── */

function CreationRail({
  activeView, onView, messages, signal, onNewSession,
}: {
  activeView:   CreationView;
  onView:       (v: CreationView) => void;
  messages:     Message[];
  signal:       SignalStatus;
  onNewSession: () => void;
}) {
  const hasMessages = messages.length > 0;
  const outputs = messages.filter(m => m.role === "assistant" && m.content.length > 0).length;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <section style={{ padding: "14px 16px 10px" }}>
        <SectionLabel>Context</SectionLabel>
        <ContextItem label="Build"   active={activeView === "chat" || activeView === "terminal"} onClick={() => onView("chat")} />
        <ContextItem label="Archive" active={activeView === "archive"} onClick={() => onView("archive")} />
        <Divider />
        <ContextItem label="New session" active={false} muted={!hasMessages} onClick={onNewSession} />
      </section>

      {outputs > 0 && (
        <>
          <Divider />
          <section style={{ padding: "4px 16px 10px" }}>
            <SectionLabel>Outputs</SectionLabel>
            <p className="font-mono" style={{ fontSize: "10px", color: "var(--r-subtext)" }}>
              {outputs} artifact{outputs !== 1 ? "s" : ""}
            </p>
          </section>
        </>
      )}

      <section style={{ padding: "8px 16px 12px", marginTop: "auto" }}>
        <StatusIndicator status={signal} />
      </section>
    </div>
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
  onNewSession,
}: SideRailProps) {
  return (
    <aside
      className="shrink-0 border-r flex flex-col overflow-hidden"
      style={{
        width:           "168px",
        borderColor:     "var(--r-border)",
        backgroundColor: "var(--r-rail)",
      }}
    >
      {/* Rail header */}
      <div
        className="flex items-center justify-between border-b"
        style={{
          height:          "44px",
          borderColor:     "var(--r-border)",
          paddingLeft:     "16px",
          paddingRight:    "12px",
        }}
      >
        <span
          className="font-mono select-none"
          style={{
            fontSize:      "9px",
            color:         "var(--r-subtext)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {activeTab}
        </span>

        {/* New note — minimal icon */}
        <button
          onClick={onNewNote}
          className="flex items-center justify-center transition-colors duration-150"
          style={{ color: "var(--r-dim)", width: "24px", height: "24px" }}
          title="New note"
          aria-label="New floating note"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Chamber nav */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "lab" && (
          <LabRail
            activeView={labView}
            onView={onLabView}
            messages={messages.lab}
            signal={signals.lab}
            onNewSession={onNewSession}
          />
        )}
        {activeTab === "school" && (
          <SchoolRail
            activeView={schoolView}
            onView={onSchoolView}
            messages={messages.school}
            signal={signals.school}
            onNewSession={onNewSession}
          />
        )}
        {activeTab === "creation" && (
          <CreationRail
            activeView={creationView}
            onView={onCreationView}
            messages={messages.creation}
            signal={signals.creation}
            onNewSession={onNewSession}
          />
        )}
      </div>
    </aside>
  );
}
