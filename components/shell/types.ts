// RUBERRA — canonical shell types
// Single source of truth for all shell components.

export type Tab = "lab" | "school" | "creation";

export type SignalStatus = "idle" | "streaming" | "completed" | "error";

export type Theme = "dark" | "light";

// ── Block system ──────────────────────────────────────────────────────────

export type BlockType =
  | "verdict"
  | "execution"
  | "lesson"
  | "creation"
  | "report"
  | "signal";

export type StatusFlag =
  | "pass"
  | "partial"
  | "fail"
  | "live"
  | "done"
  | "warn"
  | "skip"
  | "running"
  | "pending"
  | "locked"
  | "current";

export interface BlockItem {
  label:   string;
  value?:  string;
  status?: StatusFlag;
}

export interface BlockSection {
  heading: string;
  items:   BlockItem[];
}

export interface MessageBlock {
  type:     BlockType;
  title?:   string;
  status?:  StatusFlag;
  sections: BlockSection[];
  meta?: {
    next?:     string;
    tags?:     string[];
    progress?: string;
  };
}

// ── Message ─────────────────────────────────────────────────────────────

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  tab:       Tab;
  timestamp: number;
  blocks?:   MessageBlock[];
}

// ── Chamber views ────────────────────────────────────────────────────────

export type LabView      = "chat" | "analysis" | "code" | "archive";
export type SchoolView   = "chat" | "library"  | "archive";
export type CreationView = "chat" | "terminal" | "archive";
export type ChamberView  = LabView | SchoolView | CreationView;

/** Navigation function — the core of the product connectivity system */
export type NavFn = (tab: Tab, view: string, id?: string) => void;

// ── Floating notes ───────────────────────────────────────────────────────

export interface FloatingNote {
  id:        string;
  content:   string;
  tab:       Tab;
  pinned:    boolean;
  x:         number;
  y:         number;
  timestamp: number;
}
