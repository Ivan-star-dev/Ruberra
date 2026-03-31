/**
 * RUBERRA Content Card System
 * Modular card families for all three chambers.
 */

import React from "react";
import { ChevronRight, Clock, BookOpen, Layers, Zap, BarChart2, Lock } from "lucide-react";
import { R } from "./tokens";

interface CardVisualProps { accent: string; accentLight: string; icon?: React.ReactNode; size?: "sm" | "md" | "lg"; pattern?: "grid" | "lines" | "dots" | "solid"; }

export function CardVisual({ accent, accentLight, icon, size = "md", pattern = "solid" }: CardVisualProps) {
  const heights = { sm: "80px", md: "108px", lg: "140px" };
  return (
    <div style={{ width: "100%", height: heights[size], background: accentLight, borderRadius: `${R.r.lg} ${R.r.lg} 0 0`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      {pattern === "grid" && <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${accent}18 1px, transparent 1px), linear-gradient(90deg, ${accent}18 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />}
      {pattern === "lines" && <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 6px, ${accent}12 6px, ${accent}12 7px)` }} />}
      {pattern === "dots" && <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${accent}20 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "48px", height: "48px", background: `${accent}14`, borderRadius: "48px 0 0 0" }} />
      {icon && <div style={{ position: "relative", zIndex: 1, width: "32px", height: "32px", borderRadius: "8px", background: `${accent}22`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>}
    </div>
  );
}

export function CardShell({ onClick, children, width = 220, style }: { onClick?: () => void; children: React.ReactNode; width?: number | string; style?: React.CSSProperties; }) {
  return (
    <div onClick={onClick} style={{ width: typeof width === "number" ? `${width}px` : width, flexShrink: 0, borderRadius: R.r.xl, border: `1px solid ${R.hairline}`, background: R.surface, cursor: onClick ? "pointer" : "default", overflow: "hidden", transition: "border-color 0.15s ease, box-shadow 0.15s ease", display: "flex", flexDirection: "column", ...style }} className={onClick ? "hover:border-[#D0CEC8] hover:shadow-md" : ""}>
      {children}
    </div>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>;
}

export function CardTag({ label, color }: { label: string; color: string }) {
  return <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: R.r.sm, background: `${color}18`, border: `1px solid ${color}28`, ...R.t.label, color, fontFamily: "'Inter', sans-serif", marginBottom: "7px", textTransform: "uppercase" }}>{label}</span>;
}

export function CardTitle({ children, lines = 2 }: { children: React.ReactNode; lines?: number; }) {
  return <p style={{ ...R.t.uiMed, color: R.ink, fontFamily: "'Inter', sans-serif", lineHeight: "1.4", marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{children}</p>;
}

export function CardMeta({ items }: { items: { icon?: React.ReactNode; label: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ width: "2px", height: "2px", borderRadius: "50%", background: R.ink5, flexShrink: 0 }} />}
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            {item.icon}
            <span style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export function CardProgress({ value, color, label }: { value: number; color: string; label?: string; }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ height: "2px", background: R.hairline, borderRadius: "2px", overflow: "hidden", marginBottom: label ? "4px" : "0" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px" }} />
      </div>
      {label && <span style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{label}</span>}
    </div>
  );
}

export function CourseCard({ title, type, lessons, duration, level, progress, locked, onClick, pattern = "grid" }: {
  title: string; type: string; lessons: number; duration: string; level: string;
  progress?: number; locked?: boolean; onClick?: () => void; pattern?: "grid" | "lines" | "dots" | "solid";
}) {
  return (
    <CardShell onClick={!locked ? onClick : undefined} width={220}>
      <CardVisual accent={R.school} accentLight={R.schoolLight} pattern={pattern} icon={locked ? <Lock size={14} color={R.school} strokeWidth={1.5} /> : <BookOpen size={14} color={R.school} strokeWidth={1.5} />} size="md" />
      <CardBody>
        <CardTag label={type} color={R.school} />
        <CardTitle>{title}</CardTitle>
        <CardMeta items={[{ icon: <Layers size={9} color={R.ink5} strokeWidth={1.5} />, label: `${lessons} lessons` }, { icon: <Clock size={9} color={R.ink5} strokeWidth={1.5} />, label: duration }, { label: level }]} />
        {progress !== undefined && <CardProgress value={progress} color={R.school} label={progress > 0 ? `${progress}% complete` : "Not started"} />}
      </CardBody>
    </CardShell>
  );
}

export function ExperimentCard({ title, type, domain, tools, complexity, onClick, pattern = "dots" }: {
  title: string; type: string; domain: string; tools: string[]; complexity: "Low" | "Medium" | "High"; onClick?: () => void; pattern?: "grid" | "lines" | "dots" | "solid";
}) {
  const complexityColor = complexity === "High" ? "#8A6238" : complexity === "Medium" ? R.lab : R.ink4;
  return (
    <CardShell onClick={onClick} width={220}>
      <CardVisual accent={R.lab} accentLight={R.labLight} pattern={pattern} icon={<BarChart2 size={14} color={R.lab} strokeWidth={1.5} />} size="md" />
      <CardBody>
        <CardTag label={type} color={R.lab} />
        <CardTitle>{title}</CardTitle>
        <div style={{ marginBottom: "8px" }}><span style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{domain}</span></div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "auto" }}>
          {tools.map((t) => <span key={t} style={{ padding: "1px 6px", borderRadius: R.r.sm, border: `1px solid ${R.hairline}`, background: R.ground, ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{t}</span>)}
          <span style={{ padding: "1px 6px", borderRadius: R.r.sm, border: `1px solid ${complexityColor}28`, background: `${complexityColor}10`, ...R.t.micro, color: complexityColor, fontFamily: "'Inter', sans-serif", marginLeft: "auto" }}>{complexity}</span>
        </div>
      </CardBody>
    </CardShell>
  );
}

export function BlueprintCard({ title, type, outputType, description, tags, onClick, pattern = "lines" }: {
  title: string; type: string; outputType: string; description: string; tags: string[]; onClick?: () => void; pattern?: "grid" | "lines" | "dots" | "solid";
}) {
  return (
    <CardShell onClick={onClick} width={220}>
      <CardVisual accent={R.creation} accentLight={R.creationLight} pattern={pattern} icon={<Zap size={14} color={R.creation} strokeWidth={1.5} />} size="md" />
      <CardBody>
        <CardTag label={type} color={R.creation} />
        <CardTitle>{title}</CardTitle>
        <p style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif", lineHeight: "1.5", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</p>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "auto" }}>
          {tags.map((t) => <span key={t} style={{ padding: "1px 6px", borderRadius: R.r.sm, border: `1px solid ${R.hairline}`, background: R.ground, ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{t}</span>)}
        </div>
      </CardBody>
    </CardShell>
  );
}

export function CollectionCard({ title, subtitle, itemCount, accent, accentLight, tag, icon, onClick }: {
  title: string; subtitle: string; itemCount: number; accent: string; accentLight: string; tag: string; icon: React.ReactNode; onClick?: () => void;
}) {
  return (
    <CardShell onClick={onClick} width={280}>
      <CardVisual accent={accent} accentLight={accentLight} pattern="grid" icon={icon} size="sm" />
      <CardBody>
        <CardTag label={tag} color={accent} />
        <CardTitle lines={1}>{title}</CardTitle>
        <p style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif", marginBottom: "8px" }}>{subtitle}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{itemCount} items</span>
          <div style={{ display: "flex", alignItems: "center", gap: "3px", ...R.t.micro, color: accent, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            Explore <ChevronRight size={10} color={accent} strokeWidth={2} />
          </div>
        </div>
      </CardBody>
    </CardShell>
  );
}

export function RoleCard({ role, domain, skills, demand, onClick }: {
  role: string; domain: string; skills: string[]; demand: "Emerging" | "High" | "Critical"; onClick?: () => void;
}) {
  const demandColor = demand === "Critical" ? "#8A6238" : demand === "High" ? R.school : R.ink3;
  return (
    <CardShell onClick={onClick} width={200}>
      <CardBody>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ padding: "2px 7px", borderRadius: R.r.sm, background: `${demandColor}14`, border: `1px solid ${demandColor}24`, ...R.t.label, color: demandColor, fontFamily: "'Inter', sans-serif" }}>{demand}</span>
        </div>
        <CardTitle lines={2}>{role}</CardTitle>
        <p style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif", marginBottom: "10px" }}>{domain}</p>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {skills.slice(0, 3).map((s) => <span key={s} style={{ padding: "1px 6px", borderRadius: R.r.sm, border: `1px solid ${R.hairline}`, background: R.ground, ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{s}</span>)}
        </div>
      </CardBody>
    </CardShell>
  );
}

export function SignalCard({ signal, source, category, recency, relevance, onClick }: {
  signal: string; source: string; category: string; recency: string; relevance: "High" | "Medium" | "Low"; onClick?: () => void;
}) {
  const relevanceColor = relevance === "High" ? R.lab : relevance === "Medium" ? R.school : R.ink4;
  return (
    <CardShell onClick={onClick} width={240}>
      <CardBody>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <CardTag label={category} color={R.lab} />
          <span style={{ ...R.t.micro, color: R.ink5, fontFamily: "'Inter', sans-serif" }}>{recency}</span>
        </div>
        <p style={{ ...R.t.body, color: R.ink2, fontFamily: "'Inter', sans-serif", lineHeight: "1.5", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{signal}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{ ...R.t.micro, color: R.ink4, fontFamily: "'Inter', sans-serif" }}>{source}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: relevanceColor }} />
            <span style={{ ...R.t.micro, color: relevanceColor, fontFamily: "'Inter', sans-serif" }}>{relevance} relevance</span>
          </div>
        </div>
      </CardBody>
    </CardShell>
  );
}
