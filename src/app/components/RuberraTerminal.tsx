// Prototype stub — not part of the Next.js app build

import { type Message } from "./shell-types";

export function RuberraTerminal(_props: {
  messages:       Message[];
  isLoading:      boolean;
  draft:          string;
  onDraftChange:  (t: string) => void;
  onSend:         (t: string) => void;
  onCancel:       () => void;
  chamberLabel:   string;
  placeholder:    string;
}) {
  return null;
}
