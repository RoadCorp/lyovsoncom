import { transitionTypes } from "@/utilities/routes";

function sanitizeTransitionSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

export const frontendViewTransitionClasses = {
  page: {
    default: "none",
    enter: {
      default: "vt-enter",
      [transitionTypes.drillIn]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
      [transitionTypes.searchSubmit]: "vt-enter",
    },
    exit: {
      default: "vt-exit",
      [transitionTypes.drillIn]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
      [transitionTypes.searchSubmit]: "vt-exit",
    },
    update: "none",
  },
  sharedMedia: {
    default: "none",
    share: {
      default: "vt-share-media",
      [transitionTypes.drillIn]: "vt-share-media",
    },
  },
  sharedTitle: {
    default: "none",
    share: {
      default: "vt-share-title",
      [transitionTypes.drillIn]: "vt-share-title",
    },
  },
  sharedContent: {
    default: "none",
    share: {
      default: "vt-share-content",
      [transitionTypes.drillIn]: "vt-share-content",
    },
  },
} as const;

export function getPostMediaTransitionName(slug: string) {
  return `post-${sanitizeTransitionSegment(slug)}-media`;
}

export function getPostTitleTransitionName(slug: string) {
  return `post-${sanitizeTransitionSegment(slug)}-title`;
}

export function getNoteContentTransitionName(slug: string) {
  return `note-${sanitizeTransitionSegment(slug)}-content`;
}

export function getActivityMediaTransitionName(date: string, slug: string) {
  return `activity-${sanitizeTransitionSegment(date)}-${sanitizeTransitionSegment(slug)}-media`;
}

export function getActivityTitleTransitionName(date: string, slug: string) {
  return `activity-${sanitizeTransitionSegment(date)}-${sanitizeTransitionSegment(slug)}-title`;
}

export function getProjectMediaTransitionName(slug: string) {
  return `project-${sanitizeTransitionSegment(slug)}-media`;
}

export function getProjectTitleTransitionName(slug: string) {
  return `project-${sanitizeTransitionSegment(slug)}-title`;
}
