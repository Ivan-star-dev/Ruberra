"use client";

import { useState } from "react";
import { type SchoolView } from "../shell/types";

interface SchoolBrowseProps {
  onNavigate: (v: SchoolView) => void;
}

/* ── Data model ─────────────────────────────────────────────── */

type Progress = number; /* 0–100 */
type Tag = string;

interface CourseCard {
  id:       string;
  title:    string;
  domain:   string;
  modules:  number;
  duration: string;
  level:    "Foundation" | "Advanced" | "Expert";
  progress?: Progress;
  tags:     Tag[];
  featured?: boolean;
}

interface TrackCard {
  id:      string;
  title:   string;
  caption: string;
  courses: number;
  role:    string;
  tag:     string;
}

interface FutureRoleCard {
  id:     string;
  role:   string;
  domain: string;
  demand: "Rising" | "High" | "Critical";
  skills: string[];
}

/* ── Content catalogue ──────────────────────────────────────── */

const FEATURED: CourseCard[] = [
  { id: "f1", title: "Distributed Systems Engineering", domain: "Systems", modules: 5, duration: "14h", level: "Advanced", progress: 34, tags: ["Systems", "Architecture"], featured: true },
  { id: "f2", title: "AI Reasoning & Epistemics", domain: "AI", modules: 6, duration: "16h", level: "Expert", tags: ["AI", "Cognition"] },
  { id: "f3", title: "Product Systems Design", domain: "Product", modules: 4, duration: "10h", level: "Advanced", tags: ["Product", "Strategy"] },
];

const CONTINUE: CourseCard[] = [
  { id: "c1", title: "Distributed Systems Engineering", domain: "Systems", modules: 5, duration: "14h", level: "Advanced", progress: 34, tags: ["Systems"] },
  { id: "c2", title: "Foundations of Systems Thinking", domain: "Systems", modules: 3, duration: "7h", level: "Foundation", progress: 72, tags: ["Systems"] },
  { id: "c3", title: "Mental Models for Technologists", domain: "Cognition", modules: 4, duration: "9h", level: "Advanced", progress: 18, tags: ["Cognition"] },
];

const COLLECTIONS: { label: string; courses: CourseCard[] }[] = [
  {
    label: "Systems & Architecture",
    courses: [
      { id: "s1", title: "Network Architecture Patterns",    domain: "Systems",     modules: 5, duration: "11h", level: "Advanced",    tags: ["Systems", "Networks"] },
      { id: "s2", title: "Data Consistency Models",          domain: "Systems",     modules: 4, duration: "9h",  level: "Advanced",    tags: ["Data", "Systems"] },
      { id: "s3", title: "Distributed Consensus",           domain: "Systems",     modules: 4, duration: "8h",  level: "Expert",      tags: ["Consensus", "Systems"] },
      { id: "s4", title: "Observability & Tracing",         domain: "Systems",     modules: 3, duration: "6h",  level: "Advanced",    tags: ["Ops", "Systems"] },
    ],
  },
  {
    label: "AI-Native Work",
    courses: [
      { id: "a1", title: "Prompt Engineering Mastery",      domain: "AI",          modules: 5, duration: "10h", level: "Advanced",    tags: ["AI", "Prompts"] },
      { id: "a2", title: "AI Agents & Orchestration",       domain: "AI",          modules: 6, duration: "13h", level: "Expert",      tags: ["AI", "Agents"] },
      { id: "a3", title: "Semantic Search Architecture",    domain: "AI",          modules: 4, duration: "8h",  level: "Advanced",    tags: ["AI", "Search"] },
      { id: "a4", title: "LLM Fine-Tuning & Alignment",    domain: "AI",          modules: 5, duration: "12h", level: "Expert",      tags: ["AI", "Training"] },
    ],
  },
  {
    label: "Strategy & Decision Intelligence",
    courses: [
      { id: "d1", title: "First Principles Reasoning",      domain: "Cognition",   modules: 3, duration: "6h",  level: "Foundation",  tags: ["Thinking", "Strategy"] },
      { id: "d2", title: "Decision Frameworks at Scale",    domain: "Strategy",    modules: 4, duration: "9h",  level: "Advanced",    tags: ["Decisions", "Scale"] },
      { id: "d3", title: "Competitive Intelligence",        domain: "Strategy",    modules: 4, duration: "8h",  level: "Advanced",    tags: ["Strategy", "Intel"] },
      { id: "d4", title: "Scenario Planning & Simulation",  domain: "Strategy",    modules: 3, duration: "7h",  level: "Advanced",    tags: ["Strategy", "Futures"] },
    ],
  },
];

