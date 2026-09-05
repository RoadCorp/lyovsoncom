import { SkeletonGrid } from "@/components/grid";
import { LoadingTransition } from "@/components/LoadingTransition";

export default function Loading() {
  return (
    <LoadingTransition>
      <SkeletonGrid />
    </LoadingTransition>
  );
}
