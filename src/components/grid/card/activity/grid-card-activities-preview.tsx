import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import type { Activity } from "@/payload-types";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import {
  activityRoute,
  getActivityDateSlug,
  transitionTypes,
} from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getActivityMediaTransitionName,
  getActivityTitleTransitionName,
} from "@/utilities/view-transitions";
import {
  getActivityDateMeta,
  getActivityReference,
  getActivityReferenceIcon,
  getActivityReferenceImage,
  getActivityTypeIcon,
  getActivityTypeLabel,
  UNKNOWN_ACTIVITY_REFERENCE_TITLE,
} from "./shared";

const MAX_STAGGER_INDEX = 8;
const DEFAULT_CARD_CLASS_NAME =
  "aspect-auto h-[var(--grid-card-1x3)] [--grid-internal-rows:9] g2:w-[var(--grid-card-1x1)] self-start";
export const HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5";
export const LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5";
export const ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-5 g2:row-end-6 g2:self-start";

function getStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

function getRenderableActivities(activities: Activity[]) {
  return activities
    .flatMap((activity) => {
      const href = activityRoute(activity);
      const slug = activity.slug;

      if (!(href && slug)) {
        return [];
      }

      return [{ activity, href, slug }] as const;
    })
    .slice(0, ACTIVITY_PREVIEW_LIMIT);
}

function getRowStyle(index: number) {
  const start = index + 1;

  return {
    gridRow: `${start} / ${start + 1}`,
  } as const;
}

export function GridCardActivitiesPreview({
  activities,
  className,
}: {
  activities: Activity[];
  className?: string;
}) {
  const renderableActivities = getRenderableActivities(activities);

  if (renderableActivities.length === 0) {
    return null;
  }

  return (
    <GridCard
      className={cn(DEFAULT_CARD_CLASS_NAME, className)}
      frameLabel="Activities"
    >
      {renderableActivities.map(({ activity, href, slug }, index) => {
        const staggerClass = getStaggerClass(index);
        const reference = getActivityReference(activity);
        const referenceImage = getActivityReferenceImage(reference);
        const referenceTitle =
          reference?.title ?? UNKNOWN_ACTIVITY_REFERENCE_TITLE;
        const referenceType = reference?.type ?? "other";
        const { dateLabel, dateValue } = getActivityDateMeta(activity);
        const activityTypeLabel = getActivityTypeLabel(activity.activityType);
        const ActivityIcon = getActivityTypeIcon(activity.activityType);
        const ReferenceIcon = getActivityReferenceIcon(referenceType);
        const dateSlug = getActivityDateSlug(activity);

        return (
          <AppLink
            aria-label={`View activity: ${referenceTitle}`}
            className={cn(
              "ui-focus-ring group ui-interactive col-start-1 col-end-4",
              staggerClass
            )}
            href={href}
            key={activity.id}
            prefetch={false}
            style={getRowStyle(index)}
            transitionTypes={[transitionTypes.drillIn]}
          >
            <GridCardSection
              className="surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
              flush={true}
            >
              {referenceImage ? (
                <ViewTransition
                  name={getActivityMediaTransitionName(dateSlug, slug)}
                  {...frontendViewTransitionClasses.sharedMedia}
                >
                  <Media
                    className="media-frame flex h-full items-center justify-center"
                    imgClassName="object-cover h-full"
                    pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                    resource={referenceImage}
                  />
                </ViewTransition>
              ) : (
                <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex h-full items-center justify-center">
                  <ReferenceIcon
                    aria-hidden="true"
                    className="tone-heading ui-group-hover-dim h-8 w-8"
                  />
                </div>
              )}

              <div className="col-start-2 col-end-4 row-start-1 row-end-2 flex h-full flex-col justify-center gap-1">
                <ViewTransition
                  name={getActivityTitleTransitionName(dateSlug, slug)}
                  {...frontendViewTransitionClasses.sharedTitle}
                >
                  <h2 className="tone-heading ui-group-hover-dim font-medium">
                    {referenceTitle}
                  </h2>
                </ViewTransition>
                <div className="tone-muted flex items-center gap-1.5 text-xs">
                  <ActivityIcon
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="sr-only">{activityTypeLabel}</span>
                  {dateLabel ? (
                    <time dateTime={dateValue ?? undefined}>{dateLabel}</time>
                  ) : (
                    <span>{activityTypeLabel}</span>
                  )}
                </div>
              </div>
            </GridCardSection>
          </AppLink>
        );
      })}
    </GridCard>
  );
}
