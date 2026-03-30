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

// Chamber-level context passed from SideRail → RuberraShell → API
export interface ChamberContext {
  // Lab
  labSection?: string;
  // School
  schoolModule?: string;
  // Creation
  creationOutputType?: string;
  creationTone?: string;
  creationLength?: string;
}