const TRACKS: TrackCard[] = [
  { id: "t1", title: "AI Systems Architect",   caption: "Design AI-native infrastructure",   courses: 7, role: "Architect",  tag: "High Demand" },
  { id: "t2", title: "Technical Product Lead", caption: "Bridge engineering and strategy",   courses: 6, role: "Product",   tag: "Emerging" },
  { id: "t3", title: "AI Research Operator",   caption: "Investigate and synthesize signals", courses: 5, role: "Research",  tag: "Rising" },
  { id: "t4", title: "Creator-Economist",       caption: "Build and monetize knowledge",      courses: 6, role: "Creator",   tag: "2026 Skill" },
];

const FUTURE_ROLES: FutureRoleCard[] = [
  { id: "r1", role: "AI Workflow Architect",      domain: "AI Engineering",  demand: "Critical", skills: ["LLM Orchestration", "Agent Design", "System Integration"] },
  { id: "r2", role: "Knowledge Systems Designer", domain: "Information Arch", demand: "Rising",  skills: ["Ontology Design", "Retrieval Systems", "Curation Strategy"] },
  { id: "r3", role: "Epistemic Analyst",          domain: "Research",        demand: "High",    skills: ["Evidence Analysis", "Synthesis", "Signal Mapping"] },
  { id: "r4", role: "AI-Native Product Manager",  domain: "Product",         demand: "Critical", skills: ["AI Integration", "System Design", "Roadmapping"] },
];

/* ── Shared primitives ──────────────────────────────────────── */

const LEVEL_COLOR: Record<string, string> = {
  Foundation: "var(--r-ok)",
  Advanced:   "var(--r-accent)",
  Expert:     "var(--r-warn)",
};

const DEMAND_COLOR: Record<string, string> = {
  Rising:   "var(--r-ok)",
  High:     "var(--r-accent)",
  Critical: "var(--r-warn)",
};

