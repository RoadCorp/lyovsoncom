import type { LucideIcon } from "lucide-react";
import {
  Book,
  Building2,
  Film,
  Gamepad2,
  GraduationCap,
  Link as LinkIcon,
  MapPin,
  Mic,
  Music,
  Trophy,
  User,
  Video,
} from "lucide-react";
import type { Activity, Reference } from "@/payload-types";
import { getActivityTypeLabel as getSharedActivityTypeLabel } from "@/utilities/activity-type";
import { formatShortDate } from "@/utilities/date";
import { getActivityDateValue } from "@/utilities/routes";

export const UNKNOWN_ACTIVITY_REFERENCE_TITLE = "Unknown";

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

const activityTypeIcons: Record<Activity["activityType"], LucideIcon> = {
  read: Book,
  watch: Film,
  listen: Music,
  play: Gamepad2,
  visit: MapPin,
  learn: GraduationCap,
};

export function getActivityReference(activity: Activity): Reference | null {
  return typeof activity.reference === "object" && activity.reference !== null
    ? activity.reference
    : null;
}

export function getActivityReferenceImage(reference: Reference | null) {
  return reference?.image && typeof reference.image === "object"
    ? reference.image
    : null;
}

export function getActivityReferenceIcon(type: Reference["type"]): LucideIcon {
  return referenceTypeIcons[type] ?? LinkIcon;
}

export function getActivityTypeIcon(
  activityType: Activity["activityType"]
): LucideIcon {
  return activityTypeIcons[activityType] ?? LinkIcon;
}

export function getActivityTypeLabel(activityType: Activity["activityType"]) {
  return getSharedActivityTypeLabel(activityType);
}

export function getActivityDateMeta(activity: Activity) {
  const dateValue = getActivityDateValue(activity);

  return {
    dateLabel: formatShortDate(dateValue),
    dateValue,
  };
}
