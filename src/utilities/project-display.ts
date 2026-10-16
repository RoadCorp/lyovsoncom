import type { Project } from "@/payload-types";

const HALF_DAY_MS = 12 * 60 * 60 * 1000;
const LEADING_WWW = /^www\./;

/**
 * The admin's month picker stores local midnight, which is the previous day
 * in UTC for editors east of Greenwich. Shifting by half a day reads the
 * month the editor picked in any time zone within ±12 hours.
 */
function getPickedYear(value?: string | null) {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time)
    ? null
    : new Date(time + HALF_DAY_MS).getUTCFullYear();
}

/** "2025", "2023–2025" or "2025–present"; null without a start date. */
export function formatProjectYears(
  project: Pick<Project, "startedAt" | "endedAt">
) {
  const start = getPickedYear(project.startedAt);
  if (!start) {
    return null;
  }
  const end = getPickedYear(project.endedAt);
  if (!project.endedAt) {
    return `${start}–present`;
  }
  return end && end !== start ? `${start}–${end}` : String(start);
}

/** "avenews.am" for "https://www.avenews.am/en". */
export function getProjectHost(url?: string | null) {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).hostname.replace(LEADING_WWW, "");
  } catch {
    return null;
  }
}
