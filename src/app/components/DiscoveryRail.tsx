/**
 * RUBERRA Discovery Rail
 * Horizontal scrollable content rail with label + optional CTA.
 */

import React, { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { R } from "./tokens";
import { RLabel } from "./shared";

interface DiscoveryRailProps {
  label: string; sublabel?: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode; gap?: number;
}

export function DiscoveryRail({ label, sublabel, action, children, gap = 10 }: DiscoveryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingLeft: "28px", paddingRight: "28px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <RLabel>{label}</RLabel>
          {sublabel && <span style={{ ...R.t.micro, color: R.ink5, fontFamily: "'Inter', sans-serif" }}>{sublabel}</span>}
        </div>
        {action && (
          <button onClick={action.onClick} style={{ display: "flex", alignItems: "center", gap: "3px", border: "none", background: "transparent", cursor: "pointer", ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif", outline: "none", padding: "2px 0", transition: "color 0.12s ease" }} className="hover:text-[#383835]">
            {action.label}<ChevronRight size={10} strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div ref={scrollRef} style={{ display: "flex", gap: `${gap}px`, overflowX: "auto", paddingLeft: "28px", paddingRight: "28px", paddingBottom: "4px", scrollbarWidth: "none", msOverflowStyle: "none" }} className="hide-scrollbar">
        {children}
      </div>
    </div>
  );
}

interface FeaturedHeroProps {
  label: string; title: string; description: string; meta: string;
  accent: string; accentLight: string; ctaLabel: string; onCta: () => void;
  secondaryLabel?: string; onSecondary?: () => void; badge?: string;
  stats?: { label: string; value: string }[];
}

export function FeaturedHero({ label, title, description, meta, accent, accentLight, ctaLabel, onCta, secondaryLabel, onSecondary, badge, stats }: FeaturedHeroProps) {
  return (
    <div style={{ margin: "0 28px 32px", borderRadius: "14px", border: `1px solid ${R.hairline}`, background: R.surface, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: R.shadow.sm }}>
      <div style={{ height: "120px", background: accentLight, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${accent}12 1px, transparent 1px), linear-gradient(90deg, ${accent}12 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: `${accent}10`, border: `1px solid ${accent}18` }} />
        <div style={{ position: "absolute", right: "20px", top: "20px", width: "80px", height: "80px", borderRadius: "50%", background: `${accent}14`, border: `1px solid ${accent}20` }} />
        {badge && <div style={{ position: "absolute", top: "14px", left: "18px", padding: "3px 9px", borderRadius: R.r.pill, background: `${accent}20`, border: `1px solid ${accent}30`, ...R.t.label, color: accent, fontFamily: "'Inter', sans-serif" }}>{badge}</div>}
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...R.t.label, color: accent, fontFamily: "'Inter', sans-serif", marginBottom: "5px" }}>{label}</p>
            <h3 style={{ ...R.t.title, color: R.ink, fontFamily: "'Inter', sans-serif", marginBottom: "6px", fontWeight: 500 }}>{title}</h3>
            <p style={{ ...R.t.meta, color: R.ink4, fontFamily: "'Inter', sans-serif", lineHeight: "1.55", marginBottom: "14px", maxWidth: "480px" }}>{description}</p>
            <p style={{ ...R.t.micro, color: R.ink5, fontFamily: "'Inter', sans-serif", marginBottom: "14px" }}>{meta}</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={onCta} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: R.r.lg, border: "none", background: R.ink, color: R.shell, ...R.t.uiMed, cursor: "pointer", fontFamily: "'Inter', sans-serif", outline: "none", transition: "opacity 0.12s ease" }} className="hover:opacity-80">
                {ctaLabel}<ChevronRight size={12} strokeWidth={2} />
              </button>
              {secondaryLabel && onSecondary && <button onClick={onSecondary} style={{ padding: "8px 14px", borderRadius: R.r.lg, border: `1px solid ${R.hairline}`, background: "transparent", ...R.t.ui, color: R.ink3, cursor: "pointer", fontFamily: "'Inter', sans-serif", outline: "none" }} className="hover:bg-[#F0EDE7]">{secondaryLabel}</button>}
            </div>
          </div>
          {stats && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0, paddingLeft: "20px", borderLeft: `1px solid ${R.hairline}` }}>
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: R.ink, fontFamily: "'Inter', sans-serif", lineHeight: 1, marginBottom: "2px", letterSpacing: "-0.02em" }}>{s.value}</p>
                  <p style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
