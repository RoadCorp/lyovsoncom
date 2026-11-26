/**
 * Single source of truth for the Lyóvson 400px archival card grid.
 *
 * Placement classes map directly to `.grid-slot-*` rules in
 * `src/app/(frontend)/globals.css`. Every page composition and skeleton shares
 * these slot names so layouts cannot drift or collide across breakpoints.
 */

export const GRID_UNIT_PX = 400;
export const GRID_GAP_PX = 16;

export const GRID_BREAKPOINTS = {
  g1: { minWidth: 420, cols: 1 },
  g2: { minWidth: 840, cols: 2 },
  g3: { minWidth: 1260, cols: 3 },
  g4: { minWidth: 1680, cols: 4 },
  g5: { minWidth: 2100, cols: 5 },
  g6: { minWidth: 2520, cols: 6 },
} as const;

export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;

export const GRID_SLOTS = {
  nav: "grid-slot-nav",
  hero: "grid-slot-hero",
  bodyBelowHero: "grid-slot-body-below-hero",
  cardBelowHero: "grid-slot-card-below-hero",
  wideTop: "grid-slot-wide-top",
  wideStack: "grid-slot-wide-stack",
  caseStudyBody: "grid-slot-case-study-body",
  caseStudyGallery: "grid-slot-case-study-gallery",
  caseStudyRail: "grid-slot-case-study-rail",
  caseStudyRailNoGallery: "grid-slot-case-study-rail-no-gallery",
  postRail: "grid-slot-post-rail",
  referenceFirstEntry: "grid-slot-reference-first",
  activitiesPreviewRail: "grid-slot-activities-rail",
  activitiesPreviewPagination: "grid-slot-activities-pagination",
} as const;

export type GridSlot = keyof typeof GRID_SLOTS;

export const GRID_HERO_PANELS = {
  media: "grid-hero-media",
  stage: "grid-hero-stage",
} as const;

/**
 * Static Tailwind v4 row-placement classes for 3-row list cards (related posts,
 * references, related projects, recent writing). Never interpolate row numbers
 * with template literals because Tailwind's static scanner cannot detect them.
 */
export const GRID_CARD_ROWS = [
  "row-start-1 row-end-2",
  "row-start-2 row-end-3",
  "row-start-3 row-end-4",
] as const;

export type PostRailRole = "contents" | "references" | "related";

export interface PostRailFlags {
  hasContents: boolean;
  hasReferences: boolean;
}

/**
 * On `g2` (2 columns), the post body spans both columns on row 3 so the left
 * rail splits: the first rail card fills the 1×1 slot beneath Nav (col 1, row 2)
 * and remaining rail cards flow cleanly beneath the body on row 4.
 * On `g3+`, `.grid-slot-post-rail` switches back to a vertical grid in col 1.
 */
export function getPostRailItemClass(
  role: PostRailRole,
  { hasContents, hasReferences }: PostRailFlags
): string {
  const base = "w-full g3:col-auto g3:row-auto";

  if (role === "contents") {
    return `${base} g2:col-start-1 g2:col-end-2 g2:row-start-2`;
  }

  if (role === "references") {
    return hasContents
      ? `${base} g2:col-start-1 g2:col-end-2 g2:row-start-4`
      : `${base} g2:col-start-1 g2:col-end-2 g2:row-start-2`;
  }

  if (hasContents && hasReferences) {
    return `${base} g2:col-start-2 g2:col-end-3 g2:row-start-4`;
  }
  if (hasContents || hasReferences) {
    return `${base} g2:col-start-1 g2:col-end-2 g2:row-start-4`;
  }
  return `${base} g2:col-start-1 g2:col-end-2 g2:row-start-2`;
}

export interface GridRect {
  colEnd: number;
  colStart: number;
  rowEnd: number;
  rowStart: number;
}

export type CheckedBreakpoint = "g1" | "g2" | "g3" | "g4";

export const GRID_SLOT_GEOMETRY: Record<
  Exclude<
    GridSlot,
    "wideStack" | "activitiesPreviewRail" | "activitiesPreviewPagination"
  >,
  Record<CheckedBreakpoint, GridRect>
> = {
  nav: {
    g1: { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2 },
    g2: { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2 },
    g3: { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2 },
    g4: { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2 },
  },
  hero: {
    g1: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 4 },
    g2: { colStart: 2, colEnd: 3, rowStart: 1, rowEnd: 3 },
    g3: { colStart: 2, colEnd: 4, rowStart: 1, rowEnd: 2 },
    g4: { colStart: 2, colEnd: 4, rowStart: 1, rowEnd: 2 },
  },
  bodyBelowHero: {
    g1: { colStart: 1, colEnd: 2, rowStart: 4, rowEnd: 5 },
    g2: { colStart: 1, colEnd: 3, rowStart: 3, rowEnd: 4 },
    g3: { colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3 },
    g4: { colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3 },
  },
  cardBelowHero: {
    g1: { colStart: 1, colEnd: 2, rowStart: 4, rowEnd: 5 },
    g2: { colStart: 2, colEnd: 3, rowStart: 3, rowEnd: 4 },
    g3: { colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 3 },
    g4: { colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 3 },
  },
  wideTop: {
    g1: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    g2: { colStart: 2, colEnd: 3, rowStart: 1, rowEnd: 2 },
    g3: { colStart: 2, colEnd: 4, rowStart: 1, rowEnd: 2 },
    g4: { colStart: 2, colEnd: 4, rowStart: 1, rowEnd: 2 },
  },
  caseStudyBody: {
    g1: { colStart: 1, colEnd: 2, rowStart: 4, rowEnd: 5 },
    g2: { colStart: 2, colEnd: 3, rowStart: 3, rowEnd: 4 },
    g3: { colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3 },
    g4: { colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3 },
  },
  caseStudyGallery: {
    g1: { colStart: 1, colEnd: 2, rowStart: 5, rowEnd: 6 },
    g2: { colStart: 2, colEnd: 3, rowStart: 4, rowEnd: 5 },
    g3: { colStart: 2, colEnd: 4, rowStart: 3, rowEnd: 4 },
    g4: { colStart: 2, colEnd: 4, rowStart: 3, rowEnd: 4 },
  },
  caseStudyRail: {
    g1: { colStart: 1, colEnd: 2, rowStart: 6, rowEnd: 7 },
    g2: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
    g3: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
    g4: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
  },
  caseStudyRailNoGallery: {
    g1: { colStart: 1, colEnd: 2, rowStart: 5, rowEnd: 6 },
    g2: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
    g3: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
    g4: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
  },
  postRail: {
    g1: { colStart: 1, colEnd: 2, rowStart: 5, rowEnd: 6 },
    g2: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    g3: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
    g4: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
  },
  referenceFirstEntry: {
    g1: { colStart: 1, colEnd: 2, rowStart: 4, rowEnd: 5 },
    g2: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    g3: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    g4: { colStart: 4, colEnd: 5, rowStart: 1, rowEnd: 2 },
  },
};

export function rectanglesOverlap(a: GridRect, b: GridRect): boolean {
  return (
    a.colStart < b.colEnd &&
    b.colStart < a.colEnd &&
    a.rowStart < b.rowEnd &&
    b.rowStart < a.rowEnd
  );
}

export function findOverlappingSlots(
  items: readonly { name: string; rect: GridRect }[]
): [string, string][] {
  const overlaps: [string, string][] = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (rectanglesOverlap(items[i].rect, items[j].rect)) {
        overlaps.push([items[i].name, items[j].name]);
      }
    }
  }
  return overlaps;
}
