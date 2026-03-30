import { type MessageBlock, type BlockItem, type StatusFlag } from "../types";

// ─── Semantic color system ────────────────────────────────────────────────────

function statusBadgeClass(status: StatusFlag): string {
  switch (status) {
    case "pass": case "done": case "live":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "fail":
      return "bg-red-50 text-red-700 border border-red-200";
    case "partial": case "warn":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "running": case "current":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    case "pending": case "skip": case "locked": default:
      return "bg-stone-100 text-stone-500 border border-stone-200";
  }
}

function statusRowBg(status: StatusFlag | undefined): string {
  switch (status) {
    case "pass": case "done": case "live":    return "bg-emerald-50/70";
    case "fail":                               return "bg-red-50/70";
    case "partial": case "warn":              return "bg-amber-50/70";
    case "running": case "current":           return "bg-indigo-50/50";
    default:                                  return "";
  }
}

function valueColor(status: StatusFlag | undefined): string {
  switch (status) {
    case "pass": case "done": case "live":    return "text-emerald-600";
    case "fail":                               return "text-red-600";
    case "partial": case "warn":              return "text-amber-600";
    case "running": case "current":           return "text-indigo-600";
    default:                                  return "text-ruberra-subtext";
  }
}

// Mutation prefix DNA — maps status to a mono diff symbol
const MUTATION: Record<string, { symbol: string; color: string }> = {
  pass:    { symbol: "+", color: "text-emerald-600" },
  done:    { symbol: "+", color: "text-emerald-600" },
  live:    { symbol: "+", color: "text-emerald-600" },
  fail:    { symbol: "−", color: "text-red-600"     },
  warn:    { symbol: "~", color: "text-amber-600"   },
  partial: { symbol: "~", color: "text-amber-600"   },
  running: { symbol: "›", color: "text-indigo-600"  },
  current: { symbol: "›", color: "text-indigo-600"  },
  pending: { symbol: "·", color: "text-stone-400"   },
  skip:    { symbol: "·", color: "text-stone-400"   },
  locked:  { symbol: "·", color: "text-stone-400"   },
};

export function StatusBadge({ status }: { status: StatusFlag }) {
  return (
    <span className={["text-[10px] font-medium px-1.5 py-0.5 rounded capitalize", statusBadgeClass(status)].join(" ")}>
      {status}
    </span>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ heading }: { heading: string }) {
  if (!heading) return null;
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ruberra-muted select-none">
      {heading}
    </p>
  );
}

function NextMoveFooter({ next }: { next: string }) {
  return (
    <div className="px-4 py-2.5 border-t border-ruberra-border flex items-start gap-2 bg-ruberra-surface">
      <span className="text-ruberra-accent text-sm font-semibold shrink-0 font-mono">→</span>
      <span className="text-sm text-ruberra-text">{next}</span>
    </div>
  );
}

// ─── StateRail — shared rail for Execution + Lesson ──────────────────────────

type RailMode = "execution" | "lesson";

function railColor(status: StatusFlag | undefined): string {
  switch (status) {
    case "done": case "pass":             return "bg-emerald-200";
    case "running": case "current":       return "bg-indigo-200";
    case "fail":                          return "bg-red-200";
    default:                              return "bg-ruberra-border";
  }
}

function RailCircle({ status, mode }: { status: StatusFlag | undefined; mode: RailMode }) {
  const isDone    = status === "done" || status === "pass";
  const isActive  = status === "running" || status === "current";
  const isFailed  = status === "fail";
  const isLocked  = status === "locked";

  if (mode === "lesson") {
    return (
      <div className={[
        "relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2",
        isDone   ? "bg-emerald-50 border-emerald-400" :
        isActive ? "bg-indigo-50 border-indigo-400"   :
        isLocked ? "bg-stone-50 border-stone-200"     :
        "bg-white border-ruberra-border",
      ].join(" ")}>
        {isDone   && <span className="text-emerald-600 text-[9px] font-bold leading-none">✓</span>}
        {isActive && <span className="text-indigo-600 text-[9px] font-bold leading-none">→</span>}
        {isLocked && <span className="text-stone-400 text-[9px] leading-none">⊘</span>}
        {!isDone && !isActive && !isLocked && <span className="w-1 h-1 rounded-full bg-stone-300" />}
      </div>
    );
  }

  return (
    <div className={[
      "relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2",
      isDone   ? "bg-emerald-50 border-emerald-400" :
      isActive ? "bg-indigo-50 border-indigo-400"   :
      isFailed ? "bg-red-50 border-red-400"         :
      "bg-white border-ruberra-border",
    ].join(" ")}>
      {isDone   && <span className="text-emerald-600 text-[9px] font-bold leading-none">✓</span>}
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
      {isFailed && <span className="text-red-500 text-[9px] font-bold leading-none">✗</span>}
      {!isDone && !isActive && !isFailed && <span className="w-1 h-1 rounded-full bg-stone-300" />}
    </div>
  );
}

