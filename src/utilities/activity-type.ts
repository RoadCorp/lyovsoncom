import type { Activity } from "@/payload-types";

export const ACTIVITY_FILTER_TYPES = [
  "read",
  "watch",
  "listen",
  "play",
] as const;

export type ActivityFilterType = (typeof ACTIVITY_FILTER_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<Activity["activityType"], string> = {
  read: "Read",
  watch: "Watched",
  listen: "Listened to",
  play: "Played",
  visit: "Visited",
  learn: "Learned",
};

export const ACTIVITY_FILTER_SHORT_LABELS: Record<ActivityFilterType, string> =
  {
    read: "Read",
    watch: "Watch",
    listen: "Listen",
    play: "Play",
  };

export const ACTIVITY_FILTER_ARCHIVE_LABELS: Record<
  ActivityFilterType,
  string
> = {
  read: "Reading",
  watch: "Watching",
  listen: "Listening",
  play: "Playing",
};

const ACTIVITY_FILTER_TYPE_SET = new Set<string>(ACTIVITY_FILTER_TYPES);

export function isActivityFilterType(
  value: string
): value is ActivityFilterType {
  return ACTIVITY_FILTER_TYPE_SET.has(value);
}

export function getActivityTypeLabel(activityType: string) {
  return (
    ACTIVITY_TYPE_LABELS[activityType as Activity["activityType"]] ??
    activityType
  );
}
