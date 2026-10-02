import { SkeletonGrid } from "@/components/grid";
import { LoadingTransition } from "@/components/loading-transition";

export default function Loading() {
  return (
    <LoadingTransition>
      <SkeletonGrid count={4} />
    </LoadingTransition>
  );
}
