/**
 * RUBERRA Terminal — Claude Code-inspired execution surface
 * Warm-dark, semantic, structured.
 * CSS keyframe animations — no motion/react dependency.
 */

import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { type Message } from "./shell-types";

// ─── CSS keyframes ─────────────────────────────────────────────────────────────────────────

const TERMINAL_KEYFRAMES = `
  @keyframes rt-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes rt-blink { 0%,100%{opacity:1}  50%{opacity:0} }
`;

// ─── Terminal Color System ────────────────────────────────────────────────────────────────────

const T = {
  bg:       "#0C0B0A",
  surface:  "#131110",
  line:     "#1D1B18",
  line2:    "#252220",
  text:     "#C6C0B8",
  dim:      "#5A5450",
  dim2:     "#3D3A36",
  green:    "#4E8C5E",
  greenBg:  "rgba(42,78,50,0.35)",
  red:      "#8C4545",
  redBg:    "rgba(78,30,30,0.40)",
  amber:    "#B07830",
  amberDim: "#6A4818",
  pink:     "#B87896",
  cyan:     "#4A8C90",
  purple:   "#7870AA",
  number:   "#A09060",
  prompt:   "#C6C0B8",
} as const;

// ─── Syntax Highlighter ─────────────────────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  "import","export","from","as","const","let","var","function","class","return",
  "if","else","for","while","do","switch","case","break","continue","new","this",
  "null","undefined","true","false","void","typeof","instanceof","in","of",
  "type","interface","extends","implements","async","await","try","catch","throw",
  "default","delete","enum","abstract","static","public","private","protected",
  "readonly","namespace","module","declare","yield","super","with",
]);

interface Token { text: string; color: string; }

function tokenizeLine(raw: string): Token[] {
  if (!raw.trim()) return [{ text: raw, color: T.text }];
  const tokens: Token[] = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === "/" && raw[i + 1] === "/") { tokens.push({ text: raw.slice(i), color: T.dim }); break; }
    if (raw[i] === '"' || raw[i] === "'" || raw[i] === "`") {
      const q = raw[i]; let j = i + 1;
      while (j < raw.length && raw[j] !== q) { if (raw[j] === "\\") j++; j++; } j++;
      tokens.push({ text: raw.slice(i, j), color: T.amber }); i = j; continue;
    }
    if (/\d/.test(raw[i]) && (i === 0 || /[\s,=(:+\-*/<>[\{]/.test(raw[i - 1]))) {
      let j = i;
      while (j < raw.length && /[\d._xXa-fA-FbBoO]/.test(raw[j])) j++;
      tokens.push({ text: raw.slice(i, j), color: T.number }); i = j; continue;
    }
    if (/[a-zA-Z_$]/.test(raw[i])) {
      let j = i;
      while (j < raw.length && /[a-zA-Z0-9_$]/.test(raw[j])) j++;
      const word = raw.slice(i, j);
      tokens.push({ text: word, color: KEYWORDS.has(word) ? T.pink : /^[A-Z]/.test(word) ? T.purple : T.text });
      i = j; continue;
    }
    if (/[=<>!+\-*/%&|^?:,;.[\]{}()]/.test(raw[i])) { tokens.push({ text: raw[i], color: T.dim }); i++; continue; }
    tokens.push({ text: raw[i], color: T.text }); i++;
  }
  return tokens;
}

function SyntaxLine({ text, color }: { text: string; color?: string }) {
  if (color) return <span style={{ color }}>{text}</span>;
  const tokens = tokenizeLine(text);
  return <>{tokens.map((tok, i) => <span key={i} style={{ color: tok.color }}>{tok.text}</span>)}</>;
}

// ─── Block Types ──────────────────────────────────────────────────────────────────────────────────

type TerminalBlock =
  | { kind: "prompt";    content: string }
  | { kind: "operation"; verb: string; target: string; sub?: string }
  | { kind: "tree";      lines: { prefix: string; text: string; color?: string }[] }
  | { kind: "code";      lang: string; filename?: string; lines: string[] }
  | { kind: "diff";      removed: string; added: string }
  | { kind: "text";      lines: string[] }
  | { kind: "status";    text: string; elapsed?: string; tokens?: string; variant: "working" | "done" | "error" }
  | { kind: "divider";   label: string };

// ─── Content parser ───────────────────────────────────────────────────────────────────────────────

function inferVerb(content: string): string {
  const c = content.toLowerCase();
  if (c.includes("analyz"))   return "Analyze";
  if (c.includes("research")) return "Research";
  if (c.includes("generat") || c.includes("creat")) return "Generate";
  if (c.includes("build"))    return "Build";
  if (c.includes("audit"))    return "Audit";
  if (c.includes("simulat"))  return "Simulate";
  if (c.includes("compil") || c.includes("code") || c.includes("write")) return "Write";
  if (c.includes("read") || c.includes("search")) return "Read";
  return "Process";
}

function splitByCodeFences(content: string): { type: "text" | "code"; text: string; lang?: string }[] {
  const parts: { type: "text" | "code"; text: string; lang?: string }[] = [];
  const re = /```([a-z]*)\n([\s\S]*?)```/g;
  let last = 0; let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: "text", text: content.slice(last, match.index) });
    parts.push({ type: "code", lang: match[1] || "text", text: match[2] });
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push({ type: "text", text: content.slice(last) });
  return parts;
}

