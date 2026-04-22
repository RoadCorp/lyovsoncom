import type { Metadata } from "next";
import { SkeletonCard, SkeletonGrid } from "@/components/grid/skeleton";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

export default function SkeletonPlayground() {
  return (
    <>
      {/* Single Skeleton Card */}
      <SkeletonCard />

      {/* Skeleton Grid with different counts */}
      <SkeletonGrid count={3} />

      {/* More skeleton cards to fill the grid */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />

      {/* Additional skeleton grid */}
      <SkeletonGrid count={6} />

      {/* More individual cards */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Skeleton Loading Demo",
    description:
      "Interactive demo showcasing skeleton loading components and animations used throughout Lyovson.com. See loading states in action.",
    canonicalPath: "/playground/skeleton",
    keywords: [
      "skeleton loading",
      "loading animations",
      "UI components",
      "demo",
      "web development",
    ],
    twitterCard: "summary",
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  }),
};
