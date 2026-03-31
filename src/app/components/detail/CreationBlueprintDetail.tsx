// RUBERRA Creation — Blueprint Detail
import { getBlueprint, getTrack, getDomain, getEngine } from "../product-data";
import { type NavFn } from "../shell-types";

export function CreationBlueprintDetail({ blueprintId, navigate, onStartChat }: {
  blueprintId: string;
  navigate:    NavFn;
  onStartChat: (prompt: string) => void;
}) {
  const bp = getBlueprint(blueprintId);

  if (!bp) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--r-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif" }}>Blueprint not found</p>
        <button onClick={() => navigate("creation", "home")} style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-accent)", background: "transparent", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  const tracks  = bp.linkedTracks.map(id => getTrack(id)).filter(Boolean);
  const domains = bp.linkedDomains.map(id => getDomain(id)).filter(Boolean);
  const engines = bp.linkedEngines.map(id => getEngine(id)).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button onClick={() => navigate("creation", "home")} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", marginBottom: "12px", display: "block" }}>← Creation</button>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--r-text)", fontFamily: "sans-serif", letterSpacing: "-0.02em", marginBottom: "6px" }}>{bp.title}</p>
              <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif", lineHeight: "1.6", maxWidth: "480px" }}>{bp.desc}</p>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-warn)", background: "color-mix(in srgb, var(--r-warn) 10%, var(--r-surface))", border: "1px solid color-mix(in srgb, var(--r-warn) 25%, var(--r-border))", padding: "3px 8px", borderRadius: "3px" }}>{bp.outputType}</span>
              <div style={{ marginTop: "6px" }}>
                {bp.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "8px", fontFamily: "monospace", color: "var(--r-dim)", background: "var(--r-rail)", border: "1px solid var(--r-border)", padding: "2px 5px", borderRadius: "2px", marginLeft: "3px" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Build steps */}
        {bp.steps.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-subtext)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "10px" }}>Build Steps</p>
            {bp.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "1px solid var(--r-border-soft)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--r-warn)", flexShrink: 0, marginTop: "2px", width: "16px" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: "12px", color: "var(--r-text)", fontFamily: "sans-serif", lineHeight: "1.5" }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cross-links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {tracks.length > 0 && (
            <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "12px" }}>
              <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-ok)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "8px" }}>School Tracks</p>
              {tracks.map((t) => t && (
                <button key={t.id} onClick={() => navigate("school", "track", t.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "10px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "3px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {t.title}</button>
              ))}
            </div>
          )}
          {domains.length > 0 && (
            <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "12px" }}>
              <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-accent)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "8px" }}>Lab Domains</p>
              {domains.map((d) => d && (
                <button key={d.id} onClick={() => navigate("lab", "domain", d.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "10px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "3px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {d.label}</button>
              ))}
            </div>
          )}
          {engines.length > 0 && (
            <div style={{ border: "1px solid var(--r-border)", borderRadius: "6px", background: "var(--r-surface)", padding: "12px" }}>
              <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-warn)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "8px" }}>Engines</p>
              {engines.map((e) => e && (
                <button key={e.id} onClick={() => navigate("creation", "engine", e.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "10px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "3px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {e.title}</button>
              ))}
            </div>
          )}
        </div>

        {/* Start Build */}
        <button
          onClick={() => onStartChat(`Start building: ${bp.title}. Walk me through it step by step — beginning with ${bp.steps[0] ?? "the first step"}.`)}
          style={{ padding: "10px 20px", background: "var(--r-warn)", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          Start building →
        </button>
      </div>
    </div>
  );
}
