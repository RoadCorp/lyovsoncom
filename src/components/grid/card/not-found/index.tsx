import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";

export function GridCardNotFound({ className }: { className?: string }) {
  return (
    <GridCard className={cn(className)}>
      <GridCardSection className="col-span-3 row-span-3 flex flex-col items-center justify-center gap-2 text-center">
        <h2 className="tone-heading font-bold text-5xl">404</h2>
        <p className="tone-muted">This page could not be found.</p>
      </GridCardSection>
    </GridCard>
  );
}
