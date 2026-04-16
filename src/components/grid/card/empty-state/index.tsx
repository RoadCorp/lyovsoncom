import { GridCard, GridCardSection } from "@/components/grid";
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
        <h2 className="tone-heading font-bold text-2xl">{title}</h2>
        <p className="tone-muted text-sm leading-relaxed">{description}</p>
      </GridCardSection>
    </GridCard>
  );
}
