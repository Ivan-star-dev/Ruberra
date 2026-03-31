/**
 * RUBERRA Shared Components
 * Atomic primitives shared across all three chambers.
 */

import React from "react";
import { R } from "@/lib/tokens";

export function RLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ display: "block", ...R.t.label, color: R.ink4, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif", ...style }}>
      {children}
    </span>
  );
}

export function RIconButton({ title, onClick, children, active = false, size = 30, style, className }: {
  title?: string; onClick?: () => void; children: React.ReactNode;
  active?: boolean; size?: number; style?: React.CSSProperties; className?: string;
}) {
  return (
    <button title={title} onClick={onClick} style={{ width: `${size}px`, height: `${size}px`, borderRadius: R.r.lg, border: `1px solid ${active ? R.strong : R.hairline}`, background: active ? R.selected : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none", transition: "background 0.12s ease, border-color 0.12s ease", flexShrink: 0, ...style }} className={className || "hover:bg-[#F0EDE7]"}>
      {children}
    </button>
  );
}

export function RChip({ label, active = false, onClick, accent }: { label: string; active?: boolean; onClick?: () => void; accent?: string; }) {
  return (
    <button onClick={onClick} style={{ padding: "3px 10px", borderRadius: R.r.sm, border: `1px solid ${active ? R.strong : R.hairline}`, background: active ? R.selected : "transparent", ...R.t.ui, fontWeight: active ? 500 : 400, color: active ? (accent || R.ink) : R.ink3, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.12s ease", outline: "none", whiteSpace: "nowrap" as const }}>
      {label}
    </button>
  );
}

export function RDivider({ vertical = false, style }: { vertical?: boolean; style?: React.CSSProperties }) {
  return <div style={{ background: R.hairline, ...(vertical ? { width: "1px", alignSelf: "stretch" } : { height: "1px", width: "100%" }), flexShrink: 0, ...style }} />;
}

export function RProgress({ value, color = R.ink, height = 2 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ height: `${height}px`, background: R.hairline, borderRadius: "2px", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </div>
  );
}
