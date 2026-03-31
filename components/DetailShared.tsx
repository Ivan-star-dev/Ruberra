/**
 * RUBERRA Detail Views — shared primitives
 */
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type Tab, type NavFn } from "@/components/shell/types";

export function Breadcrumb({ items, onNavigate }: { items: { label: string; tab: Tab; view: string; id?: string }[]; onNavigate: NavFn; }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "22px" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {i > 0 && <span style={{ fontSize: "10px", color: "var(--r-dim)", userSelect: "none" }}>›</span>}
          <button onClick={() => onNavigate(item.tab, item.view, item.id)} style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.06em", textTransform: "uppercase", color: i === items.length - 1 ? "var(--r-subtext)" : "var(--r-dim)", background: "transparent", border: "none", cursor: i === items.length - 1 ? "default" : "pointer", outline: "none", padding: "0", pointerEvents: i === items.length - 1 ? "none" : "auto" }}>{item.label}</button>
        </span>
      ))}
    </div>
  );
}

export function XChamberLink({ chamber, label, title, subtitle, navigate, tab, view, id }: { chamber: "lab" | "school" | "creation"; label: string; title: string; subtitle: string; navigate: NavFn; tab: Tab; view: string; id?: string; }) {
  const accentMap = { lab: { color: "var(--r-accent)", bg: "var(--r-accent-dim)" }, school: { color: "var(--r-ok)", bg: "color-mix(in srgb, var(--r-ok) 10%, var(--r-surface))" }, creation: { color: "var(--r-warn)", bg: "color-mix(in srgb, var(--r-warn) 10%, var(--r-surface))" } };
  const accent = accentMap[chamber];
  return (
    <button onClick={() => navigate(tab, view, id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 12px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", cursor: "pointer", outline: "none", textAlign: "left", transition: "background 0.1s ease", gap: "10px" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <span style={{ fontSize: "8px", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: accent.color, background: accent.bg, padding: "2px 6px", borderRadius: "3px", flexShrink: 0 }}>{label}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--r-text)", fontFamily: "'Inter', system-ui, sans-serif", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
          <p style={{ fontSize: "10px", color: "var(--r-subtext)", fontFamily: "'Inter', system-ui, sans-serif", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</p>
        </div>
      </div>
      <ArrowRight size={10} color="var(--r-dim)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
    </button>
  );
}

export function SectionHead({ label, count }: { label: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
      <p style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--r-dim)", margin: 0 }}>{label}</p>
      {count !== undefined && <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)" }}>{count}</span>}
    </div>
  );
}

export function Tag({ label, color }: { label: string; color?: string }) {
  return <span style={{ fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", color: color ?? "var(--r-subtext)", background: "var(--r-rail)", border: "1px solid var(--r-border)", padding: "2px 7px", borderRadius: "3px" }}>{label}</span>;
}

export function PrimaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "6px", border: "none", background: "var(--r-text)", color: "white", cursor: "pointer", outline: "none", fontSize: "11px", fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 500, letterSpacing: "-0.01em", transition: "opacity 0.15s ease", flexShrink: 0 }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
      {label}<ArrowRight size={10} strokeWidth={1.8} />
    </button>
  );
}

export function SecondaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "6px", border: "1px solid var(--r-border)", background: "transparent", color: "var(--r-subtext)", cursor: "pointer", outline: "none", fontSize: "11px", fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.1s ease", flexShrink: 0 }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-rail)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      {label}
    </button>
  );
}

export function DetailPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--r-bg)", padding: "28px 0 48px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </div>
  );
}
