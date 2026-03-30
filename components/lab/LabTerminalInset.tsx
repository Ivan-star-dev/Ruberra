"use client";

import { useMemo } from "react";
import { type Message } from "../shell/types";

/**
 * LabTerminalInset — a contained terminal-regime surface rendered only inside
 * the Lab tab as a verdict / status / diagnostic inset between the message
 * thread and the input bar.
 *
 * Terminal law:
 *   - warm charcoal ground (--rt-bg / --rt-surface), never black
 *   - mono-first typography
 *   - copper/amber accent system (--rt-copper / --rt-amber)
 *   - dashed grouping borders, no rounded-xl grammar
 *   - zero regime bleed: no rt-* tokens outside this file
 */

interface LabTerminalInsetProps {
  messages:   Message[];
  execStatus: "idle" | "thinking" | "streaming";
}

interface DiagLine {
  kind:  "verdict" | "status" | "diagnostic" | "separator";
  label: string;
  value: string;
}

function deriveLines(messages: Message[], execStatus: string): DiagLine[] {
  const assistantMessages = messages.filter(
    (m) => m.role === "assistant" && m.content.length > 0
  );
  const userMessages = messages.filter((m) => m.role === "user");

  const lines: DiagLine[] = [];

  // Session status block
  lines.push({ kind: "separator", label: "session", value: "" });
  lines.push({
    kind:  "status",
    label: "kernel",
    value: execStatus === "idle" ? "ready" : execStatus === "thinking" ? "reasoning" : "streaming",
  });
  lines.push({
    kind:  "status",
    label: "exchanges",
    value: String(assistantMessages.length),
  });
  lines.push({
    kind:  "status",
    label: "queries",
    value: String(userMessages.length),
  });

  // Verdict block — appears once there is at least one assistant response
  if (assistantMessages.length > 0) {
    const last = assistantMessages[assistantMessages.length - 1];
    const wordCount = last.content.trim().split(/\s+/).length;
    const hasCode = last.content.includes("```") || last.content.includes("    ");

    lines.push({ kind: "separator", label: "last response", value: "" });
    lines.push({
      kind:  "verdict",
      label: "length",
      value: `${wordCount}w`,
    });
    lines.push({
      kind:  "diagnostic",
      label: "type",
      value: hasCode ? "code+prose" : "prose",
    });
    lines.push({
      kind:  "diagnostic",
      label: "elapsed",
      value: `${((Date.now() - last.timestamp) / 1000).toFixed(1)}s ago`,
    });
  }

  // Diagnostic block — mode signature
  lines.push({ kind: "separator", label: "context", value: "" });
  lines.push({ kind: "diagnostic", label: "regime",  value: "lab" });
  lines.push({ kind: "diagnostic", label: "surface",  value: "terminal-inset" });

  return lines;
}

export default function LabTerminalInset({ messages, execStatus }: LabTerminalInsetProps) {
  const lines = useMemo(
    () => deriveLines(messages, execStatus),
    [messages, execStatus]
  );

  const hasData = messages.length > 0;

  if (!hasData && execStatus === "idle") {
    return (
      <div
        className="mx-6 mb-3 border border-dashed font-mono"
        style={{
          borderColor: "var(--rt-border-dash)",
          backgroundColor: "var(--rt-bg)",
          color: "var(--rt-subtext)",
        }}
      >
        <div className="px-4 py-2 flex items-center gap-3 border-b border-dashed" style={{ borderColor: "var(--rt-border-dash)" }}>
          <TerminalGlyph />
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rt-dim)" }}>
            lab · terminal
          </span>
          <span className="ml-auto text-[10px]" style={{ color: "var(--rt-dim)" }}>
            kernel idle
          </span>
        </div>
        <div className="px-4 py-2 text-[10px]">
          <span style={{ color: "var(--rt-dim)" }}>›</span>
          <span className="ml-2" style={{ color: "var(--rt-subtext)" }}>
            awaiting first query
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-6 mb-3 border border-dashed font-mono text-[10px]"
      style={{
        borderColor: "var(--rt-border-dash)",
        backgroundColor: "var(--rt-bg)",
        color: "var(--rt-text)",
      }}
    >
      {/* Inset header bar */}
      <div
        className="px-4 py-1.5 flex items-center gap-3 border-b border-dashed"
        style={{ borderColor: "var(--rt-border-dash)", backgroundColor: "var(--rt-surface)" }}
      >
        <TerminalGlyph active={execStatus !== "idle"} />
        <span className="uppercase tracking-widest" style={{ color: "var(--rt-amber)" }}>
          lab · terminal
        </span>
        <KernelPulse status={execStatus} />
      </div>

      {/* Diagnostic lines */}
      <div className="px-4 py-2 space-y-0.5">
        {lines.map((line, idx) => {
          if (line.kind === "separator") {
            return (
              <div key={idx} className="pt-1.5 pb-0.5 first:pt-0">
                <span className="uppercase tracking-widest text-[9px]" style={{ color: "var(--rt-copper)" }}>
                  ── {line.label}
                </span>
              </div>
            );
          }
          return (
            <div key={idx} className="flex items-baseline gap-2">
              <span style={{ color: "var(--rt-dim)" }}>›</span>
              <span className="w-20 shrink-0" style={{ color: "var(--rt-subtext)" }}>
                {line.label}
              </span>
              <span
                style={{
                  color:
                    line.kind === "verdict"
                      ? "var(--rt-amber-glow)"
                      : line.kind === "status"
                      ? statusColor(line.value)
                      : "var(--rt-text)",
                }}
              >
                {line.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function statusColor(value: string): string {
  if (value === "ready")     return "var(--rt-ok)";
  if (value === "streaming") return "var(--rt-amber)";
  if (value === "reasoning") return "var(--rt-amber-glow)";
  if (value === "error")     return "var(--rt-err)";
  return "var(--rt-text)";
}

function TerminalGlyph({ active = false }: { active?: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ color: active ? "var(--rt-amber)" : "var(--rt-dim)" }}
    >
      <path
        d="M1 3l3 2-3 2M5.5 7h3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KernelPulse({ status }: { status: "idle" | "thinking" | "streaming" }) {
  if (status === "idle") {
    return (
      <span className="ml-auto text-[10px]" style={{ color: "var(--rt-dim)" }}>
        ready
      </span>
    );
  }
  return (
    <span className="ml-auto flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--rt-amber)" }}
      />
      <span className="text-[10px]" style={{ color: "var(--rt-amber)" }}>
        {status}
      </span>
    </span>
  );
}
