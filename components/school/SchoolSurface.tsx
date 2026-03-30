"use client";

import { useState } from "react";

interface Lesson {
  id:        number;
  title:     string;
  lessons:   number;
  duration:  string;
  status:    "complete" | "active" | "available" | "locked";
  progress?: string;
}

const CURRICULUM: Lesson[] = [
  { id: 1, title: "Foundations of Systems Thinking",    lessons: 6, duration: "2h 10m", status: "complete"  },
  { id: 2, title: "Network Architecture Patterns",       lessons: 8, duration: "2h 40m", status: "active",   progress: "5/8 lessons" },
  { id: 3, title: "Data Consistency Models",             lessons: 7, duration: "2h 55m", status: "available" },
  { id: 4, title: "Distributed Consensus",               lessons: 6, duration: "2h 20m", status: "locked"    },
  { id: 5, title: "Observability & Tracing",             lessons: 5, duration: "1h 45m", status: "locked"    },
];

const COMING_UP = [
  { n: 5, title: "Event-Driven Decomposition", duration: "18 min" },
  { n: 6, title: "State Machine Architecture", duration: "22 min" },
  { n: 7, title: "Saga and Outbox Patterns",   duration: "25 min" },
];

export default function SchoolSurface() {
  const [active, setActive] = useState<number>(2);

  return (
    <div className="flex flex-1 min-h-0" style={{ backgroundColor: "var(--r-bg)" }}>

      {/* ── Curriculum navigator panel ── */}
      <div
        className="flex flex-col shrink-0 border-r overflow-y-auto"
        style={{
          width:           "280px",
          borderColor:     "var(--r-border)",
          backgroundColor: "var(--r-surface)",
        }}
      >
        {/* Course header */}
        <div style={{ padding: "20px 20px 16px" }}>
          <p
            className="font-mono uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--r-dim)", marginBottom: "8px" }}
          >
            Advanced Engineering
          </p>
          <h2
            className="font-semibold"
            style={{ fontSize: "16px", color: "var(--r-text)", lineHeight: "1.3", letterSpacing: "-0.02em", marginBottom: "12px" }}
          >
            Distributed Systems Engineering
          </h2>

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: "11px", color: "var(--r-subtext)" }}>1 of 5 modules</span>
            <span style={{ fontSize: "11px", color: "var(--r-subtext)", fontWeight: 500 }}>34%</span>
          </div>
          <div
            className="w-full"
            style={{ height: "3px", backgroundColor: "var(--r-border)", borderRadius: "2px" }}
          >
            <div
              style={{ width: "34%", height: "100%", backgroundColor: "var(--r-text)", borderRadius: "2px" }}
            />
          </div>
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--r-border)" }} />

        {/* Lesson list */}
        <div style={{ padding: "8px 0" }}>
          {CURRICULUM.map(lesson => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isSelected={active === lesson.id}
              onClick={() => lesson.status !== "locked" && setActive(lesson.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Main reading area ── */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "0 32px 48px" }}>
        <div className="flex flex-col items-center" style={{ maxWidth: "400px", width: "100%" }}>

          {/* Icon */}
          <div
            className="flex items-center justify-center mb-5"
            style={{
              width:           "52px",
              height:          "52px",
              backgroundColor: "var(--r-panel)",
              border:          "1px solid var(--r-border)",
              borderRadius:    "14px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: "var(--r-subtext)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 9h18M9 9v12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>

          <h2
            className="font-medium text-center"
            style={{ fontSize: "20px", color: "var(--r-text)", letterSpacing: "-0.02em", marginBottom: "8px" }}
          >
            Select a lesson to begin
          </h2>
          <p
            className="text-center"
            style={{ fontSize: "13px", color: "var(--r-subtext)", marginBottom: "28px", lineHeight: "1.5" }}
          >
            Choose a module from the curriculum navigator to open a reading session.
          </p>

          {/* Resume CTA */}
          <button
            className="flex items-center gap-2 w-full justify-start transition-colors duration-150"
            style={{
              backgroundColor: "var(--r-cta-bg)",
              color:           "var(--r-cta-text)",
              padding:         "12px 20px",
              borderRadius:    "10px",
              fontSize:        "14px",
              fontWeight:      500,
              marginBottom:    "32px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3l7 5-7 5V3z" fill="currentColor" />
            </svg>
            Resume — Lesson 5 of 8
          </button>

          {/* Coming up */}
          <div className="w-full">
            <p
              className="font-mono uppercase text-center"
              style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--r-dim)", marginBottom: "14px" }}
            >
              Coming Up
            </p>
            <div className="flex flex-col">
              {COMING_UP.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  style={{
                    padding:      "10px 0",
                    borderBottom: i < COMING_UP.length - 1 ? "1px solid var(--r-border)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "12px", color: "var(--r-dim)", minWidth: "14px" }}>{item.n}</span>
                    <span style={{ fontSize: "13px", color: "var(--r-text-2)" }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--r-dim)" }}>{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonItem({ lesson, isSelected, onClick }: {
  lesson:     Lesson;
  isSelected: boolean;
  onClick:    () => void;
}) {
  const isLocked    = lesson.status === "locked";
  const isComplete  = lesson.status === "complete";
  const isActive    = lesson.status === "active";

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="w-full text-left transition-colors duration-100"
      style={{
        padding:         "10px 20px",
        backgroundColor: isSelected && !isLocked ? "var(--r-border-soft)" : "transparent",
        cursor:          isLocked ? "default" : "pointer",
        opacity:         isLocked ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {isComplete && (
            <span
              className="flex items-center justify-center"
              style={{ width: "16px", height: "16px", color: "var(--r-ok)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {isActive && (
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--r-text)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--r-surface)" }} />
            </span>
          )}
          {(lesson.status === "available") && (
            <span
              className="w-3.5 h-3.5 rounded-full border-2"
              style={{ borderColor: "var(--r-border)", display: "block" }}
            />
          )}
          {isLocked && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--r-dim)" }}>
              <rect x="3" y="6" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 6V4.5a2 2 0 014 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Lesson info */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize:   "13px",
              fontWeight: isActive ? 500 : 400,
              color:      isLocked ? "var(--r-dim)" : "var(--r-text)",
              lineHeight: "1.3",
              marginBottom: "3px",
            }}
          >
            {isLocked && <span style={{ fontSize: "10px", marginRight: "4px" }}>🔒</span>}
            {lesson.title}
          </p>
          <p style={{ fontSize: "11px", color: "var(--r-dim)" }}>
            {lesson.progress
              ? `${lesson.progress} · ${lesson.duration}`
              : `${lesson.lessons} lessons · ${lesson.duration}`}
          </p>
        </div>
      </div>
    </button>
  );
}
