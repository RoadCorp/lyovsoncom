import { GRID_SLOTS } from "@/components/grid/layout";
import { SkeletonCard } from "./skeleton-card";

export function ProfileSkeleton() {
  return <SkeletonCard className={GRID_SLOTS.hero} />;
}