function StateRail({ items, mode }: { items: BlockItem[]; mode: RailMode }) {
  return (
    <div className="relative py-1">
      <div className="absolute left-[27px] top-3 bottom-3 w-px bg-ruberra-border" />
      {items.map((item, ii) => {
        const isDone   = item.status === "done" || item.status === "pass";
        const isActive = item.status === "running" || item.status === "current";
        const isFailed = item.status === "fail";
        const isLast   = ii === items.length - 1;
        return (
          <div key={ii} className="flex items-start gap-3 px-4 py-1.5 relative">
            {!isLast && (
              <div className={["absolute left-[27px] top-[22px] bottom-0 w-px", railColor(item.status)].join(" ")} />
            )}
            <RailCircle status={item.status} mode={mode} />
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2 mt-0.5">
              <span className={[
                "text-sm",
                isDone   ? "line-through text-ruberra-muted" :
                isActive ? "text-ruberra-text font-medium"   :
                isFailed ? "text-red-700"                    :
                "text-ruberra-subtext",
              ].join(" ")}>
                {item.label}
                {item.value && !isDone && (
                  <span className={["ml-2 font-normal font-mono text-xs", valueColor(item.status)].join(" ")}>
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

// ─── Verdict — heaviest weight ────────────────────────────────────────────────

function VerdictBlock({ block }: { block: MessageBlock }) {
  return (
    <div className="rounded-xl border-2 border-ruberra-text/20 overflow-hidden bg-white">
      <div className="px-4 py-3 flex items-center justify-between border-b-2 border-ruberra-text/10 bg-ruberra-stone">
        <span className="text-sm font-semibold text-ruberra-text truncate pr-2">
          {block.title ?? "Verdict"}
        </span>
        {block.status && <StatusBadge status={block.status} />}
      </div>
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <li
                key={ii}
                className={["flex items-center justify-between gap-2 px-4 py-1.5 text-sm", statusRowBg(item.status)].join(" ")}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-1 h-1 rounded-full bg-ruberra-border shrink-0" />
                  <span className="truncate text-ruberra-text">{item.label}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {item.value && (
                    <span className={["font-mono text-[11px]", valueColor(item.status)].join(" ")}>
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
    </div>
  );
}

// ─── Execution — step rail ────────────────────────────────────────────────────

function ExecutionBlock({ block }: { block: MessageBlock }) {
  return (
    <div className="rounded-xl border border-ruberra-border overflow-hidden bg-white">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-ruberra-border bg-ruberra-accent/5">
        <span className="text-sm font-medium text-ruberra-text truncate pr-2">
          {block.title ?? "Execution"}
        </span>
        {block.status && <StatusBadge status={block.status} />}
      </div>
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <StateRail items={section.items} mode="execution" />
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </div>
  );
}

// ─── Lesson — progression rail ────────────────────────────────────────────────

function LessonBlock({ block }: { block: MessageBlock }) {
  return (
    <div className="rounded-xl border border-ruberra-border overflow-hidden bg-white">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-ruberra-border bg-ruberra-surface">
        <span className="text-sm font-medium text-ruberra-text truncate pr-2">
          {block.title ?? "Lesson"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {block.meta?.progress && (
            <span className="font-mono text-[10px] text-ruberra-subtext border border-ruberra-border px-1.5 py-0.5 rounded">
              {block.meta.progress}
            </span>
          )}
          {block.status && <StatusBadge status={block.status} />}
        </div>
      </div>
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <StateRail items={section.items} mode="lesson" />
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </div>
  );
}

// ─── Creation ────────────────────────────────────────────────────────────────

function CreationBlock({ block }: { block: MessageBlock }) {
  const hasTags = block.meta?.tags && block.meta.tags.length > 0;
  return (
    <div className="rounded-xl border border-ruberra-border overflow-hidden bg-white">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-ruberra-border bg-ruberra-surface">
        <span className="text-sm font-medium text-ruberra-text truncate pr-2">
          {block.title ?? "Creation"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {hasTags && block.meta!.tags!.map((tag, i) => (
            <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-ruberra-warm text-ruberra-subtext border border-ruberra-border">
              {tag}
            </span>
          ))}
          {block.status && <StatusBadge status={block.status} />}
        </div>
      </div>
      {block.sections.map((section, si) => {
        const isArtifact = section.heading.toLowerCase().includes("artifact") ||
                           section.heading.toLowerCase().includes("output");
        return (
          <div key={si}>
            <SectionLabel heading={section.heading} />
            {isArtifact ? (
              <div className="mx-4 mb-3 rounded-lg border border-ruberra-border bg-ruberra-stone px-3 py-2.5">
                {section.items.map((item, ii) => (
                  <div key={ii} className="flex items-center justify-between gap-2 py-1 text-sm">
                    <span className="text-ruberra-text truncate">{item.label}</span>
                    {item.value && (
                      <span className={["font-mono text-xs", valueColor(item.status)].join(" ")}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="pb-1">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm">
                    <span className="text-ruberra-subtext">{item.label}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {item.value && (
                        <span className={["font-mono text-xs", valueColor(item.status)].join(" ")}>
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
    </div>
  );
}

// ─── Report — mutation diff rows ─────────────────────────────────────────────

function ReportBlock({ block }: { block: MessageBlock }) {
  return (
    <div className="rounded-xl border border-ruberra-border overflow-hidden bg-white">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-ruberra-border bg-ruberra-surface">
        <span className="text-sm font-medium text-ruberra-text truncate pr-2">
          {block.title ?? "Report"}
        </span>
        {block.status && <StatusBadge status={block.status} />}
      </div>
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => {
              const mut = item.status ? (MUTATION[item.status] ?? MUTATION.pending) : null;
              return (
                <li
                  key={ii}
                  className={[
                    "flex items-start justify-between gap-2 px-4 py-1.5 text-sm border-b border-ruberra-border/40 last:border-0",
                    statusRowBg(item.status),
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {mut && (
                      <span className={["font-mono text-[11px] font-semibold shrink-0 w-3", mut.color].join(" ")}>
                        {mut.symbol}
                      </span>
                    )}
                    <span className="text-ruberra-text flex-1 min-w-0">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {item.value && (
                      <span className={["font-mono text-[11px]", valueColor(item.status)].join(" ")}>
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
    </div>
  );
}

// ─── Signal — `*` meta line ───────────────────────────────────────────────────
// Flat unbordered strip — machine metadata pulse, not UI chrome

function SignalBlock({ block }: { block: MessageBlock }) {
  const allItems = block.sections.flatMap((s) => s.items);
  return (
    <div className="flex items-center gap-1 text-[11px] py-1.5 flex-wrap">
      <span className="font-mono font-semibold text-amber-500 shrink-0 mr-1">*</span>
      {block.title && (
        <span className="font-mono text-ruberra-muted mr-2 shrink-0 uppercase text-[9px] tracking-widest">
          {block.title}
        </span>
      )}
      {allItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          {i > 0 && <span className="text-ruberra-border mx-1 select-none">·</span>}
          <span className="text-ruberra-subtext">{item.label}</span>
          {item.status ? (
            <StatusBadge status={item.status} />
          ) : item.value ? (
            <span className="font-mono font-medium text-ruberra-text ml-0.5">{item.value}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export function BlockRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="space-y-2">
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
