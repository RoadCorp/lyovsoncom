import { type ReactNode, Suspense } from "react";
import { SkeletonGrid } from "@/components/grid/skeleton";
import {
  ActivityDetailSkeleton,
  NoteDetailSkeleton,
  PostDetailSkeleton,
} from "@/components/grid/skeleton/detail-skeletons";
import { LoadingTransition } from "@/components/loading-transition";

export type PublicPageSkeleton = "activity" | "archive" | "note" | "post";

const SKELETONS: Record<PublicPageSkeleton, () => ReactNode> = {
  activity: ActivityDetailSkeleton,
  archive: () => <SkeletonGrid />,
  note: NoteDetailSkeleton,
  post: PostDetailSkeleton,
};

/**
 * Fallback for a public page. A route's loading.tsx should render the same
 * `PublicPageSkeleton`, so the two fallbacks never swap shapes.
 */
export function PublicPageFallback({
  skeleton = "archive",
}: {
  skeleton?: PublicPageSkeleton;
}) {
  const Skeleton = SKELETONS[skeleton];
  return (
    <LoadingTransition>
      <Skeleton />
    </LoadingTransition>
  );
}

export function PublicPageBoundary({
  children,
  skeleton = "archive",
}: {
  children: ReactNode;
  skeleton?: PublicPageSkeleton;
}) {
  return (
    <Suspense fallback={<PublicPageFallback skeleton={skeleton} />}>
      {children}
    </Suspense>
  );
}
