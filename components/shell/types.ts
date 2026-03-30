export type Tab = "lab" | "school" | "creation";

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  tab:       Tab;
  timestamp: number;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";

/* Chamber-specific views wired in the left rail */
export type LabView      = "chat" | "analysis" | "code" | "archive";
export type SchoolView   = "chat" | "library"  | "archive";
export type CreationView = "chat" | "terminal" | "archive";

export type ChamberView = LabView | SchoolView | CreationView;

/* Floating note pinned to screen */
export interface FloatingNote {
  id:        string;
  content:   string;
  tab:       Tab;
  pinned:    boolean;
  x:         number;
  y:         number;
  timestamp: number;
}

/* App-wide theme */
export type Theme = "dark" | "light";
