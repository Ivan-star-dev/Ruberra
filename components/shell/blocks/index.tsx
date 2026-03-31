import { type MessageBlock, type BlockItem, type StatusFlag } from "../types";

// ─── Semantic color helpers — CSS-var based, works in dark + light ────────────

function statusBg(status: StatusFlag | undefined): string {
  switch (status) {
    case "pass": case "done": case "live":   return "color-mix(in srgb, var(--r-ok) 10%, var(--r-surface))";
    case "fail":                              return "color-mix(in srgb, var(--r-err) 10%, var(--r-surface))";
    case "partial": case "warn":             return "color-mix(in srgb, var(--r-warn) 10%, var(--r-surface))";
    case "running": case "current":          return "color-mix(in srgb, var(--r-accent) 8%, var(--r-surface))";
    default:                                 return "transparent";
  }
}

function statusColor(status: StatusFlag | undefined): string {
  switch (status) {
    case "pass": case "done": case "live":   return "var(--r-ok)";
    case "fail":                              return "var(--r-err)";
    case "partial": case "warn":             return "var(--r-warn)";
    case "running": case "current":          return "var(--r-accent)";
    default:                                 return "var(--r-muted)";
  }
}

function statusBadgeStyle(status: StatusFlag): React.CSSProperties {
  return {
    backgroundColor: statusBg(status),
    color:           statusColor(status),
    border:          `1px solid color-mix(in srgb, ${statusColor(status)} 30%, var(--r-border))`,
  };
}

// Mutation prefix — diff-style symbol per status
const MUTATION: Record<string, { symbol: string }> = {
  pass:    { symbol: "+" },
  done:    { symbol: "+" },
  live:    { symbol: "+" },
  fail:    { symbol: "−" },
  warn:    { symbol: "~" },
  partial: { symbol: "~" },
  running: { symbol: "›" },
  current: { symbol: "›" },
  pending: { symbol: "·" },
  skip:    { symbol: "·" },
  locked:  { symbol: "·" },
};

export function StatusBadge({ status }: { status: StatusFlag }) {
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 capitalize"
      style={statusBadgeStyle(status)}
    >
      {status}
    </span>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ heading }: { heading: string }) {
  if (!heading) return null;
  return (
    <p
      className="px-4 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] select-none"
      style={{ color: "var(--r-subtext)" }}
    >
      {heading}
    </p>
  );
}

function NextMoveFooter({ next }: { next: string }) {
  return (
    <div
      className="px-4 py-2.5 flex items-start gap-2 border-t"
      style={{ borderColor: "var(--r-border-soft)", backgroundColor: "var(--r-elevated)" }}
    >
      <span className="text-sm font-semibold shrink-0 font-mono" style={{ color: "var(--r-accent)" }}>→</span>
      <span className="text-sm" style={{ color: "var(--r-text)" }}>{next}</span>
    </div>
  );
}

// ─── StateRail — shared rail for Execution + Lesson ──────────────────────────

type RailMode = "execution" | "lesson";

function RailCircle({ status, mode }: { status: StatusFlag | undefined; mode: RailMode }) {
  const isDone    = status === "done" || status === "pass";
  const isActive  = status === "running" || status === "current";
  const isFailed  = status === "fail";
  const isLocked  = status === "locked";

  const borderColor =
    isDone   ? "var(--r-ok)"      :
    isActive ? "var(--r-accent)"  :
    isFailed ? "var(--r-err)"     :
    isLocked ? "var(--r-dim)"     :
    "var(--r-border)";

  const bgColor =
    isDone   ? "color-mix(in srgb, var(--r-ok) 12%, var(--r-surface))"     :
    isActive ? "color-mix(in srgb, var(--r-accent) 12%, var(--r-surface))" :
    isFailed ? "color-mix(in srgb, var(--r-err) 12%, var(--r-surface))"    :
    "var(--r-surface)";

  return (
    <div
      className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      {isDone && (
        <span className="text-[9px] font-bold leading-none" style={{ color: "var(--r-ok)" }}>✓</span>
      )}
      {isActive && mode === "execution" && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--r-accent)" }} />
      )}
      {isActive && mode === "lesson" && (
        <span className="text-[9px] font-bold leading-none" style={{ color: "var(--r-accent)" }}>→</span>
      )}
      {isFailed && (
        <span className="text-[9px] font-bold leading-none" style={{ color: "var(--r-err)" }}>✗</span>
      )}
      {isLocked && (
        <span className="text-[9px] leading-none" style={{ color: "var(--r-muted)" }}>⊘</span>
      )}
      {!isDone && !isActive && !isFailed && !isLocked && (
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--r-dim)" }} />
      )}
    </div>
  );
}