function parseMessage(msg: Message, chamberLabel: string, isStreaming: boolean): TerminalBlock[] {
  const blocks: TerminalBlock[] = [];
  if (msg.role === "user") { blocks.push({ kind: "prompt", content: msg.content }); return blocks; }
  if (!msg.content && isStreaming) { blocks.push({ kind: "status", text: "Thinking", variant: "working" }); return blocks; }
  blocks.push({ kind: "operation", verb: inferVerb(msg.content), target: chamberLabel });
  const parts = splitByCodeFences(msg.content);
  for (const part of parts) {
    if (part.type === "code") {
      blocks.push({ kind: "code", lang: part.lang ?? "text", lines: part.text.trimEnd().split("\n") });
    } else {
      const lines = part.text.split("\n"); const textLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^#{1,3}\s/.test(trimmed)) {
          if (textLines.length > 0) { blocks.push({ kind: "text", lines: [...textLines] }); textLines.length = 0; }
          blocks.push({ kind: "divider", label: trimmed.replace(/^#+\s/, "") }); continue;
        }
        textLines.push(line);
      }
      if (textLines.some(l => l.trim())) blocks.push({ kind: "text", lines: textLines });
    }
  }
  if (isStreaming) blocks.push({ kind: "status", text: "Streaming", variant: "working" });
  return blocks;
}

// ─── Block Renderers ─────────────────────────────────────────────────────────────────────────────

function BlockPrompt({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "flex-start" }}>
      <span style={{ color: T.dim, fontSize: "13px", fontFamily: "monospace", marginTop: "1px", flexShrink: 0, userSelect: "none" }}>›</span>
      <span style={{ color: T.dim, fontSize: "13px", fontFamily: "monospace", lineHeight: "1.55", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{content}</span>
    </div>
  );
}

function BlockOperation({ verb, target, sub }: { verb: string; target: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: T.green, fontSize: "11px", lineHeight: 1, flexShrink: 0 }}>●</span>
        <span style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: 1.4 }}>
          <span style={{ color: T.text, fontWeight: 500 }}>{verb}</span>
          <span style={{ color: T.dim }}>{"("}</span>
          <span style={{ color: T.cyan }}>{target}</span>
          <span style={{ color: T.dim }}>{")"}</span>
        </span>
      </div>
      {sub && <div style={{ paddingLeft: "18px", marginTop: "2px" }}><span style={{ color: T.dim, fontFamily: "monospace", fontSize: "12px" }}>└ {sub}</span></div>}
    </div>
  );
}

