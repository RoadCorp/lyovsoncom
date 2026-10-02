import { GridCard, GridCardSection } from "@/components/grid";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/*
 * Destination-shaped fallbacks for detail routes. Each one mirrors the
 * placement of the page it stands in for, and the route's loading.tsx and
 * its PublicPageBoundary render the same one, so nothing jumps when the
 * route fallback hands over to the page's own fallback.
 */

// GridCardHero and GridCardHeroActivity share this 2×1 placement.
const WIDE_HERO_PLACEMENT = cn(
  "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
  "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
  "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
  "g4:self-start"
);

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

function WideHeroSkeleton() {
  return (
    <GridCard className={cn("surface-card-loading", WIDE_HERO_PLACEMENT)}>
      <GridCardSection
        className="col-start-1 g3:col-start-1 col-end-4 g3:col-end-4 g3:row-start-1 row-start-1 g3:row-end-4 row-end-4"
        flush={true}
      >
        <Skeleton className="surface-chip h-full w-full" />
      </GridCardSection>
      <GridCardSection className="surface-title-stage col-start-1 g3:col-start-4 col-end-4 g3:col-end-7 g3:row-start-1 row-start-4 g3:row-end-4 row-end-7 flex flex-col items-center justify-center gap-3 px-6">
        <TitleLines />
        <div className="mt-2 flex w-full flex-col gap-2">
          <ProseLines count={3} />
        </div>
      </GridCardSection>
    </GridCard>
  );
}

function BodySkeleton({ className }: { className: string }) {
  return (
    <GridCard
      className={cn(
        "surface-card-loading aspect-auto h-[var(--grid-card-1x1)]",
        className
      )}
      interactive={false}
    >
      <GridCardSection className="col-span-3 row-span-3 flex flex-col gap-3 p-6">
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
function SquareCardSkeleton({ className }: { className: string }) {
  return (
    <GridCard className={cn("surface-card-loading", className)}>
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
      <BodySkeleton className="g2:col-start-2 g2:col-end-3 g3:col-end-4 g2:row-auto g2:row-start-3 g3:row-start-2 g3:w-[var(--grid-card-2x1)]" />
    </>
  );
}

export function NoteDetailSkeleton() {
  return (
    <>
      <SquareCardSkeleton className="col-start-1 g2:col-start-2 g3:col-start-2 col-end-2 g2:col-end-3 g3:col-end-3 g2:row-start-1 g3:row-start-1 row-start-2 g2:row-end-2 g3:row-end-2 row-end-3 g4:self-start" />
      <BodySkeleton className="g2:col-start-2 g3:col-start-2 g2:col-end-3 g3:col-end-3 g2:row-start-2 g3:row-start-2 g2:row-end-3 g3:row-end-3" />
    </>
  );
}

export function ActivityDetailSkeleton() {
  return (
    <>
      <WideHeroSkeleton />
      <SquareCardSkeleton className="col-start-1 g2:col-start-1 g3:col-start-1 g4:col-start-4 col-end-2 g2:col-end-2 g3:col-end-2 g4:col-end-5 g2:row-start-2 g3:row-start-2 g4:row-start-1 row-start-4 g2:row-end-3 g3:row-end-3 g4:row-end-2 row-end-5" />
      <BodySkeleton className="col-start-1 g2:col-start-2 g3:col-start-2 col-end-2 g2:col-end-3 g3:col-end-3" />
    </>
  );
}
