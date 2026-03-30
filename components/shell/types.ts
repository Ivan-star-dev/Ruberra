import { type Tab } from "./TabSwitcher";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  tab: Tab;
  timestamp: number;
  streaming?: boolean;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";

export interface Signal {
  status: SignalStatus;
  label: string;
  tab: Tab | null;
}
export type Tab = "lab" | "school" | "creation";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";
