import type { Activity } from "@/payload-types";

export const ACTIVITY_TYPE_LABELS: Record<Activity["activityType"], string> = {
  read: "Read",
  watch: "Watched",
  listen: "Listened to",
  play: "Played",
  visit: "Visited",
  learn: "Learned",
};

export function getActivityTypeLabel(activityType: string) {
  return (
    ACTIVITY_TYPE_LABELS[activityType as Activity["activityType"]] ??
    activityType
  );
}
