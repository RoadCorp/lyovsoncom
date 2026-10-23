import { ViewTransition } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { Media } from "@/components/Media";
import { CARD_THUMBNAIL_IMAGE_SIZE } from "@/components/Media/image-sizes";
import { cn } from "@/lib/utils";
import type { Activity } from "@/payload-types";
import { ACTIVITY_PREVIEW_LIMIT } from "@/utilities/activity-preview";
import { activityRoute, transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getReferenceMediaTransitionName,
  getReferenceTitleTransitionName,
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

const DEFAULT_CARD_CLASS_NAME =
  "aspect-auto h-[var(--grid-card-1x3)] [--grid-internal-rows:9] g2:w-[var(--grid-card-1x1)] self-start";
export const HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5";
export const LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-2 g2:row-end-5";
export const ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME =
  "g2:col-start-1 g2:col-end-2 g2:row-start-5 g2:row-end-6 g2:self-start";

function getRenderableActivities(activities: Activity[]) {
  // Transition names must be unique on a page, so only a reference's first
  // row in the rail morphs into its hub.
  const seenReferences = new Set<string>();

  return activities
    .flatMap((activity) => {
      const href = activityRoute(activity);
      const referenceSlug = getActivityReference(activity)?.slug;

      if (!(href && referenceSlug)) {
        return [];
      }

      const morphs = !seenReferences.has(referenceSlug);
      seenReferences.add(referenceSlug);
      return [{ activity, href, morphs, referenceSlug }] as const;
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
    <ViewTransition
      name="activity-preview-rail"
      {...frontendViewTransitionClasses.anchor}
    >
      <GridCard
        className={cn(DEFAULT_CARD_CLASS_NAME, className)}
        frameLabel="Activities"
      >
        {renderableActivities.map(
          ({ activity, href, morphs, referenceSlug }, index) => {
            const reference = getActivityReference(activity);
            const referenceImage = getActivityReferenceImage(reference);
            const referenceTitle =
              reference?.title ?? UNKNOWN_ACTIVITY_REFERENCE_TITLE;
            const referenceType = reference?.type ?? "other";
            const { dateLabel, dateValue } = getActivityDateMeta(activity);
            const activityTypeLabel = getActivityTypeLabel(
              activity.activityType
            );
            const ActivityIcon = getActivityTypeIcon(activity.activityType);
            const ReferenceIcon = getActivityReferenceIcon(referenceType);

            return (
              <IntentLink
                aria-label={`View activity: ${referenceTitle}`}
                className={cn(
                  "ui-focus-ring group ui-interactive col-start-1 col-end-4"
                )}
                href={href}
                key={activity.id}
                style={getRowStyle(index)}
                transitionTypes={[transitionTypes.drillIn]}
              >
                <GridCardSection
                  className="surface-row grid h-full grid-cols-3 grid-rows-1 gap-2"
                  flush={true}
                >
                  {referenceImage ? (
                    <ViewTransition
                      name={
                        morphs
                          ? getReferenceMediaTransitionName(referenceSlug)
                          : undefined
                      }
                      {...frontendViewTransitionClasses.sharedMedia}
                    >
                      <Media
                        className="media-frame flex h-full items-center justify-center"
                        imgClassName="object-cover h-full"
                        pictureClassName="row-start-1 row-end-2 col-start-1 col-end-2 h-full"
                        resource={referenceImage}
                        size={CARD_THUMBNAIL_IMAGE_SIZE}
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
                      name={
                        morphs
                          ? getReferenceTitleTransitionName(referenceSlug)
                          : undefined
                      }
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
                        data-activity-type={activity.activityType}
                      />
                      <span className="sr-only">{activityTypeLabel}</span>
                      {dateLabel ? (
                        <time dateTime={dateValue ?? undefined}>
                          {dateLabel}
                        </time>
                      ) : (
                        <span>{activityTypeLabel}</span>
                      )}
                    </div>
                  </div>
                </GridCardSection>
              </IntentLink>
            );
          }
        )}
      </GridCard>
    </ViewTransition>
  );
}
