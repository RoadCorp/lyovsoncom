import type { LucideIcon } from "lucide-react";
import {
  Book,
  Building2,
  Calendar,
  Film,
  Gamepad2,
  GraduationCap,
  Link as LinkIcon,
  Mic,
  Music,
  PenTool,
  Trophy,
  User,
  Video,
} from "lucide-react";
import { ViewTransition } from "react";
import { AppLink } from "@/components/AppLink";
import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import type { Activity, Reference } from "@/payload-types";
import { formatShortDate } from "@/utilities/date";
import {
  activitiesRoute,
  activityRoute,
  getActivityDateSlug,
  lyovsonRoute,
  transitionTypes,
} from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getActivityMediaTransitionName,
  getActivityTitleTransitionName,
} from "@/utilities/view-transitions";

export interface GridCardActivityProps {
  activity: Activity;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const MAX_PARTICIPANT_STAGGER = 6;
const UNKNOWN_REFERENCE_TITLE = "Unknown";

const activityTypeLabels: Record<Activity["activityType"], string> = {
  read: "Read",
  watch: "Watched",
  listen: "Listened",
  play: "Played",
  visit: "Visited",
  learn: "Learned",
};

const referenceTypeIcons: Partial<Record<Reference["type"], LucideIcon>> = {
  book: Book,
  movie: Film,
  tvShow: Film,
  videoGame: Gamepad2,
  music: Music,
  podcast: Mic,
  series: Book,
  person: User,
  company: Building2,
  video: Video,
  match: Trophy,
  course: GraduationCap,
};

interface ParticipantLinkData {
  id: number | string;
  name: string | null | undefined;
  username: string;
}

function getReferenceObject(activity: Activity): Reference | null {
  return typeof activity.reference === "object" && activity.reference !== null
    ? activity.reference
    : null;
}

function getReferenceImage(reference: Reference | null) {
  return reference?.image && typeof reference.image === "object"
    ? reference.image
    : null;
}

function getActivityIcon(type: Reference["type"]): LucideIcon {
  return referenceTypeIcons[type] ?? LinkIcon;
}

function getUniqueParticipants(activity: Activity): ParticipantLinkData[] {
  if (
    !(Array.isArray(activity.participants) && activity.participants.length > 0)
  ) {
    return [];
  }

  const uniqueParticipants = new Map<number | string, ParticipantLinkData>();

  for (const participant of activity.participants) {
    if (
      !(
        typeof participant === "object" &&
        participant !== null &&
        (typeof participant.id === "number" ||
          typeof participant.id === "string") &&
        typeof participant.username === "string" &&
        participant.username.trim().length > 0
      )
    ) {
      continue;
    }

    if (!uniqueParticipants.has(participant.id)) {
      uniqueParticipants.set(participant.id, {
        id: participant.id,
        name: participant.name,
        username: participant.username,
      });
    }
  }

  return [...uniqueParticipants.values()];
}

function getParticipantStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_PARTICIPANT_STAGGER)}`;
}

export const GridCardActivityFull = ({
  activity,
  className,
  loading,
  priority,
}: GridCardActivityProps) => {
  const { activityType, slug } = activity;
  if (!slug) {
    return null;
  }

  const dateSlug = getActivityDateSlug(activity);
  const activityHref = activityRoute(activity) || activitiesRoute();
  const referenceObj = getReferenceObject(activity);
  const referenceTitle = referenceObj?.title ?? UNKNOWN_REFERENCE_TITLE;
  const referenceType = referenceObj?.type ?? "other";
  const referenceImage = getReferenceImage(referenceObj);
  const activityTypeLabel = activityTypeLabels[activityType] ?? activityType;
  const ActivityIcon = getActivityIcon(referenceType);
  const participants = getUniqueParticipants(activity);

  const iconClassName = "tone-heading ui-group-hover-dim h-5 w-5";

  return (
    <GridCard className={className}>
      {referenceImage ? (
        <GridCardSection
          className="col-start-1 col-end-3 row-start-1 row-end-4"
          flush={true}
        >
          <AppLink
            aria-label={`View activity: ${activityTypeLabel} ${referenceTitle}`}
            className="group block h-full overflow-hidden rounded-lg"
            href={activityHref}
            prefetch={false}
            transitionTypes={[transitionTypes.drillIn]}
          >
            <ViewTransition
              name={getActivityMediaTransitionName(dateSlug, slug)}
              {...frontendViewTransitionClasses.sharedMedia}
            >
              <Media
                className="media-frame flex h-full items-center justify-center"
                imgClassName="h-full w-full object-cover"
                pictureClassName="h-full w-full"
                resource={referenceImage}
                {...(loading ? { loading } : {})}
                {...(priority ? { priority } : {})}
              />
            </ViewTransition>
          </AppLink>
        </GridCardSection>
      ) : null}

      <GridCardSection className="surface-title-stage col-start-3 col-end-4 row-start-1 row-end-2 flex h-full flex-col justify-center">
        <AppLink
          className="ui-focus-ring group block"
          href={activityHref}
          prefetch={false}
          transitionTypes={[transitionTypes.drillIn]}
        >
          <ViewTransition
            name={getActivityTitleTransitionName(dateSlug, slug)}
            {...frontendViewTransitionClasses.sharedTitle}
          >
            <h2 className="card-title tone-heading ui-group-hover-dim text-center font-bold text-sm">
              {referenceTitle}
            </h2>
          </ViewTransition>
        </AppLink>
      </GridCardSection>

      <GridCardSection className="surface-rail-panel card-rail-stack card-meta-stack col-start-3 col-end-4 row-start-2 row-end-3">
        {participants.map((participant, index) => (
          <AppLink
            aria-label={`View ${participant.name}'s profile`}
            className={`ui-meta-link ui-focus-ring ui-interactive ${getParticipantStaggerClass(index)}`}
            href={lyovsonRoute(participant.username)}
            key={participant.id}
            prefetch={false}
          >
            <PenTool aria-hidden="true" className="h-5 w-5" />
            <span className="font-medium text-xs">
              {participant.name?.replace(" Lyovson", "")}
            </span>
          </AppLink>
        ))}

        <div className="tone-muted flex items-center gap-2 text-xs">
          <Calendar aria-hidden="true" className="h-5 w-5" />
          <time
            dateTime={
              activity.finishedAt ||
              activity.startedAt ||
              activity.publishedAt ||
              undefined
            }
          >
            {formatShortDate(
              activity.finishedAt || activity.startedAt || activity.publishedAt
            )}
          </time>
        </div>
      </GridCardSection>

      <GridCardSection className="surface-rail-panel col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1">
        <AppLink
          className="ui-focus-ring group block flex flex-col items-center gap-1"
          href={activityHref}
          prefetch={false}
          transitionTypes={[transitionTypes.drillIn]}
        >
          <ActivityIcon aria-hidden="true" className={iconClassName} />
          <span className="tone-muted text-xs capitalize">
            {activityTypeLabel}
          </span>
        </AppLink>
      </GridCardSection>
    </GridCard>
  );
};