function BlockCode({ lines, lang, filename }: { lines: string[]; lang: string; filename?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const isLong = lines.length > 16;
  return (
    <div style={{ margin: "8px 0 12px", border: `1px solid ${T.line2}`, borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", background: T.surface, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: T.dim, fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>{lang || "text"}</span>
          {filename && <span style={{ color: T.cyan, fontSize: "10px", fontFamily: "monospace" }}>{filename}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "9px", color: T.dim }}>{lines.length} lines</span>
          {isLong && <button onClick={() => setCollapsed(c => !c)} style={{ fontFamily: "monospace", fontSize: "9px", color: T.amber, background: "transparent", border: "none", cursor: "pointer", outline: "none", padding: 0 }}>{collapsed ? "expand" : "collapse"}</button>}
        </div>
      </div>
      {!collapsed && (
        <div style={{ overflowX: "auto", padding: "10px 0" }}>
          {(isLong ? lines.slice(0, 24) : lines).map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", paddingRight: "16px", minHeight: "18px" }}>
              <span style={{ width: "36px", flexShrink: 0, textAlign: "right", paddingRight: "12px", fontFamily: "monospace", fontSize: "11px", color: T.dim2, userSelect: "none", lineHeight: "18px" }}>{i + 1}</span>
              <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace", fontSize: "12px", lineHeight: "18px", whiteSpace: "pre", flex: 1 }}><SyntaxLine text={line} /></span>
            </div>
          ))}
          {isLong && !collapsed && lines.length > 24 && (
            <div style={{ padding: "4px 0 0 36px" }}><span style={{ fontFamily: "monospace", fontSize: "10px", color: T.dim }}>… {lines.length - 24} more lines</span></div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockText({ lines }: { lines: string[] }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: "6px" }} />;
        const doneMatch   = trimmed.match(/^\[x\]\s+(.+)/i);
        const todoMatch   = trimmed.match(/^\[ \]\s+(.+)/);
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
        const treeMatch   = trimmed.match(/^(└|├|─)\s*/);
        if (doneMatch) return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "3px", paddingLeft: "2px" }}>
            <span style={{ color: T.green, fontSize: "11px", fontFamily: "monospace", flexShrink: 0, marginTop: "2px" }}>✓</span>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: T.dim, lineHeight: "1.5", textDecoration: "line-through" }}>{doneMatch[1]}</span>
          </div>
        );
        if (todoMatch) return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "3px", paddingLeft: "2px" }}>
            <span style={{ color: T.dim2, fontSize: "11px", fontFamily: "monospace", flexShrink: 0, marginTop: "2px", border: `1px solid ${T.dim2}`, width: "10px", height: "10px", borderRadius: "2px", display: "inline-block" }} />
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: T.text, lineHeight: "1.5" }}>{todoMatch[1]}</span>
          </div>
        );
        if (bulletMatch) return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "3px" }}>
            <span style={{ color: T.dim, fontSize: "11px", fontFamily: "monospace", flexShrink: 0, marginTop: "3px" }}>–</span>
            <span style={{ fontFamily: "monospace", fontSize: "12px", color: T.text, lineHeight: "1.55" }}><SyntaxLine text={bulletMatch[1]} /></span>
          </div>
        );
        if (treeMatch) return <div key={i} style={{ paddingLeft: "16px" }}><span style={{ fontFamily: "monospace", fontSize: "12px", color: T.dim }}>{trimmed}</span></div>;
        const boldLine = trimmed.replace(/\*\*(.+?)\*\*/g, "__BOLD:$1__");
        if (boldLine.includes("__BOLD:")) {
          const parts = boldLine.split(/(__BOLD:.+?__)/).filter(Boolean);
          return (
            <div key={i} style={{ marginBottom: "2px" }}>
              {parts.map((p, j) => {
                const m = p.match(/^__BOLD:(.+)__$/);
                return m
                  ? <span key={j} style={{ fontFamily: "monospace", fontSize: "12px", color: T.text, fontWeight: 700 }}>{m[1]}</span>
                  : <span key={j} style={{ fontFamily: "monospace", fontSize: "12px", color: T.text, lineHeight: "1.6" }}>{p}</span>;
              })}
            </div>
          );
        }
        if (trimmed.includes("`")) {
          const inlineParts = trimmed.split(/(`[^`]+`)/g);
          return (
            <div key={i} style={{ marginBottom: "2px", lineHeight: "1.6" }}>
              {inlineParts.map((p, j) =>
                p.startsWith("`") && p.endsWith("`")
                  ? <span key={j} style={{ fontFamily: "monospace", fontSize: "12px", color: T.amber, background: T.surface, padding: "0 3px", borderRadius: "2px" }}>{p.slice(1, -1)}</span>
                  : <span key={j} style={{ fontFamily: "monospace", fontSize: "12px", color: T.text }}>{p}</span>
              )}
            </div>
          );
        }
        return <div key={i} style={{ marginBottom: "2px" }}><span style={{ fontFamily: "monospace", fontSize: "12px", color: T.text, lineHeight: "1.6" }}>{trimmed}</span></div>;
      })}
    </div>
  );
}

function BlockDiff({ removed, added }: { removed: string; added: string }) {
  const removedLines = removed.split("\n").filter(Boolean);
  const addedLines   = added.split("\n").filter(Boolean);
  const maxLen = Math.max(removedLines.length, addedLines.length);
  return (
    <div style={{ margin: "6px 0 10px", border: `1px solid ${T.line2}`, borderRadius: "3px", overflow: "hidden", fontFamily: "monospace", fontSize: "12px" }}>
      {Array.from({ length: maxLen }, (_, i) => (
        <div key={i}>
          {removedLines[i] !== undefined && <div style={{ display: "flex", background: T.redBg, padding: "1px 10px" }}><span style={{ color: T.red, width: "20px", flexShrink: 0, userSelect: "none" }}>–</span><SyntaxLine text={removedLines[i]} color={T.red} /></div>}
          {addedLines[i]   !== undefined && <div style={{ display: "flex", background: T.greenBg, padding: "1px 10px" }}><span style={{ color: T.green, width: "20px", flexShrink: 0, userSelect: "none" }}>+</span><SyntaxLine text={addedLines[i]} color={T.green} /></div>}
        </div>
      ))}
    </div>
  );
}

function BlockDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0 8px", userSelect: "none" }}>
      <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: T.dim }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: T.line }} />
    </div>
  );
}

function BlockStatus({ text, elapsed, tokens, variant }: { text: string; elapsed?: string; tokens?: string; variant: "working" | "done" | "error"; }) {
  const color  = variant === "done" ? T.green : variant === "error" ? T.red : T.amber;
  const prefix = variant === "done" ? "✓" : variant === "error" ? "✗" : "*";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0 4px" }}>
      <span
        style={{
          color, fontFamily: "monospace", fontSize: "12px", userSelect: "none",
          animation: variant === "working" ? "rt-pulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        {prefix}
      </span>
      <span style={{ fontFamily: "monospace", fontSize: "12px", color }}>
        {text}
        {variant === "working" && (
          <span style={{ animation: "rt-pulse 1s ease-in-out infinite" }}>…</span>
        )}
      </span>
      {(elapsed || tokens) && (
        <span style={{ fontFamily: "monospace", fontSize: "10px", color: T.dim }}>
          ({[elapsed, tokens ? `↑ ${tokens}` : null].filter(Boolean).join(" · ")})
        </span>
      )}
    </div>
  );
}

function renderBlock(block: TerminalBlock, idx: number): React.ReactNode {
  switch (block.kind) {
    case "prompt":    return <BlockPrompt    key={idx} content={block.content} />;
    case "operation": return <BlockOperation key={idx} verb={block.verb} target={block.target} sub={block.sub} />;
    case "code":      return <BlockCode      key={idx} lines={block.lines} lang={block.lang} filename={block.filename} />;
    case "diff":      return <BlockDiff      key={idx} removed={block.removed} added={block.added} />;
    case "text":      return <BlockText      key={idx} lines={block.lines} />;
    case "status":    return <BlockStatus    key={idx} text={block.text} elapsed={block.elapsed} tokens={block.tokens} variant={block.variant} />;
    case "divider":   return <BlockDivider   key={idx} label={block.label} />;
    default:          return null;
  }
}

// ─── Cursor (CSS blink) ───────────────────────────────────────────────────────────────────────────────

function BlinkCursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "8px",
        height: "14px",
        background: T.text,
        verticalAlign: "middle",
        marginLeft: "2px",
        borderRadius: "1px",
        animation: "rt-blink 1.06s ease-in-out infinite",
      }}
    />
  );
}

// ─── Input area ─────────────────────────────────────────────────────────────────────────────────

function TerminalInput({ value, onChange, onSubmit, onCancel, disabled, placeholder }: { value: string; onChange: (v: string) => void; onSubmit: () => void; onCancel: () => void; disabled: boolean; placeholder: string; }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!disabled) inputRef.current?.focus(); }, [disabled]);
  return (
    <div style={{ borderTop: `1px solid ${T.line}`, background: T.bg, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: "8px" }} onClick={() => inputRef.current?.focus()}>
        <span style={{ fontFamily: "monospace", fontSize: "13px", color: T.dim, flexShrink: 0, userSelect: "none" }}>›</span>
        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && value.trim()) { e.preventDefault(); onSubmit(); }
            if (e.key === "Escape" && disabled) onCancel();
          }}
          disabled={disabled}
          placeholder={disabled ? "" : placeholder}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "monospace", fontSize: "13px", color: T.text, caretColor: T.text }}
        />
        {disabled && <BlinkCursor />}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 8px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: T.dim, letterSpacing: "0.05em" }}>
          {disabled ? (
            <button onClick={onCancel} style={{ fontFamily: "monospace", fontSize: "9px", color: T.amberDim, background: "transparent", border: "none", cursor: "pointer", outline: "none", padding: 0, letterSpacing: "0.05em" }}>esc to interrupt</button>
          ) : "↵ execute"}
        </span>
        {!disabled && value.trim() && (
          <button onClick={onSubmit} style={{ fontFamily: "monospace", fontSize: "9px", color: T.green, background: "transparent", border: `1px solid ${T.dim2}`, cursor: "pointer", outline: "none", padding: "2px 8px", borderRadius: "3px", letterSpacing: "0.06em" }}>execute</button>
        )}
      </div>
    </div>
  );
}

// ─── Main Terminal Component ──────────────────────────────────────────────────────────────────

export interface RuberraTerminalProps {
  messages:      Message[];
  isLoading:     boolean;
  draft:         string;
  onDraftChange: (v: string) => void;
  onSend:        (v: string) => void;
  onCancel:      () => void;
  chamberLabel:  string;
  placeholder?:  string;
  elapsedLabel?: string;
}

export function RuberraTerminal({ messages, isLoading, draft, onDraftChange, onSend, onCancel, chamberLabel, placeholder = "Enter directive…" }: RuberraTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, isLoading]);

  function submit() {
    const text = draft.trim();
    if (!text || isLoading) return;
    onDraftChange(""); onSend(text);
  }

  const allBlocks: TerminalBlock[] = [];
  if (messages.length === 0 && !isLoading) {
    allBlocks.push({ kind: "status", text: `RUBERRA · ${chamberLabel.toUpperCase()} TERMINAL`, variant: "done" });
    allBlocks.push({ kind: "divider", label: "Ready" });
  }
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
    allBlocks.push(...parseMessage(msg, chamberLabel, isLastAssistant && isLoading));
  }

  return (
    <>
      <style>{TERMINAL_KEYFRAMES}</style>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: T.bg, fontFamily: "monospace" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", height: "32px", background: T.surface, borderBottom: `1px solid ${T.line}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {["#3A3533", "#3A3533", "#3A3533"].map((c, i) => (
              <span key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "inline-block" }} />
            ))}
          </div>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: T.dim, letterSpacing: "0.06em", userSelect: "none" }}>
            ruberra — {chamberLabel.toLowerCase()} — {messages.length > 0 ? `${messages.filter(m => m.role === "user").length} commands` : "ready"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isLoading && (
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: T.amber, letterSpacing: "0.06em", animation: "rt-pulse 1.1s ease-in-out infinite" }}>
                running
              </span>
            )}
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: T.dim2 }}>
              {messages.length > 0 ? `${messages.filter(m => m.role === "assistant").length} outputs` : "0 outputs"}
            </span>
          </div>
        </div>

        {/* Output area */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
          {messages.length === 0 && !isLoading ? (
            <div style={{ paddingTop: "32px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: T.green, fontFamily: "monospace", fontSize: "11px" }}>●</span>
                <span style={{ color: T.dim, fontFamily: "monospace", fontSize: "11px" }}>RUBERRA {chamberLabel.toUpperCase()} TERMINAL</span>
              </div>
              <div style={{ paddingLeft: "18px" }}>
                <span style={{ color: T.dim2, fontFamily: "monospace", fontSize: "11px" }}>└ </span>
                <span style={{ color: T.dim2, fontFamily: "monospace", fontSize: "11px" }}>{placeholder}</span>
              </div>
              <div style={{ height: "8px" }} />
              <div style={{ color: T.dim2, fontFamily: "monospace", fontSize: "11px", paddingLeft: "2px" }}>
                ›  <span style={{ color: T.amberDim }}>ready for directive</span>
              </div>
            </div>
          ) : (
            <div>{allBlocks.map((block, i) => <div key={i}>{renderBlock(block, i)}</div>)}</div>
          )}
        </div>

        {/* Input */}
        <TerminalInput value={draft} onChange={onDraftChange} onSubmit={submit} onCancel={onCancel} disabled={isLoading} placeholder={placeholder} />
      </div>
    </>
  );
}