function Tag({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      style={{
        fontSize:        "10px",
        padding:         "2px 8px",
        borderRadius:    "999px",
        border:          "1px solid var(--r-border)",
        backgroundColor: accent ? "var(--r-border-soft)" : "transparent",
        color:           "var(--r-subtext)",
        whiteSpace:      "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-baseline justify-between" style={{ marginBottom: "16px" }}>
      <h2
        style={{
          fontSize:      "15px",
          fontWeight:    600,
          color:         "var(--r-text)",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {action && (
        <button
          onClick={onAction}
          style={{ fontSize: "12px", color: "var(--r-subtext)", textDecoration: "none" }}
        >
          {action} →
        </button>
      )}
    </div>
  );
}

/* ── Course card ────────────────────────────────────────────── */

function CourseCardUI({ course, wide }: { course: CourseCard; wide?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:           wide ? "280px" : "220px",
        flexShrink:      0,
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        overflow:        "hidden",
        transition:      "border-color 0.15s, box-shadow 0.15s",
        boxShadow:       hovered ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          height:          "100px",
          backgroundColor: "var(--r-panel)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          position:        "relative",
          borderBottom:    "1px solid var(--r-border-soft)",
        }}
      >
        {/* Domain glyph */}
        <span style={{ fontSize: "28px", opacity: 0.12, userSelect: "none" }}>
          {DOMAIN_GLYPH[course.domain] || "◈"}
        </span>
        {/* Level badge */}
        <span
          style={{
            position:        "absolute",
            top:             "8px",
            right:           "8px",
            fontSize:        "9px",
            padding:         "2px 7px",
            borderRadius:    "999px",
            backgroundColor: "var(--r-surface)",
            color:           LEVEL_COLOR[course.level],
            border:          `1px solid ${LEVEL_COLOR[course.level]}30`,
            fontWeight:      500,
          }}
        >
          {course.level}
        </span>
        {/* Progress bar */}
        {course.progress !== undefined && (
          <div
            style={{
              position:        "absolute",
              bottom:          0,
              left:            0,
              right:           0,
              height:          "2px",
              backgroundColor: "var(--r-border)",
            }}
          >
            <div style={{ width: `${course.progress}%`, height: "100%", backgroundColor: "var(--r-accent)" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <p
          style={{
            fontSize:     "12px",
            fontWeight:   600,
            color:        "var(--r-text)",
            lineHeight:   "1.35",
            marginBottom: "4px",
            letterSpacing: "-0.01em",
          }}
        >
          {course.title}
        </p>
        <p style={{ fontSize: "10px", color: "var(--r-dim)", marginBottom: "8px" }}>
          {course.modules} modules · {course.duration}
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {course.tags.slice(0, 2).map(t => <Tag key={t} label={t} />)}
        </div>
        {course.progress !== undefined && (
          <p style={{ fontSize: "10px", color: "var(--r-accent)", marginTop: "8px", fontWeight: 500 }}>
            {course.progress}% complete
          </p>
        )}
      </div>
    </div>
  );
}

const DOMAIN_GLYPH: Record<string, string> = {
  Systems:   "⬡",
  AI:        "◎",
  Product:   "◇",
  Strategy:  "△",
  Cognition: "○",
  Data:      "▦",
};

/* ── Horizontal scroll rail ─────────────────────────────────── */

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto"
      style={{ paddingBottom: "8px", scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

/* ── Track card ─────────────────────────────────────────────── */

function TrackCardUI({ track }: { track: TrackCard }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:           "200px",
        flexShrink:      0,
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px",
        transition:      "border-color 0.15s",
      }}
    >
      <span
        style={{
          fontSize:        "9px",
          padding:         "2px 8px",
          borderRadius:    "999px",
          backgroundColor: "var(--r-border-soft)",
          color:           "var(--r-subtext)",
          fontWeight:      500,
          display:         "inline-block",
          marginBottom:    "10px",
        }}
      >
        {track.tag}
      </span>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--r-text)", lineHeight: "1.3", letterSpacing: "-0.01em", marginBottom: "5px" }}>
        {track.title}
      </p>
      <p style={{ fontSize: "11px", color: "var(--r-subtext)", marginBottom: "10px", lineHeight: "1.4" }}>
        {track.caption}
      </p>
      <p style={{ fontSize: "10px", color: "var(--r-dim)" }}>{track.courses} courses</p>
    </div>
  );
}

/* ── Future role card ───────────────────────────────────────── */

function FutureRoleCardUI({ role }: { role: FutureRoleCard }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex:            "1 1 220px",
        backgroundColor: "var(--r-surface)",
        border:          `1px solid ${hovered ? "var(--r-subtext)" : "var(--r-border)"}`,
        borderRadius:    "10px",
        padding:         "16px 18px",
        cursor:          "pointer",
        transition:      "border-color 0.15s",
      }}
    >
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--r-text)", lineHeight: "1.3", letterSpacing: "-0.01em" }}>
          {role.role}
        </p>
        <span
          style={{
            fontSize:     "9px",
            padding:      "2px 8px",
            borderRadius: "999px",
            color:        DEMAND_COLOR[role.demand],
            backgroundColor: `${DEMAND_COLOR[role.demand]}14`,
            border:       `1px solid ${DEMAND_COLOR[role.demand]}30`,
            whiteSpace:   "nowrap",
            fontWeight:   500,
            flexShrink:   0,
          }}
        >
          {role.demand}
        </span>
      </div>
      <p style={{ fontSize: "10px", color: "var(--r-dim)", marginBottom: "10px" }}>{role.domain}</p>
      <div className="flex flex-wrap gap-1">
        {role.skills.map(s => <Tag key={s} label={s} />)}
      </div>
    </div>
  );
}

/* ── Featured hero card ─────────────────────────────────────── */

