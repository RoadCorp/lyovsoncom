import { transitionTypes } from "@/utilities/routes";

const HEX_RADIX = 16;
const UNSAFE_TRANSITION_SEGMENT = /[^a-zA-Z0-9-]/gu;

function sanitizeTransitionSegment(value: string) {
  // Encode rather than collapse characters so distinct slugs never share a name.
  return value.replace(
    UNSAFE_TRANSITION_SEGMENT,
    (character) => `_${character.codePointAt(0)?.toString(HEX_RADIX)}_`
  );
}

const archiveMovement = {
  default: "vt-card",
  [transitionTypes.drillIn]: "none",
  [transitionTypes.postDrillIn]: "none",
  [transitionTypes.navMode]: "none",
} as const;

const detailSharing = (className: string) => ({
  default: className,
  [transitionTypes.section]: "none",
  [transitionTypes.searchSubmit]: "none",
  [transitionTypes.paginationNext]: "none",
  [transitionTypes.paginationPrev]: "none",
  [transitionTypes.navMode]: "none",
});

export const frontendViewTransitionClasses = {
  page: {
    default: "none",
    enter: {
      default: "vt-enter",
      [transitionTypes.navMode]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
    },
    exit: {
      default: "vt-exit",
      [transitionTypes.navMode]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
    },
    update: "none",
  },
  archiveCard: {
    default: "none",
    enter: {
      default: "vt-enter",
      [transitionTypes.navMode]: "none",
      [transitionTypes.drillIn]: "none",
      [transitionTypes.postDrillIn]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
    },
    exit: {
      default: "vt-exit",
      [transitionTypes.navMode]: "none",
      [transitionTypes.drillIn]: "none",
      [transitionTypes.postDrillIn]: "none",
      [transitionTypes.paginationNext]: "vt-pagination-next",
      [transitionTypes.paginationPrev]: "vt-pagination-prev",
    },
    share: archiveMovement,
    update: archiveMovement,
  },
  sharedMedia: {
    default: "none",
    share: detailSharing("vt-share-media"),
  },
  sharedTitle: {
    default: "none",
    share: detailSharing("vt-share-title"),
  },
  sharedContent: {
    default: "none",
    share: detailSharing("vt-share-content"),
  },
  sharedMeta: {
    default: "none",
    share: detailSharing("vt-control"),
  },
  reveal: { default: "none", enter: "vt-enter", exit: "vt-exit" },
  anchor: { default: "none", share: "vt-anchor", update: "vt-anchor" },
} as const;

export function getArchiveCardTransitionName(
  collection: string,
  id: number | string
) {
  return `card-${sanitizeTransitionSegment(collection)}-${sanitizeTransitionSegment(String(id))}`;
}

export function getPostMediaTransitionName(slug: string) {
  return `post-${sanitizeTransitionSegment(slug)}-media`;
}

export function getPostTitleTransitionName(slug: string) {
  return `post-${sanitizeTransitionSegment(slug)}-title`;
}

export function getNoteContentTransitionName(slug: string) {
  return `note-${sanitizeTransitionSegment(slug)}-content`;
}

export function getNoteTitleTransitionName(slug: string) {
  return `note-${sanitizeTransitionSegment(slug)}-title`;
}

export function getNoteMetaTransitionName(
  slug: string,
  part: "topics" | "byline" | "type"
) {
  return `note-${sanitizeTransitionSegment(slug)}-${part}`;
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
