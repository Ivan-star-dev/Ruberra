import { type MessageBlock, type BlockSection, type BlockItem, type StatusFlag } from "../types";

// ─── Status badge ────────────────────────────────────────────────────────────

function statusBadgeClass(status: StatusFlag): string {
  switch (status) {
    case "pass":
    case "done":
    case "live":
      return "bg-ruberra-pulse/10 text-ruberra-pulse";
    case "fail":
      return "bg-red-50 text-red-500";
    case "partial":
    case "warn":
      return "bg-amber-50 text-amber-600";
    case "running":
    case "current":
      return "bg-ruberra-accent/10 text-ruberra-accent";
    case "pending":
    case "skip":
    case "locked":
    default:
      return "bg-ruberra-border text-ruberra-muted";
  }
}

function StatusBadge({ status }: { status: StatusFlag }) {
  return (
    <span
      className={[
        "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
        statusBadgeClass(status),
      ].join(" ")}
    >
      {status}
    </span>
  );
}

// ─── Shared structure ────────────────────────────────────────────────────────

function BlockWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ruberra-border overflow-hidden bg-white">
      {children}
    </div>
  );
}

function BlockHeader({
  title,
  status,
  tag,
}: {
  title?:  string;
  status?: StatusFlag;
  tag?:    string;
}) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between border-b border-ruberra-border bg-ruberra-surface">
      <span className="text-sm font-medium text-ruberra-text truncate pr-2">
        {title ?? "Response"}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {tag && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ruberra-warm text-ruberra-subtext">
            {tag}
          </span>
        )}
        {status && <StatusBadge status={status} />}
      </span>
    </div>
  );
}

function SectionLabel({ heading }: { heading: string }) {
  if (!heading) return null;
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ruberra-subtext select-none">
      {heading}
    </p>
  );
}

function ItemRow({
  item,
  left,
}: {
  item:  BlockItem;
  left?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm text-ruberra-text">
      <span className="flex items-center gap-2 min-w-0">
        {left}
        <span className="truncate">{item.label}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {item.value && (
          <span className="text-ruberra-subtext text-xs">{item.value}</span>
        )}
        {item.status && <StatusBadge status={item.status} />}
      </span>
    </li>
  );
}

function NextMoveFooter({ next }: { next: string }) {
  return (
    <div className="px-4 py-2.5 border-t border-ruberra-border flex items-start gap-2">
      <span className="text-ruberra-accent text-sm font-medium shrink-0">→</span>
      <span className="text-sm text-ruberra-text">{next}</span>
    </div>
  );
}

// ─── Verdict ─────────────────────────────────────────────────────────────────

function VerdictBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockWrapper>
      <BlockHeader title={block.title} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <ItemRow
                key={ii}
                item={item}
                left={<span className="w-1.5 h-1.5 rounded-full bg-ruberra-border shrink-0" />}
              />
            ))}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockWrapper>
  );
}

// ─── Execution ───────────────────────────────────────────────────────────────

function stepIcon(status: StatusFlag | undefined): React.ReactNode {
  switch (status) {
    case "done":
    case "pass":
      return <span className="text-ruberra-pulse font-medium shrink-0">✓</span>;
    case "running":
    case "current":
      return <span className="text-ruberra-accent font-medium shrink-0">○</span>;
    case "fail":
      return <span className="text-red-500 font-medium shrink-0">✗</span>;
    case "pending":
    default:
      return <span className="text-ruberra-muted shrink-0">·</span>;
  }
}

function ExecutionBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockWrapper>
      <BlockHeader title={block.title} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <ItemRow key={ii} item={item} left={stepIcon(item.status)} />
            ))}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockWrapper>
  );
}

// ─── Lesson ──────────────────────────────────────────────────────────────────

function lessonIcon(status: StatusFlag | undefined): React.ReactNode {
  switch (status) {
    case "done":
    case "pass":
      return <span className="text-ruberra-pulse text-xs font-medium shrink-0">✓</span>;
    case "current":
    case "running":
      return <span className="text-ruberra-accent text-xs font-medium shrink-0">→</span>;
    case "locked":
      return <span className="text-ruberra-muted text-xs shrink-0">⊘</span>;
    default:
      return <span className="text-ruberra-muted text-xs shrink-0">·</span>;
  }
}

function LessonBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockWrapper>
      <BlockHeader
        title={block.title}
        status={block.status}
        tag={block.meta?.progress}
      />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <ItemRow key={ii} item={item} left={lessonIcon(item.status)} />
            ))}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockWrapper>
  );
}

// ─── Creation ────────────────────────────────────────────────────────────────

function TagChips({ tags }: { tags: string[] }) {
  return (
    <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ruberra-warm text-ruberra-subtext"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function CreationBlock({ block }: { block: MessageBlock }) {
  const hasTags = block.meta?.tags && block.meta.tags.length > 0;

  return (
    <BlockWrapper>
      <BlockHeader title={block.title} status={block.status} />
      {hasTags && <TagChips tags={block.meta!.tags!} />}
      {block.sections.map((section, si) => {
        const isArtifact = section.heading.toLowerCase().includes("artifact") ||
                           section.heading.toLowerCase().includes("output");
        return (
          <div key={si}>
            <SectionLabel heading={section.heading} />
            {isArtifact ? (
              <div className="mx-4 mb-3 rounded-lg border border-ruberra-border bg-ruberra-stone px-3 py-2.5">
                <ul>
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex items-center justify-between gap-2 py-1 text-sm text-ruberra-text">
                      <span className="truncate">{item.label}</span>
                      {item.value && (
                        <span className="text-ruberra-subtext text-xs font-mono">{item.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="pb-1">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-center justify-between gap-2 px-4 py-1.5 text-sm">
                    <span className="text-ruberra-subtext">{item.label}</span>
                    {item.value && (
                      <span className="text-ruberra-text font-mono text-xs">{item.value}</span>
                    )}
                    {item.status && <StatusBadge status={item.status} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockWrapper>
  );
}

// ─── Report ──────────────────────────────────────────────────────────────────

function ReportBlock({ block }: { block: MessageBlock }) {
  return (
    <BlockWrapper>
      <BlockHeader title={block.title} status={block.status} />
      {block.sections.map((section, si) => (
        <div key={si}>
          <SectionLabel heading={section.heading} />
          <ul className="pb-1">
            {section.items.map((item, ii) => (
              <li
                key={ii}
                className="flex items-start justify-between gap-2 px-4 py-1.5 text-sm border-b border-ruberra-border/50 last:border-0"
              >
                <span className="text-ruberra-text flex-1 min-w-0">{item.label}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {item.value && (
                    <span className="text-ruberra-subtext text-xs">{item.value}</span>
                  )}
                  {item.status && <StatusBadge status={item.status} />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {block.meta?.next && <NextMoveFooter next={block.meta.next} />}
    </BlockWrapper>
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
        }
      })}
    </div>
  );
}
