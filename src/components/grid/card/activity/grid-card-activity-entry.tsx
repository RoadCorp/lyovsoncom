import { User } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import {
  ActivitySeal,
  CornerKnots,
  EternityKnot,
  FleuronRule,
} from "@/components/ornaments";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { Activity } from "@/payload-types";
import { dedupeRelationItemsById } from "@/utilities/dedupe-relation-items-by-id";
import { activityAnchor, lyovsonRoute } from "@/utilities/routes";
import {
  getActivityDateMeta,
  getActivityTypeIcon,
  getActivityTypeLabel,
} from "./shared";

const FORMAT_LABELS: Record<NonNullable<Activity["format"]>, string> = {
  audiobook: "Audiobook",
  ebook: "Ebook",
  fullCast: "Full-cast audio",
  print: "Print",
};

function getFinishDateParts(activity: Activity) {
  if (!activity.finishedAt) {
    return null;
  }
  const date = new Date(activity.finishedAt);
  return {
    day: date.getUTCDate(),
    monthYear: date.toLocaleDateString("en-GB", {
      month: "short",
      timeZone: "UTC",
      year: "numeric",
    }),
    iso: activity.finishedAt,
  };
}

/**
 * One activity on its reference hub: the notes, who did it and when. Old
 * activity URLs redirect to its anchor.
 */
export function GridCardActivityEntry({
  activity,
  className,
}: {
  activity: Activity;
  className?: string;
}) {
  const ActivityIcon = getActivityTypeIcon(activity.activityType);
  const activityLabel = getActivityTypeLabel(activity.activityType);
  const participants = dedupeRelationItemsById(activity.participants);
  const finishDateParts = getFinishDateParts(activity);
  const { dateLabel, dateValue } = getActivityDateMeta(activity);

  return (
    <GridCard
      aria-label={dateLabel ? `${activityLabel}, ${dateLabel}` : activityLabel}
      as="article"
      className={cn(
        "scroll-mt-24 target:ring-2 target:ring-current",
        className
      )}
      id={activityAnchor(activity)}
    >
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col justify-center overflow-hidden px-6 py-4">
        {activity.notes ? (
          <div className="flex h-full w-full items-center justify-center text-center">
            <RichText
              className="text-sm"
              content={activity.notes}
              enableGutter={false}
              enableProse={true}
            />
          </div>
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-2.5">
            <div className="ornament-lattice" />
            <EternityKnot className="ornament-muted relative z-1" size={18} />
            <p className="tone-muted relative z-1 text-center text-sm italic">
              No notes
            </p>
          </div>
        )}
      </GridCardSection>

      <GridCardSection
        className="activity-seal-panel col-start-1 col-end-2 row-start-3 row-end-4 flex flex-col items-center justify-center p-2"
        data-activity-type={activity.activityType}
      >
        <div className="ornament-lattice" />
        <CornerKnots className="ornament-corner--subtle" variant="ticks" />
        <ActivitySeal
          activityType={activity.activityType}
          icon={
            <ActivityIcon
              aria-hidden="true"
              className="h-5 w-5"
              data-activity-type={activity.activityType}
            />
          }
          label={activityLabel}
          sublabel={activity.format ? FORMAT_LABELS[activity.format] : null}
        />
      </GridCardSection>

      <GridCardSection className="col-start-2 col-end-3 row-start-3 row-end-4 flex items-center justify-center gap-2">
        <CornerKnots className="ornament-corner--rest" variant="ticks" />
        {participants.map((participant) =>
          participant.username ? (
            <AppLink
              aria-label={`View ${participant.name}'s profile`}
              className="ui-meta-link ui-focus-ring relative z-1 flex flex-col items-center gap-0.5"
              href={lyovsonRoute(participant.username)}
              key={participant.id}
              prefetch={false}
            >
              <User aria-hidden="true" className="h-5 w-5" />
              <span className="text-label">
                {participant.name?.split(" ").at(0) || "?"}
              </span>
            </AppLink>
          ) : null
        )}
      </GridCardSection>

      <GridCardSection className="col-start-3 col-end-4 row-start-3 row-end-4 flex flex-col items-center justify-center">
        <CornerKnots className="ornament-corner--rest" variant="ticks" />
        {finishDateParts ? (
          <time
            className="relative z-1 flex flex-col items-center gap-1"
            dateTime={finishDateParts.iso}
          >
            <span className="tone-heading text-2xl leading-none font-bold tabular-nums">
              {finishDateParts.day}
            </span>
            <FleuronRule className="max-w-12" variant="lozenge" />
            <span className="tone-muted type-eyebrow">
              {finishDateParts.monthYear}
            </span>
          </time>
        ) : (
          <span className="tone-muted text-xs">
            {dateLabel ? (
              <time dateTime={dateValue ?? undefined}>{dateLabel}</time>
            ) : (
              "In progress"
            )}
          </span>
        )}
      </GridCardSection>
    </GridCard>
  );
}
