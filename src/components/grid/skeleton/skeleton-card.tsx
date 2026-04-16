import { GridCard, GridCardSection } from "@/components/grid";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <GridCard className="surface-card-loading">
      {/* Image placeholder - takes up first two rows and columns */}
      <GridCardSection
        className={"col-start-1 col-end-3 row-start-1 row-end-3"}
      >
        <Skeleton className="surface-chip h-full w-full" />
      </GridCardSection>

      {/* Title section */}
      <GridCardSection
        className={
          "col-start-1 col-end-4 row-start-3 row-end-4 flex h-full flex-col justify-center"
        }
      >
        <Skeleton className="surface-chip mx-auto h-6 w-3/4" />
      </GridCardSection>

      {/* Topics section */}
      <GridCardSection
        className={
          "card-rail-stack card-topic-stack col-start-3 col-end-4 row-start-2 row-end-3"
        }
      >
        <Skeleton className="surface-chip h-5 w-16" />
        <Skeleton className="surface-chip h-5 w-20" />
      </GridCardSection>

      {/* Author and date section */}
      <GridCardSection
        className={
          "card-rail-stack card-meta-stack col-start-3 col-end-4 row-start-1 row-end-2"
        }
      >
        <div className="flex items-center gap-2">
          <Skeleton className="surface-chip h-5 w-5 rounded-full" />
          <Skeleton className="surface-chip h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="surface-chip h-5 w-5 rounded-full" />
          <Skeleton className="surface-chip h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="surface-chip h-5 w-5 rounded-full" />
          <Skeleton className="surface-chip h-4 w-16" />
        </div>
      </GridCardSection>
    </GridCard>
  );
}