function FeaturedHero({ courses, onNavigate }: { courses: CourseCard[]; onNavigate: () => void }) {
  const [active, setActive] = useState(0);
  const course = courses[active];

  return (
    <div
      style={{
        backgroundColor: "var(--r-surface)",
        border:          "1px solid var(--r-border)",
        borderRadius:    "14px",
        overflow:        "hidden",
        marginBottom:    "32px",
      }}
    >
      <div style={{ display: "flex" }}>
        {/* Left: text */}
        <div style={{ flex: 1, padding: "28px 32px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "12px" }}>
            {course.progress !== undefined && (
              <span style={{ fontSize: "10px", color: "var(--r-accent)", fontWeight: 500 }}>
                IN PROGRESS
              </span>
            )}
            <span
              style={{
                fontSize:     "10px",
                padding:      "2px 8px",
                borderRadius: "999px",
                color:        LEVEL_COLOR[course.level],
                border:       `1px solid ${LEVEL_COLOR[course.level]}40`,
                fontWeight:   500,
              }}
            >
              {course.level}
            </span>
          </div>
          <h1
            style={{
              fontSize:      "22px",
              fontWeight:    700,
              color:         "var(--r-text)",
              lineHeight:    "1.25",
              letterSpacing: "-0.03em",
              marginBottom:  "10px",
              maxWidth:      "340px",
            }}
          >
            {course.title}
          </h1>
          <p style={{ fontSize: "12px", color: "var(--r-subtext)", marginBottom: "20px" }}>
            {course.modules} modules · {course.duration} · {course.domain}
          </p>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "20px" }}>
            {course.tags.map(t => <Tag key={t} label={t} accent />)}
          </div>
          {course.progress !== undefined && (
            <div style={{ marginBottom: "20px" }}>
              <div className="flex justify-between" style={{ marginBottom: "5px" }}>
                <span style={{ fontSize: "10px", color: "var(--r-subtext)" }}>Progress</span>
                <span style={{ fontSize: "10px", color: "var(--r-subtext)", fontWeight: 500 }}>{course.progress}%</span>
              </div>
              <div style={{ height: "3px", backgroundColor: "var(--r-border)", borderRadius: "2px" }}>
                <div style={{ width: `${course.progress}%`, height: "100%", backgroundColor: "var(--r-accent)", borderRadius: "2px" }} />
              </div>
            </div>
          )}
          <button
            onClick={onNavigate}
            style={{
              padding:         "9px 20px",
              borderRadius:    "8px",
              backgroundColor: "var(--r-cta-bg)",
              color:           "var(--r-cta-text)",
              fontSize:        "13px",
              fontWeight:      500,
            }}
          >
            {course.progress !== undefined ? "Continue Learning" : "Start Course"}
          </button>
        </div>

        {/* Right: thumbnail area + slide dots */}
        <div
          style={{
            width:           "240px",
            flexShrink:      0,
            backgroundColor: "var(--r-panel)",
            borderLeft:      "1px solid var(--r-border-soft)",
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            justifyContent:  "center",
            gap:             "12px",
          }}
        >
          <span style={{ fontSize: "48px", opacity: 0.1 }}>
            {DOMAIN_GLYPH[course.domain] || "◈"}
          </span>
          {/* Dots */}
          <div className="flex gap-1.5">
            {courses.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width:           i === active ? "18px" : "6px",
                  height:          "6px",
                  borderRadius:    "999px",
                  backgroundColor: i === active ? "var(--r-text)" : "var(--r-border)",
                  transition:      "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Root component ─────────────────────────────────────────── */

export default function SchoolBrowse({ onNavigate }: SchoolBrowseProps) {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "var(--r-bg)", padding: "28px 32px 48px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize:      "22px",
            fontWeight:    700,
            color:         "var(--r-text)",
            letterSpacing: "-0.03em",
            marginBottom:  "4px",
          }}
        >
          School
        </h1>
        <p style={{ fontSize: "13px", color: "var(--r-subtext)" }}>
          Premium learning across systems, AI, strategy, and cognition.
        </p>
      </div>

      {/* Featured hero */}
      <FeaturedHero courses={FEATURED} onNavigate={() => onNavigate("curriculum")} />

      {/* Continue learning */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Continue Learning" />
        <Rail>
          {CONTINUE.map(c => <CourseCardUI key={c.id} course={c} />)}
        </Rail>
      </div>

      {/* Collections */}
      {COLLECTIONS.map(col => (
        <div key={col.label} style={{ marginBottom: "36px" }}>
          <SectionHeader title={col.label} action="See all" />
          <Rail>
            {col.courses.map(c => <CourseCardUI key={c.id} course={c} />)}
          </Rail>
        </div>
      ))}

      {/* Tracks / paths */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Career Tracks" action="All tracks" />
        <Rail>
          {TRACKS.map(t => <TrackCardUI key={t.id} track={t} />)}
        </Rail>
      </div>

      {/* Future roles */}
      <div style={{ marginBottom: "36px" }}>
        <SectionHeader title="Future Roles — 2026 Demand" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {FUTURE_ROLES.map(r => <FutureRoleCardUI key={r.id} role={r} />)}
        </div>
      </div>
    </div>
  );
}