function railLineColor(status: StatusFlag | undefined): string {
  switch (status) {
    case "done": case "pass":     return "var(--r-ok)";
    case "running": case "current": return "var(--r-accent)";
    case "fail":                  return "var(--r-err)";
    default:                      return "var(--r-border)";
  }
}

function StateRail({ items, mode }: { items: BlockItem[]; mode: RailMode }) {
  return (
    <div className="relative py-1">
      <div className="absolute left-[27px] top-3 bottom-3 w-px" style={{ backgroundColor: "var(--r-border)" }} />
      {items.map((item, ii) => {
        const isDone   = item.status === "done" || item.status === "pass";
        const isActive = item.status === "running" || item.status === "current";
        const isFailed = item.status === "fail";
        const isLast   = ii === items.length - 1;
        return (
          <div key={ii} className="flex items-start gap-3 px-4 py-1.5 relative">
            {!isLast && (
              <div
                className="absolute left-[27px] top-[22px] bottom-0 w-px"
                style={{ backgroundColor: railLineColor(item.status) }}
              />
            )}
            <RailCircle status={item.status} mode={mode} />
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mt-0.5">
              <span
                className="text-sm"
                style={{
                  textDecoration: isDone ? "line-through" : "none",
                  color: isDone   ? "var(--r-muted)"    :
                         isActive ? "var(--r-text)"     :
                         isFailed ? "var(--r-err)"      :
                         "var(--r-subtext)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
                {item.value && !isDone && (
                  <span
                    className="ml-2 font-normal font-mono text-xs"
                    style={{ color: statusColor(item.status) }}
                  >
                    {item.value}
                  </span>
                )}
              </span>
              {(isActive || isFailed) && item.status && <StatusBadge status={item.status} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Block container primitive ────────────────────────────────────────────────

function BlockCard({
  children,
  heavy = false,
}: {
  children: React.ReactNode;
  heavy?: boolean;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "var(--r-surface)",
        border: heavy
          ? `2px solid color-mix(in srgb, var(--r-text) 18%, var(--r-border))`
          : `1px solid var(--r-border)`,
        borderRadius: "6px",
      }}
    >
      {children}
    </div>
  );
}

function BlockHeader({
  title,
  status,
  right,
}: {
  title: string;
  status?: StatusFlag;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between border-b"
      style={{
        borderColor: "var(--r-border-soft)",
        backgroundColor: "var(--r-elevated)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {status && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: statusColor(status) }}
          />
        )}
        <span
          className="text-sm font-medium truncate"
          style={{ color: "var(--r-text)" }}
        >
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {right}
        {status && <StatusBadge status={status} />}
      </div>
    </div>
  );
}

// ─── Verdict — heaviest weight ────────────────────────────────────────────────

function VerdictBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockCard heavy>
      <BlockHeader title={block.title ?? "Verdict"} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <li
                key={ii}
                className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm border-b last:border-b-0"
                style={{
                  backgroundColor: statusBg(item.status),
                  borderColor: "var(--r-border-soft)",
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--r-border)" }}
                  />
                  <span className="truncate" style={{ color: "var(--r-text)" }}>{item.label}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {item.value && (
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: statusColor(item.status) }}
                    >
                      {item.value}
                    </span>
                  )}
                  {item.status && <StatusBadge status={item.status} />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockCard>
  );
}

// ─── Execution — step rail ────────────────────────────────────────────────────

function ExecutionBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockCard>
      <BlockHeader title={block.title ?? "Execution"} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <StateRail items={section.items} mode="execution" />
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockCard>
  );
}

// ─── Lesson — progression rail ────────────────────────────────────────────────

function LessonBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockCard>
      <BlockHeader
        title={block.title ?? "Lesson"}
        status={block.status}
        right={
          block.meta?.progress ? (
            <span
              className="font-mono text-[10px] border px-1.5 py-0.5"
              style={{
                color: "var(--r-subtext)",
                borderColor: "var(--r-border)",
                backgroundColor: "var(--r-elevated)",
              }}
            >
              {block.meta.progress}
            </span>
          ) : undefined
        }
      />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <StateRail items={section.items} mode="lesson" />
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockCard>
  );
}

// ─── Creation ─────────────────────────────────────────────────────────────────

function CreationBlock({ block }: { block: MessageBlock }) {
  const hasTags = block.meta?.tags && block.meta.tags.length > 0;
  return (
    <BlockCard>
      <BlockHeader
        title={block.title ?? "Creation"}
        status={block.status}
        right={
          hasTags ? (
            <>
              {block.meta!.tags!.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-1.5 py-0.5 border"
                  style={{
                    color: "var(--r-subtext)",
                    borderColor: "var(--r-border)",
                    backgroundColor: "var(--r-elevated)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </>
          ) : undefined
        }
      />
      {block.sections.map((section, si) => {
        const isArtifact =
          section.heading.toLowerCase().includes("artifact") ||
          section.heading.toLowerCase().includes("output");
        return (
          <div key={si}>
            <SectionLabel heading={section.heading} />
            {isArtifact ? (
              <div
                className="mx-4 mb-3 px-3 py-2.5 border"
                style={{
                  borderColor: "var(--r-border)",
                  backgroundColor: "var(--r-elevated)",
                }}
              >
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex items-center justify-between gap-2 py-1 text-sm">
                    <span style={{ color: "var(--r-text)" }}>{item.label}</span>
                    {item.value && (
                      <span
                        className="font-mono text-xs"
                        style={{ color: statusColor(item.status) }}
                      >
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="pb-1">
                {section.items.map((item, ii) => (
                  <li
                    key={ii}
                    className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm border-b last:border-b-0"
                    style={{ borderColor: "var(--r-border-soft)" }}
                  >
                    <span style={{ color: "var(--r-subtext)" }}>{item.label}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {item.value && (
                        <span
                          className="font-mono text-xs"
                          style={{ color: statusColor(item.status) }}
                        >
                          {item.value}
                        </span>
                      )}
                      {item.status && <StatusBadge status={item.status} />}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockCard>
  );
}

// ─── Report — mutation diff rows ──────────────────────────────────────────────

function ReportBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockCard>
      <BlockHeader title={block.title ?? "Report"} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => {
              const mut = item.status ? (MUTATION[item.status] ?? MUTATION.pending) : null;
              return (
                <li
                  key={ii}
                  className="flex items-start justify-between gap-2 px-4 py-1.5 text-sm border-b last:border-b-0"
                  style={{
                    backgroundColor: statusBg(item.status),
                    borderColor: "var(--r-border-soft)",
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {mut && (
                      <span
                        className="font-mono text-[11px] font-semibold shrink-0 w-3"
                        style={{ color: statusColor(item.status) }}
                      >
                        {mut.symbol}
                      </span>
                    )}
                    <span style={{ color: "var(--r-text)", flex: 1 }}>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {item.value && (
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: statusColor(item.status) }}
                      >
                        {item.value}
                      </span>
                    )}
                    {item.status && <StatusBadge status={item.status} />}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockCard>
  );
}

// ─── Signal — flat meta pulse ─────────────────────────────────────────────────

function SignalBlock({ block }: { block: MessageBlock }) {
  const allItems = block.sections.flatMap((s) => s.items);
  return (
    <div className="flex items-center gap-1 text-[11px] py-1.5 flex-wrap">
      <span className="font-mono font-semibold shrink-0 mr-1" style={{ color: "var(--r-warn)" }}>*</span>
      {block.title && (
        <span
          className="font-mono mr-2 shrink-0 uppercase text-[9px] tracking-widest"
          style={{ color: "var(--r-muted)" }}
        >
          {block.title}
        </span>
      )}
      {allItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          {i > 0 && (
            <span className="mx-1 select-none" style={{ color: "var(--r-border)" }}>·</span>
          )}
          <span style={{ color: "var(--r-subtext)" }}>{item.label}</span>
          {item.status ? (
            <StatusBadge status={item.status} />
          ) : item.value ? (
            <span className="font-mono font-medium ml-0.5" style={{ color: "var(--r-text)" }}>
              {item.value}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function BlockRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="space-y-2 mt-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "verdict":   return <VerdictBlock   key={i} block={block} />;
          case "execution": return <ExecutionBlock key={i} block={block} />;
          case "lesson":    return <LessonBlock    key={i} block={block} />;
          case "creation":  return <CreationBlock  key={i} block={block} />;
          case "report":    return <ReportBlock    key={i} block={block} />;
          case "signal":    return <SignalBlock     key={i} block={block} />;
        }
      })}
    </div>
  );
}
