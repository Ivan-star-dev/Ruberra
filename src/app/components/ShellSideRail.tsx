"use client";

import { useState } from "react";
import {
  type Tab,
  type Message,
  type SignalStatus,
  type LabView,
  type SchoolView,
  type CreationView,
  type NavFn,
} from "./shell-types";

interface ShellSideRailProps {
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
  onClearTab:     (tab: Tab) => void;
  navigate:       NavFn;
}

const ALL_TABS: Tab[] = ["lab", "school", "creation"];

/* ── Shared primitives ──────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] uppercase tracking-widest select-none font-semibold mb-1.5 px-0.5"
      style={{ color: "var(--r-subtext)" }}
    >
      {children}
    </p>
  );
}

function NavItem({
  label, icon, active, onClick,
}: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-[11px] transition-all duration-150 text-left"
      style={{
        backgroundColor: active ? "var(--r-border)" : "transparent",
        color: active ? "var(--r-text)" : "var(--r-subtext)",
        fontWeight: active ? 500 : 400,
      }}
    >
      <span
        className="w-3.5 h-3.5 shrink-0 flex items-center justify-center"
        style={{ color: active ? "var(--r-accent)" : "var(--r-subtext)" }}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function StatusDot({ status }: { status: SignalStatus }) {
  const color =
    status === "streaming" ? "var(--r-accent)" :
    status === "completed" ? "var(--r-ok)" :
    status === "error"     ? "var(--r-err)" :
    "var(--r-dim)";
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
      style={{
        backgroundColor: color,
        animation: status === "streaming" ? "pulse 1s ease-in-out infinite" : "none",
      }}
    />
  );
}

function SignalMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-0.5 mt-0.5">
      <span className="text-[9px] font-mono" style={{ color: "var(--r-dim)" }}>{label}</span>
      <span className="text-[9px] font-mono" style={{ color: "var(--r-subtext)" }}>{value}</span>
    </div>
  );
}

/* ── Lab rail ──────────────────────────────────────────────────── */

