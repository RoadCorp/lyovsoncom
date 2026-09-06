import { type ReactNode, Suspense } from "react";
import { SkeletonGrid } from "@/components/grid/skeleton";
import { ProfileSkeleton } from "@/components/grid/skeleton/profile-skeleton";
import { LoadingTransition } from "@/components/LoadingTransition";

export function PublicPageBoundary({
  children,
  detail = false,
}: {
  children: ReactNode;
  detail?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <LoadingTransition>
          {detail ? (
            <>
              <ProfileSkeleton />
              <SkeletonGrid count={2} />
            </>
          ) : (
            <SkeletonGrid />
          )}
        </LoadingTransition>
      }
    >
      {children}
    </Suspense>
  );
}
