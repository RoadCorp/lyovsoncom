import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GridCard } from "./card";
import type { CheckedBreakpoint, GridRect } from "./layout";
import {
  findOverlappingSlots,
  GRID_BREAKPOINTS,
  GRID_CARD_ROWS,
  GRID_HERO_PANELS,
  GRID_SLOT_GEOMETRY,
  GRID_SLOTS,
  getPostRailItemClass,
} from "./layout";

const BREAKPOINTS: CheckedBreakpoint[] = ["g1", "g2", "g3", "g4"];
const G2_COL_START_RE = /g2:col-start-(?<colStart>\d+)/u;
const G2_COL_END_RE = /g2:col-end-(?<colEnd>\d+)/u;
const G2_ROW_START_RE = /g2:row-start-(?<rowStart>\d+)/u;

function rectFromPostRailClass(className: string): GridRect {
  const colStart = Number(className.match(G2_COL_START_RE)?.groups?.colStart);
  const colEnd = Number(className.match(G2_COL_END_RE)?.groups?.colEnd);
  const rowStart = Number(className.match(G2_ROW_START_RE)?.groups?.rowStart);

  if (!(colStart && colEnd && rowStart)) {
    throw new Error(`Missing g2 coordinates in: ${className}`);
  }

  return { colStart, colEnd, rowStart, rowEnd: rowStart + 1 };
}

function getLayoutViolations(
  name: string,
  slots: { name: string; rect: GridRect }[],
  breakpoint: CheckedBreakpoint
): string[] {
  const violations: string[] = [];
  const maxColEnd = GRID_BREAKPOINTS[breakpoint].cols + 1;

  for (const item of slots) {
    if (item.rect.colStart < 1) {
      violations.push(`${name} @ ${breakpoint}: ${item.name} colStart < 1`);
    }
    if (item.rect.colEnd > maxColEnd) {
      violations.push(
        `${name} @ ${breakpoint}: ${item.name} colEnd > ${maxColEnd}`
      );
    }
    if (item.rect.colEnd <= item.rect.colStart) {
      violations.push(
        `${name} @ ${breakpoint}: ${item.name} colEnd <= colStart`
      );
    }
    if (item.rect.rowEnd <= item.rect.rowStart) {
      violations.push(
        `${name} @ ${breakpoint}: ${item.name} rowEnd <= rowStart`
      );
    }
  }

  for (const [first, second] of findOverlappingSlots(slots)) {
    violations.push(`${name} @ ${breakpoint}: ${first} overlaps ${second}`);
  }

  return violations;
}

