export type Tab = "lab" | "school" | "creation";

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  tab:       Tab;
  timestamp: number;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";

/* Lab views */
export type LabView = "home" | "research" | "analysis" | "code" | "general";

/* School views */
export type SchoolView = "curriculum" | "lesson" | "archive";

/* Creation views */
export type CreationView = "create" | "archive";

/* Creation output types (left panel) */
export type OutputType = "prose" | "visual" | "code" | "document" | "voice";

/* Creation parameters */
export interface CreationParams {
  outputType: OutputType;
  tone:       "precise" | "neutral" | "expressive" | "formal";
  length:     "brief" | "standard" | "extended";
  audience:   "expert" | "general" | "executive";
}

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

/* Theme */
export type Theme = "light" | "dark";

/* Session stats */
export interface SessionStats {
  latencyMs: number;
  model:     string;
  context:   string;
  date:      string;
}
