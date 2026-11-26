import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import type { GridSlot } from "@/components/grid/layout";
import { GRID_HERO_PANELS } from "@/components/grid/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/*
 * Destination-shaped fallbacks for detail routes. Each one mirrors the
 * placement of the page it stands in for via shared `GRID_SLOTS`, and the
 * route's loading.tsx and its PublicPageBoundary render the same one, so
 * nothing jumps when the route fallback hands over to the page's own fallback.
 */

const PROSE_LINE_WIDTHS = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-4/5",
  "w-full",
  "w-10/12",
  "w-3/5",
] as const;

function ProseLines({ count = PROSE_LINE_WIDTHS.length }: { count?: number }) {
  return PROSE_LINE_WIDTHS.slice(0, count).map((width) => (
    <Skeleton className={cn("surface-chip h-4", width)} key={width} />
  ));
}

function TitleLines() {
  return (
    <>
      <Skeleton className="surface-chip h-7 w-4/5" />
      <Skeleton className="surface-chip h-7 w-3/5" />
    </>
  );
}

export function WideHeroSkeleton() {
  return (
    <GridCard className="surface-card-loading" slot="hero">
      <GridCardSection className={GRID_HERO_PANELS.media} flush={true}>
        <Skeleton className="surface-chip h-full w-full" />
      </GridCardSection>
      <GridCardSection
        className={cn(
          "surface-title-stage flex flex-col items-center justify-center gap-3 px-6",
          GRID_HERO_PANELS.stage
        )}
      >
        <TitleLines />
        <div className="mt-2 flex w-full flex-col gap-2">
          <ProseLines count={3} />
        </div>
      </GridCardSection>
    </GridCard>
  );
}

function BodySkeleton({
  className,
  slot,
}: {
  className?: string;
  slot?: GridSlot;
}) {
  return (
    <GridCard
      className={cn("surface-card-loading h-[var(--grid-card-1x1)]", className)}
      interactive={false}
      slot={slot}
      variant="content"
    >
      <GridCardSection className="flex flex-col gap-3 p-6">
        <ProseLines />
        <div className="h-2" />
        <ProseLines count={4} />
      </GridCardSection>
    </GridCard>
  );
}

function RailCells() {
  return (
    <>
      {(
        [
          "col-start-1 col-end-2",
          "col-start-2 col-end-3",
          "col-start-3 col-end-4",
        ] as const
      ).map((columns) => (
        <GridCardSection
          className={cn(
            "surface-rail-panel row-start-3 row-end-4 flex items-center justify-center",
            columns
          )}
          key={columns}
        >
          <Skeleton className="surface-chip h-5 w-14" />
        </GridCardSection>
      ))}
    </>
  );
}

/** A 1×1 card with a title well and a three-cell rail. */
function SquareCardSkeleton({ slot }: { slot: GridSlot }) {
  return (
    <GridCard className="surface-card-loading" slot={slot}>
      <GridCardSection className="surface-title-stage col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-3 px-6">
        <TitleLines />
      </GridCardSection>
      <RailCells />
    </GridCard>
  );
}

export function PostDetailSkeleton() {
  return (
    <>
      <WideHeroSkeleton />
      <BodySkeleton slot="bodyBelowHero" />
    </>
  );
}

export function ReferenceDetailSkeleton() {
  return (
    <>
      <WideHeroSkeleton />
      <SquareCardSkeleton slot="referenceFirstEntry" />
      <BodySkeleton className="g2:col-start-2 g3:col-start-2 g2:col-end-3 g3:col-end-3 col-start-1 col-end-2" />
    </>
  );
}