describe("grid layout geometry", () => {
  it("keeps hero + body pages (bio, post skeleton) collision-free at every breakpoint", () => {
    const violations = BREAKPOINTS.flatMap((bp) =>
      getLayoutViolations(
        "bio / hero+body",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          { name: "bodyBelowHero", rect: GRID_SLOT_GEOMETRY.bodyBelowHero[bp] },
        ],
        bp
      )
    );
    expect(violations).toEqual([]);
  });

  it("keeps person contact page (nav + hero + 1x1 card below hero) collision-free", () => {
    const violations = BREAKPOINTS.flatMap((bp) =>
      getLayoutViolations(
        "person-contact",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          { name: "cardBelowHero", rect: GRID_SLOT_GEOMETRY.cardBelowHero[bp] },
        ],
        bp
      )
    );
    expect(violations).toEqual([]);
  });

  it("keeps post detail pages collision-free across all rail combinations", () => {
    const combinations = [
      { hasContents: false, hasReferences: false },
      { hasContents: true, hasReferences: false },
      { hasContents: false, hasReferences: true },
      { hasContents: true, hasReferences: true },
    ] as const;

    const violations: string[] = [];

    for (const flags of combinations) {
      for (const bp of BREAKPOINTS) {
        const items: { name: string; rect: GridRect }[] = [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          { name: "bodyBelowHero", rect: GRID_SLOT_GEOMETRY.bodyBelowHero[bp] },
        ];

        if (bp === "g2") {
          if (flags.hasContents) {
            items.push({
              name: "rail:contents",
              rect: rectFromPostRailClass(
                getPostRailItemClass("contents", flags)
              ),
            });
          }
          if (flags.hasReferences) {
            items.push({
              name: "rail:references",
              rect: rectFromPostRailClass(
                getPostRailItemClass("references", flags)
              ),
            });
          }
          items.push({
            name: "rail:related",
            rect: rectFromPostRailClass(getPostRailItemClass("related", flags)),
          });
        } else {
          items.push({
            name: "postRail",
            rect: GRID_SLOT_GEOMETRY.postRail[bp],
          });
        }

        violations.push(
          ...getLayoutViolations(
            `post-detail(contents=${flags.hasContents},refs=${flags.hasReferences})`,
            items,
            bp
          )
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps project case study pages (with and without gallery) collision-free", () => {
    const violations = BREAKPOINTS.flatMap((bp) => [
      ...getLayoutViolations(
        "case-study-with-gallery",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          {
            name: "caseStudyBody",
            rect: GRID_SLOT_GEOMETRY.caseStudyBody[bp],
          },
          {
            name: "caseStudyGallery",
            rect: GRID_SLOT_GEOMETRY.caseStudyGallery[bp],
          },
          {
            name: "caseStudyRail",
            rect: GRID_SLOT_GEOMETRY.caseStudyRail[bp],
          },
        ],
        bp
      ),
      ...getLayoutViolations(
        "case-study-without-gallery",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          {
            name: "caseStudyBody",
            rect: GRID_SLOT_GEOMETRY.caseStudyBody[bp],
          },
          {
            name: "caseStudyRailNoGallery",
            rect: GRID_SLOT_GEOMETRY.caseStudyRailNoGallery[bp],
          },
        ],
        bp
      ),
    ]);
    expect(violations).toEqual([]);
  });

  it("keeps reference hub and wide-top static pages collision-free", () => {
    const violations = BREAKPOINTS.flatMap((bp) => [
      ...getLayoutViolations(
        "reference-hub",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          {
            name: "referenceFirstEntry",
            rect: GRID_SLOT_GEOMETRY.referenceFirstEntry[bp],
          },
        ],
        bp
      ),
      ...getLayoutViolations(
        "wide-top",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "wideTop", rect: GRID_SLOT_GEOMETRY.wideTop[bp] },
        ],
        bp
      ),
    ]);
    expect(violations).toEqual([]);
  });

  it("keeps home / person activity preview rail and pagination collision-free on g2+", () => {
    const violations = (["g2", "g3", "g4"] as const).flatMap((bp) => [
      ...getLayoutViolations(
        "home-with-activities-rail",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          {
            name: "activitiesPreviewRail",
            rect: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
          },
          {
            name: "activitiesPreviewPagination",
            rect: { colStart: 1, colEnd: 2, rowStart: 5, rowEnd: 6 },
          },
        ],
        bp
      ),
      ...getLayoutViolations(
        "lyovson-feed-with-activities-rail",
        [
          { name: "nav", rect: GRID_SLOT_GEOMETRY.nav[bp] },
          { name: "hero", rect: GRID_SLOT_GEOMETRY.hero[bp] },
          {
            name: "activitiesPreviewRail",
            rect: { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 5 },
          },
          {
            name: "activitiesPreviewPagination",
            rect: { colStart: 1, colEnd: 2, rowStart: 5, rowEnd: 6 },
          },
        ],
        bp
      ),
    ]);
    expect(violations).toEqual([]);
  });

  it("defines every GRID_SLOTS and GRID_HERO_PANELS class in globals.css", () => {
    const globalsCss = readFileSync(
      resolve(process.cwd(), "src/app/(frontend)/globals.css"),
      "utf8"
    );

    for (const className of [
      ...Object.values(GRID_SLOTS),
      ...Object.values(GRID_HERO_PANELS),
    ]) {
      expect(globalsCss, `Missing .${className} rule in globals.css`).toContain(
        `.${className}`
      );
    }

    expect(GRID_CARD_ROWS).toEqual([
      "row-start-1 row-end-2",
      "row-start-2 row-end-3",
      "row-start-3 row-end-4",
    ]);
  });
});

describe("GridCard rendering optimization", () => {
  it("omits inline style attributes by default", () => {
    const html = renderToStaticMarkup(<GridCard>Card</GridCard>);
    expect(html).not.toContain("style=");
    expect(html).toContain("grid-card--default");
  });

  it("applies semantic slot and content variant classes cleanly", () => {
    const html = renderToStaticMarkup(
      <GridCard slot="bodyBelowHero" variant="content">
        Prose
      </GridCard>
    );
    expect(html).not.toContain("style=");
    expect(html).toContain("grid-card--content");
    expect(html).toContain("grid-slot-body-below-hero");
  });

  it("emits CSS custom property inline styles only when cols or rows are explicitly set", () => {
    const html = renderToStaticMarkup(
      <GridCard cols={2} rows={2}>
        Cells
      </GridCard>
    );
    expect(html).toContain("--grid-internal-cols:2");
    expect(html).toContain("--grid-internal-rows:2");
  });
});