function LabRail({
  activeView, onView, messages, signal,
}: {
  activeView: LabView; onView: (v: LabView) => void;
  messages: Message[]; signal: SignalStatus;
}) {
  const history = messages.filter((m) => m.role === "user").slice().reverse().slice(0, 5);

  return (
    <>
      <section className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Navigate</SectionLabel>
        <div className="space-y-0.5">
          <NavItem label="Chat"     active={activeView === "chat"}     onClick={() => onView("chat")}     icon={<IconChat />} />
          <NavItem label="Analysis" active={activeView === "analysis"} onClick={() => onView("analysis")} icon={<IconAnalysis />} />
          <NavItem label="Code"     active={activeView === "code"}     onClick={() => onView("code")}     icon={<IconCode />} />
          <NavItem label="Archive"  active={activeView === "archive"}  onClick={() => onView("archive")}  icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-2 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Session</SectionLabel>
        {history.length === 0 ? (
          <p className="text-[10px] px-0.5" style={{ color: "var(--r-dim)" }}>No queries yet</p>
        ) : (
          <ul className="space-y-0.5">
            {history.map((m) => (
              <li
                key={m.id}
                className="text-[10px] px-2 py-1 rounded truncate cursor-default"
                style={{ color: "var(--r-subtext)" }}
                title={m.content}
              >
                {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-3 pt-3 pb-2">
        <SectionLabel>Kernel</SectionLabel>
        <div className="flex items-center gap-2 px-0.5">
          <StatusDot status={signal} />
          <span className="text-[10px] capitalize" style={{ color: "var(--r-subtext)" }}>{signal}</span>
        </div>
        <SignalMeta label="exchanges" value={String(messages.filter(m => m.role === "assistant" && m.content.length > 0).length)} />
      </section>
    </>
  );
}

/* ── School rail ────────────────────────────────────────────────── */

function SchoolRail({
  activeView, onView, messages, signal,
}: {
  activeView: SchoolView; onView: (v: SchoolView) => void;
  messages: Message[]; signal: SignalStatus;
}) {
  const history = messages.filter((m) => m.role === "user").slice().reverse().slice(0, 5);

  return (
    <>
      <section className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Navigate</SectionLabel>
        <div className="space-y-0.5">
          <NavItem label="Chat"    active={activeView === "chat"}    onClick={() => onView("chat")}    icon={<IconChat />} />
          <NavItem label="Library" active={activeView === "library"} onClick={() => onView("library")} icon={<IconLibrary />} />
          <NavItem label="Archive" active={activeView === "archive"} onClick={() => onView("archive")} icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-2 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Queries</SectionLabel>
        {history.length === 0 ? (
          <p className="text-[10px] px-0.5" style={{ color: "var(--r-dim)" }}>No queries yet</p>
        ) : (
          <ul className="space-y-0.5">
            {history.map((m) => (
              <li
                key={m.id}
                className="text-[10px] px-2 py-1 rounded truncate cursor-default"
                style={{ color: "var(--r-subtext)" }}
                title={m.content}
              >
                {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-3 pt-3 pb-2">
        <SectionLabel>Status</SectionLabel>
        <div className="flex items-center gap-2 px-0.5">
          <StatusDot status={signal} />
          <span className="text-[10px] capitalize" style={{ color: "var(--r-subtext)" }}>{signal}</span>
        </div>
      </section>
    </>
  );
}

/* ── Creation rail ─────────────────────────────────────────────── */

function CreationRail({
  activeView, onView, messages, signal,
}: {
  activeView: CreationView; onView: (v: CreationView) => void;
  messages: Message[]; signal: SignalStatus;
}) {
  const artifacts = messages.filter(m => m.role === "assistant" && m.content.length > 0).slice().reverse().slice(0, 5);

  return (
    <>
      <section className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Navigate</SectionLabel>
        <div className="space-y-0.5">
          <NavItem label="Chat"    active={activeView === "chat"}     onClick={() => onView("chat")}     icon={<IconChat />} />
          <NavItem label="Build"   active={activeView === "terminal"} onClick={() => onView("terminal")} icon={<IconTerminal />} />
          <NavItem label="Archive" active={activeView === "archive"}  onClick={() => onView("archive")}  icon={<IconArchive />} />
        </div>
      </section>

      <section className="px-3 pt-3 pb-2 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Artifacts</SectionLabel>
        {artifacts.length === 0 ? (
          <p className="text-[10px] px-0.5" style={{ color: "var(--r-dim)" }}>No artifacts yet</p>
        ) : (
          <ul className="space-y-0.5">
            {artifacts.map((m) => (
              <li
                key={m.id}
                className="text-[10px] px-2 py-1 rounded truncate cursor-default"
                style={{ color: "var(--r-subtext)" }}
                title={m.content}
              >
                {m.content.slice(0, 36)}{m.content.length > 36 ? "…" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-3 pt-3 pb-2">
        <SectionLabel>Forge</SectionLabel>
        <div className="flex items-center gap-2 px-0.5">
          <StatusDot status={signal} />
          <span className="text-[10px] capitalize" style={{ color: "var(--r-subtext)" }}>{signal}</span>
        </div>
        <SignalMeta label="outputs" value={String(artifacts.length)} />
      </section>
    </>
  );
}

/* ── ShellSideRail ────────────────────────────────────────────────── */

export function ShellSideRail({
  activeTab, messages, signals,
  labView, schoolView, creationView,
  onLabView, onSchoolView, onCreationView,
  onNewNote, onClearTab,
  navigate: _navigate,
}: ShellSideRailProps) {
  return (
    <aside
      className="w-52 shrink-0 border-r flex flex-col overflow-hidden"
      style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-rail)" }}
    >
      {/* Chamber header */}
      <div
        className="px-4 pt-3 pb-2 flex items-center justify-between border-b"
        style={{ borderColor: "var(--r-border)" }}
      >
        <span
          className="text-[9px] uppercase tracking-widest font-bold"
          style={{ color: "var(--r-accent)" }}
        >
          {activeTab}
        </span>
        <button
          onClick={onNewNote}
          className="text-[9px] font-mono transition-colors duration-150"
          style={{ color: "var(--r-dim)" }}
          title="New floating note"
        >
          + note
        </button>
      </div>

      {/* Chamber-specific nav */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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

      {/* Cross-tab session summary */}
      <div className="px-3 pt-2 pb-2 border-t" style={{ borderColor: "var(--r-border-soft)" }}>
        <SectionLabel>Sessions</SectionLabel>
        <ul>
          {ALL_TABS.map((tab) => {
            const count    = messages[tab].filter((m) => m.role === "assistant" && m.content.length > 0).length;
            const isActive = tab === activeTab;
            return (
              <li
                key={tab}
                className="group flex items-center justify-between h-6 px-1 rounded text-[10px]"
                style={{ color: isActive ? "var(--r-text)" : "var(--r-subtext)" }}
              >
                <span className="capitalize" style={{ fontWeight: isActive ? 500 : 400 }}>{tab}</span>
                <span className="flex items-center gap-1.5">
                  <span style={{ color: isActive ? "var(--r-accent)" : "var(--r-dim)", fontFamily: "monospace" }}>
                    {count > 0 ? count : "—"}
                  </span>
                  {count > 0 && (
                    <button
                      onClick={() => onClearTab(tab)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                      style={{ color: "var(--r-dim)" }}
                      title={`Clear ${tab}`}
                      aria-label={`Clear ${tab} session`}
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mode footer */}
      <div className="px-4 py-2 border-t" style={{ borderColor: "var(--r-border-soft)" }}>
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "var(--r-dim)" }}>
          mode · <span style={{ color: "var(--r-accent)" }}>{activeTab}</span>
        </span>
      </div>
    </aside>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────── */

function IconChat() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 1h10v7H7l-3 2.5V8H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconAnalysis() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 10l3-4 2.5 2L9 4l2 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCode() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 3.5L1 6l2.5 2.5M8.5 3.5L11 6l-2.5 2.5M6.5 2.5l-1 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArchive() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 4v6.5h9V4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M4.5 7h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function IconLibrary() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 2h2v8H1zM5 2h2v8H5zM9 2l2 1v7l-2-1V2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function IconTerminal() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1.5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 5l2 1.5L3 8M6.5 8h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
