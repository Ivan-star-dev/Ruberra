export type Tab = "lab" | "school" | "creation";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type SignalStatus = "idle" | "streaming" | "completed" | "error";
