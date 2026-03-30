export type Tab = "lab" | "school" | "creation";

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  tab:       Tab;
  timestamp: number;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";

/* Chamber-specific views */
export type LabView      = "chat" | "research" | "code" | "analysis" | "summary" | "archive";
export type SchoolView   = "chat" | "library"  | "archive";
export type CreationView = "chat" | "terminal" | "archive";

export type ChamberView = LabView | SchoolView | CreationView;

/* Floating note */
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

/* Session stats passed to the status bar */
export interface SessionStats {
  latencyMs: number;
  model:     string;
  context:   string;
  date:      string;
}
