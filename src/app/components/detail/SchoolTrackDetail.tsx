// RUBERRA School — Track Detail
import { getTrack, getDomainsForTrack, getBlueprintsForTrack } from "../product-data";
import { type NavFn } from "../shell-types";

export function SchoolTrackDetail({ trackId, navigate, onStartChat }: {
  trackId:     string;
  navigate:    NavFn;
  onStartChat: (prompt: string) => void;
}) {
  const track = getTrack(trackId);
  if (!track) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--r-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif" }}>Track not found</p>
        <button onClick={() => navigate("school", "home")} style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-accent)", background: "transparent", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  const domains    = getDomainsForTrack(trackId);
  const blueprints = getBlueprintsForTrack(trackId);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button onClick={() => navigate("school", "home")} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", marginBottom: "12px", display: "block" }}>← School</button>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--r-text)", fontFamily: "sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>{track.title}</p>
              <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif", lineHeight: "1.6", maxWidth: "480px" }}>{track.tagline}</p>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-ok)", letterSpacing: "0.08em", background: "color-mix(in srgb, var(--r-ok) 10%, var(--r-surface))", border: "1px solid color-mix(in srgb, var(--r-ok) 25%, var(--r-border))", padding: "3px 8px", borderRadius: "3px" }}>{track.level}</span>
              <div style={{ marginTop: "6px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)" }}>{track.lessonCount} lessons · {track.duration}</div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        {track.lessons.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-subtext)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Lessons</p>
            {track.lessons.map((lesson, i) => (
              <button key={lesson.id} onClick={() => navigate("school", "lesson", lesson.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "4px", cursor: "pointer", textAlign: "left", outline: "none", transition: "background 0.1s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-dim)", flexShrink: 0, width: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1, fontSize: "12px", color: lesson.status === "locked" ? "var(--r-muted)" : "var(--r-text)", fontFamily: "sans-serif" }}>{lesson.title}</span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)", flexShrink: 0 }}>{lesson.duration}</span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: lesson.status === "done" ? "var(--r-ok)" : lesson.status === "in-progress" ? "var(--r-accent)" : "var(--r-dim)", flexShrink: 0, letterSpacing: "0.06em" }}>{lesson.status}</span>
              </button>
            ))}
          </div>
        )}

        {/* Cross-links */}
        {(domains.length > 0 || blueprints.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            {domains.length > 0 && (
              <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "14px" }}>
                <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-accent)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Lab Domains</p>
                {domains.map(d => (
                  <button key={d.id} onClick={() => navigate("lab", "domain", d.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "4px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {d.label}</button>
                ))}
              </div>
            )}
            {blueprints.length > 0 && (
              <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "14px" }}>
                <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-warn)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Blueprints</p>
                {blueprints.map(b => (
                  <button key={b.id} onClick={() => navigate("creation", "blueprint", b.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "4px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {b.title}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Start Chat */}
        <button
          onClick={() => onStartChat(`Guide me through the ${track.title} track — start with an overview and the key concepts I need to master.`)}
          style={{ padding: "10px 20px", background: "var(--r-ok)", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          Start learning →
        </button>
      </div>
    </div>
  );
}
