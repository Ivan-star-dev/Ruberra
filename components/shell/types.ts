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
