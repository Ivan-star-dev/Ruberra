"use client";

import { useState } from "react";

interface Resource {
  id:       string;
  title:    string;
  category: string;
  desc:     string;
  kind:     "framework" | "blueprint" | "reference" | "guide" | "track";
}

const LIBRARY: Resource[] = [
  { id: "r1", title: "First Principles Thinking", category: "Frameworks", desc: "Break any problem to its foundational axioms before reasoning upward.", kind: "framework" },
  { id: "r2", title: "Feynman Technique", category: "Frameworks", desc: "Teach what you learn, expose gaps, simplify until mastered.", kind: "framework" },
  { id: "r3", title: "Zettelkasten Method", category: "Blueprints", desc: "Networked note system for building a living knowledge graph.", kind: "blueprint" },
  { id: "r4", title: "Spaced Repetition", category: "Blueprints", desc: "Review intervals timed to the forgetting curve for lasting retention.", kind: "blueprint" },
  { id: "r5", title: "Systems Thinking", category: "Frameworks", desc: "Understand feedback loops, emergence, and leverage points.", kind: "framework" },
  { id: "r6", title: "Analytical Reading", category: "Guides", desc: "Active reading as dialogue: question, annotate, synthesize, judge.", kind: "guide" },
  { id: "r7", title: "Mental Models Index", category: "References", desc: "Curated mental models from physics, mathematics, and psychology.", kind: "reference" },
  { id: "r8", title: "Deep Work Protocol", category: "Guides", desc: "Structure focused sessions to produce cognitively demanding output.", kind: "guide" },
  { id: "r9", title: "Logic & Argumentation", category: "Tracks", desc: "From syllogisms to informal fallacies — clean reasoning foundation.", kind: "track" },
  { id: "r10", title: "Research Methods", category: "Tracks", desc: "Empirical design, evidence hierarchy, and analytical writing.", kind: "track" },
];

const CATEGORIES = ["All", "Frameworks", "Blueprints", "Guides", "References", "Tracks"];

const KIND_ACCENT: Record<Resource["kind"], string> = {
  framework: "var(--r-accent)",
  blueprint: "var(--r-ok)",
  guide:     "var(--r-warn)",
  reference: "var(--r-subtext)",
  track:     "var(--r-pulse)",
};

export default function SchoolLibrary() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = filter === "All"
    ? LIBRARY
    : LIBRARY.filter(r => r.category === filter);

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-panel-in">

      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "var(--r-border)" }}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium tracking-tight" style={{ color: "var(--r-text)" }}>
            Library
          </h2>
          <span className="text-[10px] font-mono" style={{ color: "var(--r-subtext)" }}>
            {visible.length} resources
          </span>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setFilter(cat)}
              className="shrink-0 text-[10px] px-2.5 py-1 rounded-sm transition-colors duration-150"
              style={{
                backgroundColor: filter === cat ? "var(--r-border)" : "transparent",
                color: filter === cat ? "var(--r-text)" : "var(--r-subtext)",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {visible.map(resource => (
          <div key={resource.id}
            className="border rounded overflow-hidden transition-all duration-150"
            style={{ borderColor: "var(--r-border)", backgroundColor: "var(--r-surface)" }}>

            <button
              className="w-full flex items-start gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded(expanded === resource.id ? null : resource.id)}>
              <span className="w-1 h-full rounded-full shrink-0 mt-1 self-stretch max-h-4"
                style={{ backgroundColor: KIND_ACCENT[resource.kind] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: "var(--r-text)" }}>
                    {resource.title}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest"
                    style={{ color: KIND_ACCENT[resource.kind] }}>
                    {resource.kind}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--r-subtext)" }}>
                  {resource.desc}
                </p>
              </div>
              <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--r-dim)" }}>
                {expanded === resource.id ? "▾" : "▸"}
              </span>
            </button>

            {expanded === resource.id && (
              <div className="px-4 pb-4 pt-1 border-t animate-panel-in"
                style={{ borderColor: "var(--r-border-soft)" }}>
                <div className="space-y-2">
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--r-text)" }}>
                    {resource.desc} This is a structured learning resource within the School chamber.
                    Ask the School AI to guide you through it, generate a study plan, or produce examples.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--r-dim)" }}>
                      category
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--r-subtext)" }}>
                      {resource.category}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
