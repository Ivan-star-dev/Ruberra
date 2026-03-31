// RUBERRA School — Role Detail
import { getRole, getTrack, getDomain, getBlueprint } from "../product-data";
import { type NavFn } from "../shell-types";

export function SchoolRoleDetail({ roleId, navigate, onStartChat }: {
  roleId:      string;
  navigate:    NavFn;
  onStartChat: (prompt: string) => void;
}) {
  const role = getRole(roleId);

  if (!role) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--r-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif" }}>Role not found</p>
        <button onClick={() => navigate("school", "browse")} style={{ marginTop: "8px", fontSize: "10px", fontFamily: "monospace", color: "var(--r-accent)", background: "transparent", border: "none", cursor: "pointer" }}>← Back</button>
      </div>
    </div>
  );

  const DEMAND_COLOR: Record<string, string> = { Critical: "var(--r-err)", High: "var(--r-warn)", Emerging: "var(--r-ok)" };
  const tracks     = role.requiredTracks.map(id => getTrack(id)).filter(Boolean);
  const domains    = role.linkedDomains.map(id => getDomain(id)).filter(Boolean);
  const blueprints = role.linkedBlueprints.map(id => getBlueprint(id)).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--r-bg)" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <button onClick={() => navigate("school", "browse")} style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--r-dim)", background: "transparent", border: "none", cursor: "pointer", marginBottom: "12px", display: "block" }}>← Role Paths</button>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--r-text)", fontFamily: "sans-serif", letterSpacing: "-0.02em", marginBottom: "4px" }}>{role.title}</p>
              <p style={{ fontSize: "11px", color: "var(--r-dim)", fontFamily: "monospace", marginBottom: "8px" }}>{role.domain}</p>
              <p style={{ fontSize: "12px", color: "var(--r-subtext)", fontFamily: "sans-serif", lineHeight: "1.6", maxWidth: "440px" }}>{role.desc}</p>
            </div>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: DEMAND_COLOR[role.demand], letterSpacing: "0.08em", flexShrink: 0, background: "var(--r-surface)", border: "1px solid var(--r-border)", padding: "3px 8px", borderRadius: "3px" }}>{role.demand}</span>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-subtext)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "8px" }}>Core Skills</p>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {role.skills.map(skill => (
              <span key={skill} style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-text)", background: "var(--r-surface)", border: "1px solid var(--r-border)", padding: "3px 8px", borderRadius: "3px" }}>{skill}</span>
            ))}
          </div>
        </div>

        {/* Required tracks */}
        {tracks.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-ok)", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: "8px" }}>Required Tracks</p>
            {tracks.map((track) => track && (
              <button key={track.id} onClick={() => navigate("school", "track", track.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", border: "1px solid var(--r-border)", borderRadius: "5px", background: "var(--r-surface)", marginBottom: "4px", cursor: "pointer", textAlign: "left", outline: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-elevated)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--r-surface)"; }}
              >
                <span style={{ flex: 1, fontSize: "12px", color: "var(--r-text)", fontFamily: "sans-serif" }}>{track.title}</span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "var(--r-dim)" }}>{track.lessonCount} lessons →</span>
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
                {domains.map((d) => d && (
                  <button key={d.id} onClick={() => navigate("lab", "domain", d.id)} style={{ display: "block", width: "100%", textAlign: "left", fontSize: "11px", color: "var(--r-subtext)", fontFamily: "sans-serif", padding: "4px 0", background: "transparent", border: "none", cursor: "pointer" }}>→ {d.label}</button>
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
          onClick={() => onStartChat(`I want to become a ${role.title}. Build me a structured learning path — what do I need to master, in what order, and what should I build to prove competence?`)}
          style={{ padding: "10px 20px", background: "var(--r-ok)", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}
        >
          Build my learning path →
        </button>
      </div>
    </div>
  );
}
