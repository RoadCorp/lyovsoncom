import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { ApexLozenge, CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { LexicalHeading } from "@/utilities/extract-lexical-headings";

export interface GridCardTableOfContentsProps {
  className?: string;
  headings: LexicalHeading[];
}

export const GridCardTableOfContents = ({
  className,
  headings,
}: GridCardTableOfContentsProps) => {
  if (headings.length === 0) {
    return null;
  }

  return (
    <GridCard
      aria-label="Table of contents"
      as="nav"
      className={cn("aspect-auto h-auto", className)}
      frameLabel="Contents"
      variant="content"
    >
      <GridCardSection className="surface-rail-panel relative p-5">
        <CornerKnots className="ornament-corner--rest" variant="ticks" />
        <ol className="relative z-1 flex flex-col gap-2">
          {headings.map((heading) => (
            <li className={cn(heading.level === 3 && "pl-4")} key={heading.id}>
              <a
                className={cn(
                  "ui-focus-ring ui-meta-link items-start gap-2.5 leading-snug",
                  heading.level === 2
                    ? "tone-heading text-sm font-medium"
                    : "tone-muted text-xs"
                )}
                href={`#${heading.id}`}
              >
                {heading.level === 2 ? (
                  <ApexLozenge
                    className="ornament-accent mt-1.5 shrink-0 opacity-75"
                    size={8}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="ornament-muted mt-1.5 inline-block h-px w-2 shrink-0 bg-current"
                  />
                )}
                <span className="min-w-0 break-words">{heading.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </GridCardSection>
    </GridCard>
  );
};
