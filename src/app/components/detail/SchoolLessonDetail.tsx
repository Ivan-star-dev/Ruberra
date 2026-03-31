// RUBERRA School — Lesson Detail
import { getLesson, getExperiment, getBlueprint } from "../product-data";
import { type NavFn } from "../shell-types";

export function SchoolLessonDetail({ lessonId, navigate, onStartChat }: {
  lessonId:    string;
  navigate:    NavFn;
  onStartChat: (prompt: string) => void;
}) {
  const result = getLesson(lessonId);
  const lesson = result?.lesson ?? null;
  const track  = result?.track ?? null;

  if (!lesson) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--r-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif" }}>Lesson not found</p>
        <button onClick={() => navigate("school", "home")} style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-accent)", background: "transparent", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  const experiments = lesson.linkedExperiments.map(id => getExperiment(id)).filter(Boolean);
  const blueprints  = lesson.linkedBlueprints.map(id => getBlueprint(id)).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "16px" }}>
          <button onClick={() => navigate("school", "home")} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer" }}>School</button>
          {track && <>
            <span style={{ fontSize: "10px", color: "var(--r-dim)" }}>›</span>
            <button onClick={() => navigate("school", "track", track.id)} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer" }}>{track.title}</button>
          </>}
          <span style={{ fontSize: "10px", color: "var(--r-dim)" }}>›</span>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-subtext)" }}>Lesson</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--r-text)", fontFamily: "sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>{lesson.title}</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)" }}>{lesson.duration}</span>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: lesson.status === "done" ? "var(--r-ok)" : lesson.status === "in-progress" ? "var(--r-accent)" : "var(--r-dim)", letterSpacing: "0.06em" }}>{lesson.status}</span>
          </div>
        </div>

        {/* Cross-links */}
        {(experiments.length > 0 || blueprints.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            {experiments.length > 0 && (
              <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "14px" }}>
                <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-accent)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Lab Experiments</p>
                {experiments.map((exp) => exp && (
                  <button key={exp.id} onClick={() => navigate("lab", "experiment", exp.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "4px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {exp.title}</button>
                ))}
              </div>
            )}
            {blueprints.length > 0 && (
              <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "14px" }}>
                <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-warn)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Blueprints</p>
                {blueprints.map((bp) => bp && (
                  <button key={bp.id} onClick={() => navigate("creation", "blueprint", bp.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "4px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {bp.title}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Start Chat */}
        <button
          onClick={() => onStartChat(`Teach me this lesson from first principles: "${lesson.title}". Start with the core concept, then build up progressively.`)}
          style={{ padding: "10px 20px", background: "var(--r-ok)", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          {lesson.status === "in-progress" ? "Resume lesson →" : "Start lesson →"}
        </button>
      </div>
    </div>
  );
}
