"use client";

import { type Tab, type LabView, type SchoolView, type CreationView } from "./types";

interface SideRailProps {
  activeTab:      Tab;
  labView:        LabView;
  schoolView:     SchoolView;
  creationView:   CreationView;
  onLabView:      (v: LabView) => void;
  onSchoolView:   (v: SchoolView) => void;
  onCreationView: (v: CreationView) => void;
  onNewNote:      () => void;
}

/* Rail item with icon + optional active indicator */
function RailItem({
  icon,
  label,
  active,
  onClick,
  muted,
}: {
  icon:    React.ReactNode;
  label:   string;
  active:  boolean;
  onClick: () => void;
  muted?:  boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center justify-center transition-colors duration-150 relative"
      style={{
        width:           "56px",
        height:          "44px",
        color:           active ? "var(--r-text)" : muted ? "var(--r-muted)" : "var(--r-dim)",
        backgroundColor: active ? "var(--r-border-soft)" : "transparent",
      }}
    >
      {/* Active left accent line */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2"
          style={{
            width:           "2px",
            height:          "18px",
            backgroundColor: "var(--r-text)",
            borderRadius:    "0 2px 2px 0",
          }}
        />
      )}
      {icon}
    </button>
  );
}

function Spacer() {
  return <div className="flex-1" />;
}

function RailDivider() {
  return (
    <div
      className="mx-auto"
      style={{
        width:           "24px",
        height:          "1px",
        backgroundColor: "var(--r-border)",
        margin:          "4px auto",
      }}
    />
  );
}

export default function SideRail({
  activeTab, labView, schoolView, creationView,
  onLabView, onSchoolView, onCreationView, onNewNote,
}: SideRailProps) {

  /* Determine which view is active for current tab */
  const isActive = (id: string) => {
    if (activeTab === "lab") return labView === id;
    if (activeTab === "school") return schoolView === id;
    if (activeTab === "creation") return creationView === id;
    return false;
  };

  return (
    <aside
      className="shrink-0 border-r flex flex-col items-center"
      style={{
        width:           "56px",
        borderColor:     "var(--r-border)",
        backgroundColor: "var(--r-surface)",
      }}
    >
      {/* Top group — navigation icons */}
      <div className="flex flex-col items-center w-full pt-2">

        {/* Browse / discover */}
        <RailItem
          label="Browse"
          active={
            (activeTab === "lab" && labView === "browse") ||
            (activeTab === "school" && schoolView === "browse") ||
            (activeTab === "creation" && creationView === "browse")
          }
          onClick={() => {
            if (activeTab === "lab") onLabView("browse");
            else if (activeTab === "school") onSchoolView("browse");
            else onCreationView("browse");
          }}
          icon={<IcBrowse />}
        />

        {/* Chat / home */}
        <RailItem
          label="Chat"
          active={
            (activeTab === "lab" && labView === "home") ||
            (activeTab === "school" && schoolView === "curriculum") ||
            (activeTab === "creation" && creationView === "create")
          }
          onClick={() => {
            if (activeTab === "lab") onLabView("home");
            else if (activeTab === "school") onSchoolView("curriculum");
            else onCreationView("create");
          }}
          icon={<IcMessage />}
        />

        {/* Context-specific icons */}
        {activeTab === "lab" && (
          <>
            <RailItem label="Research" active={labView === "research"} onClick={() => onLabView("research")} icon={<IcSearch />} />
            <RailItem label="Analysis" active={labView === "analysis"} onClick={() => onLabView("analysis")} icon={<IcChart />} />
            <RailItem label="Code" active={labView === "code"} onClick={() => onLabView("code")} icon={<IcCode />} />
          </>
        )}

        {activeTab === "school" && (
          <>
            <RailItem label="Curriculum" active={schoolView === "lesson"} onClick={() => onSchoolView("lesson")} icon={<IcBook />} />
          </>
        )}

        {activeTab === "creation" && (
          <>
            <RailItem label="Outputs" active={false} onClick={() => {}} icon={<IcLayers />} />
            <RailItem label="Parameters" active={false} onClick={() => {}} icon={<IcSliders />} />
          </>
        )}

        <RailDivider />

        {/* Notes */}
        <RailItem label="Notes" active={false} onClick={onNewNote} icon={<IcPin />} />

        {/* Archive */}
        <RailItem label="Archive" active={
          (activeTab === "lab" && labView === "general") ||
          (activeTab === "school" && schoolView === "archive") ||
          (activeTab === "creation" && creationView === "archive")
        } onClick={() => {
          if (activeTab === "lab") onLabView("general");
          else if (activeTab === "school") onSchoolView("archive");
          else onCreationView("archive");
        }} icon={<IcArchive />} />

        <RailItem label="Analytics" active={false} onClick={() => {}} icon={<IcAnalytics />} />
      </div>

      <Spacer />

      {/* Bottom group */}
      <div className="flex flex-col items-center w-full pb-3">
        <RailDivider />
        <RailItem label="More" active={false} muted onClick={() => {}} icon={<IcDots />} />
        <RailItem label="Settings" active={false} onClick={() => {}} icon={<IcSettings />} />
      </div>
    </aside>
  );
}

/* ── Icons — 18px, clean strokes ──────────────────────────── */

function IcBrowse() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IcMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M17 3H3v11h5l2 3 2-3h5V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function IcSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IcChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 15l4-5 3 3 3-6 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M7 6L3 10l4 4M13 6l4 4-4 4M11 4l-2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 8h14M7 8v9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IcLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 3l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2 11l8 4 8-4M2 15l8 4 8-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IcSliders() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="5" r="2" fill="var(--r-surface)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="10" r="2" fill="var(--r-surface)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="15" r="2" fill="var(--r-surface)" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function IcPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3L7 10 3 7h5L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function IcArchive() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 7v9a1 1 0 001 1h12a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IcAnalytics() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 16V9M8 16V6M12 16V11M16 16V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IcDots() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IcSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
