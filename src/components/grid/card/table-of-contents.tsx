import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { LexicalHeading } from "@/utilities/extract-lexical-headings";
import { TableOfContentsList } from "./table-of-contents-list";

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
        <TableOfContentsList headings={headings} />
      </GridCardSection>
    </GridCard>
  );
};
