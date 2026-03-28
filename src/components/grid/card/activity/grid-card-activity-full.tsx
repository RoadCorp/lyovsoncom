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
import Link from "next/link";

import { GridCard, GridCardSection } from "@/components/grid";
import { Media } from "@/components/Media";
import type { Activity, Reference } from "@/payload-types";
import { getActivityPath } from "@/utilities/activity-path";

export interface GridCardActivityProps {
  activity: Activity;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const MAX_PARTICIPANT_STAGGER = 6;
const UNKNOWN_REFERENCE_TITLE = "Unknown";
const UNKNOWN_ACTIVITY_SEGMENT = "unknown";

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

function getActivityDate(
  activity: Activity
): { date: string; dateTime?: string } | null {
  const dateTime =
    activity.finishedAt || activity.startedAt || activity.publishedAt;
  if (dateTime) {
    const dateObj = new Date(dateTime);

    return {
      date: dateObj.toLocaleDateString("en-GB", {
        year: "2-digit",
        month: "short",
        day: "2-digit",
      }),
      dateTime,
    };
  }
  return null;
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
    !Array.isArray(activity.participants) ||
    activity.participants.length === 0
  ) {
    return [];
  }

  const uniqueParticipants = new Map<number | string, ParticipantLinkData>();

  for (const participant of activity.participants) {
    if (
      typeof participant !== "object" ||
      participant === null ||
      (typeof participant.id !== "number" &&
        typeof participant.id !== "string") ||
      typeof participant.username !== "string" ||
      participant.username.trim().length === 0
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
  return `glass-stagger-${Math.min(index + 1, MAX_PARTICIPANT_STAGGER)}`;
}

export const GridCardActivityFull = ({
  activity,
  className,
  loading,
  priority,
}: GridCardActivityProps) => {
  const { activityType, slug } = activity;

  const dateInfo = getActivityDate(activity);
  const activityUrl =
    getActivityPath(activity) ??
    `/activities/${UNKNOWN_ACTIVITY_SEGMENT}/${slug ?? UNKNOWN_ACTIVITY_SEGMENT}`;

  const referenceObj = getReferenceObject(activity);
  const referenceTitle = referenceObj?.title ?? UNKNOWN_REFERENCE_TITLE;
  const referenceType = referenceObj?.type ?? "other";
  const referenceImage = getReferenceImage(referenceObj);
  const activityTypeLabel = activityTypeLabels[activityType] ?? activityType;
  const ActivityIcon = getActivityIcon(referenceType);
  const participants = getUniqueParticipants(activity);

  const iconClassName =
    "glass-text h-5 w-5 transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]";

  return (
    <GridCard className={className}>
      {referenceImage && (
        <GridCardSection
          className="col-start-1 col-end-3 row-start-1 row-end-4"
          flush={true}
        >
          <Link
            aria-label={`View activity: ${activityTypeLabel} ${referenceTitle}`}
            className="group block h-full overflow-hidden rounded-lg"
            href={activityUrl}
          >
            <Media
              className="glass-media flex h-full items-center justify-center"
              imgClassName="object-cover h-full w-full"
              pictureClassName="h-full w-full"
              resource={referenceImage}
              {...(loading ? { loading } : {})}
              {...(priority ? { priority } : {})}
            />
          </Link>
        </GridCardSection>
      )}

      <GridCardSection
        className={
          "col-start-3 col-end-4 row-start-1 row-end-2 flex h-full flex-col justify-center"
        }
      >
        <Link className="group block" href={activityUrl}>
          <h2 className="glass-text text-center font-bold text-sm transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
            {referenceTitle}
          </h2>
        </Link>
      </GridCardSection>

      <GridCardSection
        className={
          "col-start-3 col-end-4 row-start-2 row-end-3 flex flex-col justify-evenly gap-2"
        }
      >
        {participants.map((participant, index) => (
          <Link
            aria-label={`View ${participant.name}'s profile`}
            className={`glass-text glass-interactive flex items-center gap-2 transition-colors duration-300 hover:text-[var(--glass-text-secondary)] ${getParticipantStaggerClass(index)}`}
            href={{ pathname: `/${participant.username}` }}
            key={participant.id}
          >
            <PenTool aria-hidden="true" className="h-5 w-5" />
            <span className="font-medium text-xs">
              {participant.name?.replace(" Lyovson", "")}
            </span>
          </Link>
        ))}

        {dateInfo && (
          <div className="glass-text-secondary flex items-center gap-2 text-xs">
            <Calendar aria-hidden="true" className="h-5 w-5" />
            <time dateTime={dateInfo.dateTime}>{dateInfo.date}</time>
          </div>
        )}
      </GridCardSection>

      <GridCardSection
        className={
          "col-start-3 col-end-4 row-start-3 row-end-4 flex h-full flex-col items-center justify-center gap-1"
        }
      >
        <Link
          className="group block flex flex-col items-center gap-1"
          href={activityUrl}
        >
          <ActivityIcon aria-hidden="true" className={iconClassName} />
          <span className="glass-text-secondary text-xs capitalize transition-colors duration-300 group-hover:text-[var(--glass-text-secondary)]">
            {activityTypeLabel}
          </span>
        </Link>
      </GridCardSection>
    </GridCard>
  );
};
