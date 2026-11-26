import type { ReactNode } from "react";
import { Suspense } from "react";
import { FirstLoadEntrance } from "@/components/first-load-entrance";
import { HistoryFade } from "@/components/history-fade";

/**
 * The page grid. The nav card is a grid item, so it can't be outside the grid
 * container; instead the container is a plain element, the nav comes first,
 * and page content sits in a `display: contents` <main> (no grid cell of its
 * own) that the skip link targets.
 */
export const Grid = ({
  children,
  nav,
}: {
  children: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <>
      {/* Theme-aware page ambience */}
      <div className="site-backdrop pointer-events-none fixed inset-0 -z-10" />
      <div className="site-spotlight pointer-events-none fixed inset-0 -z-10 opacity-30" />

      <div className="site-grid">
        {nav}
        <main className="contents">
          <Suspense fallback={null}>
            <HistoryFade />
          </Suspense>
          <FirstLoadEntrance />
          <span className="sr-only" id="main-content" tabIndex={-1} />
          {children}
        </main>
      </div>
    </>
  );
};

export { GridCard } from "./card";
export {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  GridCardActivityFull,
  GridCardActivityLedger,
  GridCardActivityReview,
  HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
  LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "./card/activity";
export { GridCardEmptyState } from "./card/empty-state";
export {
  GridCardHero,
  GridCardHeroReference,
  HeroStage,
} from "./card/hero";
export { GridCardNav, GridCardNavItem } from "./card/nav";
export { GridCardNotFound } from "./card/not-found";
export { GridCardPostFull, GridCardPostLedger } from "./card/post";
export { GridCardProject, GridCardProjectHero } from "./card/project";
export { GridCardReferences } from "./card/references";
export { GridCardRelatedPosts } from "./card/related";
export { GridCardSection } from "./card/section";
export { GridCardTableOfContents } from "./card/table-of-contents";
export { GridCardUser } from "./card/user";
export { GridCardUserSocial } from "./card/user-social";
export {
  GRID_BREAKPOINTS,
  GRID_CARD_ROWS,
  GRID_HERO_PANELS,
  GRID_SLOTS,
  type GridBreakpoint,
  type GridSlot,
  getPostRailItemClass,
} from "./layout";
export { SkeletonCard, SkeletonGrid } from "./skeleton";
