import { SkeletonCard } from "./skeleton-card";

export function ProfileSkeleton() {
  return (
    <SkeletonCard className="col-start-1 g2:col-start-2 g3:col-start-2 col-end-2 g2:col-end-3 g3:col-end-4 g2:row-start-1 g3:row-start-1 row-start-2 g2:row-end-3 g3:row-end-2 row-end-4 g3:h-[var(--grid-card-1x1)] h-[var(--grid-card-1x2)] g3:w-[var(--grid-card-2x1)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]" />
  );
}
