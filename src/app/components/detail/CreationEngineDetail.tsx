// RUBERRA Creation — Engine Detail
import { getEngine, getBlueprint } from "../product-data";
import { type NavFn } from "../shell-types";

export function CreationEngineDetail({ engineId, navigate, onStartChat }: {
  engineId:    string;
  navigate:    NavFn;
  onStartChat: (prompt: string) => void;
}) {
  const engine = getEngine(engineId);

  if (!engine) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--r-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif" }}>Engine not found</p>
        <button onClick={() => navigate("creation", "home")} style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-accent)", background: "transparent", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  const blueprints = engine.linkedBlueprints.map(id => getBlueprint(id)).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "620px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <button onClick={() => navigate("creation", "home")} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", marginBottom: "12px", display: "block" }}>← Creation</button>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--r-text)", fontFamily: "sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>{engine.title}</p>
          <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif", lineHeight: "1.6", maxWidth: "420px", marginBottom: "10px" }}>{engine.desc}</p>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)" }}>{engine.templateCount} templates</span>
        </div>

        {/* Linked blueprints */}
        {blueprints.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-warn)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Used in Blueprints</p>
            {blueprints.map((bp) => bp && (
              <button key={bp.id} onClick={() => navigate("creation", "blueprint", bp.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", marginBottom: "4px", cursor: "pointer", textAlign: "left", outline: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ flex: 1, fontSize: "12px", color: "var(--r-text)", fontFamily: "sans-serif" }}>{bp.title}</span>
                <span style={{ fontSize: "10px", color: "var(--r-dim)", fontFamily: "monospace" }}>{bp.outputType} →</span>
              </button>
            ))}
          </div>
        )}

        {/* Start building */}
        <button
          onClick={() => onStartChat(`Use the ${engine.title} to start a new creation. Guide me through what it can produce and start with an example.`)}
          style={{ padding: "10px 20px", background: "var(--r-warn)", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          Open engine →
        </button>
      </div>
    </div>
  );
}
