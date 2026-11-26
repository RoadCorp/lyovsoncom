import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { CornerKnots, EternityKnot } from "@/components/ornaments";
import { cn } from "@/lib/utils";

interface GridCardEmptyStateProps {
  className?: string;
  description: string;
  title: string;
}

export function GridCardEmptyState({
  title,
  description,
  className,
}: GridCardEmptyStateProps) {
  return (
    <GridCard className={cn(className)} interactive={false}>
      <GridCardSection className="col-span-3 row-span-3 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <CornerKnots inset="sm" variant="triquetra" />
        <EternityKnot className="ornament-accent relative z-1" size={22} />
        <h2 className="tone-heading relative z-1 text-2xl font-bold">
          {title}
        </h2>
        <p className="tone-muted relative z-1 text-sm leading-relaxed">
          {description}
        </p>
      </GridCardSection>
    </GridCard>
  );
}
