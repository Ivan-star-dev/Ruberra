export type Tab = "lab" | "school" | "creation";

export type BlockType = "verdict" | "execution" | "lesson" | "creation" | "report" | "signal";

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

export interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: number;
  blocks?:   MessageBlock[];
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";
