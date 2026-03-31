// Prototype stub — not part of the Next.js app build

import type React from "react";
import { type Message } from "./shell-types";

export interface ChamberConfig {
  id:          string;
  label:       string;
  tagline:     string;
  placeholder: string;
  accent:      string;
  glyph?:      React.ReactNode;
}

export function ChamberChat(_props: {
  messages:       Message[];
  isLoading:      boolean;
  draft:          string;
  onDraftChange:  (t: string) => void;
  onSend:         (t: string) => void;
  onCancel:       () => void;
  config:         ChamberConfig;
}) {
  return null;
}

export function LabGlyph() {
  return null;
}
