import type { LucideIcon } from "lucide-react";
import { Camera, FileText, Headphones, Star, Video } from "lucide-react";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { IntentLink } from "@/components/intent-link";
import { ApexLozenge, CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { PostTypeCounts } from "@/utilities/get-post";
import type { PostFilterType } from "@/utilities/post-type";
import { POST_FILTER_TYPES, POST_TYPE_LABELS } from "@/utilities/post-type";
import {
  postsRoute,
  postsTypeRoute,
  transitionTypes,
} from "@/utilities/routes";

const POST_TYPE_ICONS: Record<PostFilterType, LucideIcon> = {
  article: FileText,
  review: Star,
  video: Video,
  podcast: Headphones,
  photo: Camera,
};

export interface GridCardPostLedgerProps {
  activeType?: PostFilterType | null;
  className?: string;
  counts: PostTypeCounts;
}

export const GridCardPostLedger = ({
  activeType = null,
  className,
  counts,
}: GridCardPostLedgerProps) => {
  const visibleTypes = POST_FILTER_TYPES.filter(
    (type) => (counts[type] ?? 0) > 0 || activeType === type
  );

  // If only one format exists in the archive, a filter card adds no value.
  if (visibleTypes.length < 2) {
    return null;
  }

  return (
    <GridCard
      aria-label="Filter posts by format"
      as="nav"
      className={cn(className)}
      frameLabel={activeType ? "Format · Filtered" : "Formats"}
    >
      <GridCardSection className="surface-rail-panel relative col-span-3 row-span-3 flex flex-col justify-center gap-2 p-4">
        <CornerKnots className="ornament-corner--rest" variant="ticks" />
        <div className="relative z-1 flex flex-col gap-2">
          {visibleTypes.map((type) => {
            const Icon = POST_TYPE_ICONS[type];
            const label = POST_TYPE_LABELS[type];
            const count = counts[type] ?? 0;
            const isActive = activeType === type;
            const href = isActive ? postsRoute() : postsTypeRoute(type);

            return (
              <IntentLink
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  isActive
                    ? `Showing ${label} (${count}). Click to show all posts`
                    : `Filter posts by ${label} (${count})`
                }
                className={cn(
                  "surface-row ui-interactive ui-focus-ring group relative flex items-center justify-between gap-3 px-4 py-3",
                  isActive && "activity-seal-panel--active"
                )}
                href={href}
                key={type}
                transitionTypes={[transitionTypes.section]}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "ornament-accent" : "tone-muted"
                    )}
                  />
                  <span
                    className="card-eyebrow type-eyebrow font-bold"
                    data-post-type={type}
                  >
                    {label}
                  </span>
                </span>
                <span className="type-eyebrow tone-muted flex items-center gap-1.5">
                  {isActive ? (
                    <>
                      <ApexLozenge className="ornament-accent" size={8} />
                      <span>All</span>
                    </>
                  ) : null}
                  <span className="tone-heading font-mono text-xs font-semibold">
                    {count}
                  </span>
                </span>
                <span aria-hidden="true" className="activity-spine" />
              </IntentLink>
            );
          })}
        </div>
      </GridCardSection>
    </GridCard>
  );
};
