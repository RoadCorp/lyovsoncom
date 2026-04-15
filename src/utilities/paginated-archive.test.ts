import { describe, expect, it } from "vitest";
import {
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "./paginated-archive";

const FIRST_PAGE = 1;
const SECOND_PAGE = 2;
const FOURTH_PAGE = 4;
const FIFTH_PAGE = 5;
const THIRD_PAGE = 3;
const ZERO_PAGES = 0;

describe("getPaginatedArchivePageState", () => {
  it("returns notFound for invalid page numbers", () => {
    expect(getPaginatedArchivePageState("abc")).toEqual({
      kind: "notFound",
    });
    expect(getPaginatedArchivePageState("0")).toEqual({
      kind: "notFound",
    });
  });

  it("returns redirect for page 1", () => {
    expect(getPaginatedArchivePageState("1")).toEqual({
      kind: "redirect",
    });
  });

  it("returns the parsed page for valid paginated archive routes", () => {
    expect(getPaginatedArchivePageState("3")).toEqual({
      kind: "page",
      pageNumber: THIRD_PAGE,
    });
  });
});

describe("isPaginatedArchivePageOutOfRange", () => {
  it("returns false for a valid page inside the archive bounds", () => {
    expect(isPaginatedArchivePageOutOfRange(SECOND_PAGE, FOURTH_PAGE)).toBe(
      false
    );
  });

  it("returns true when the archive has no second page", () => {
    expect(isPaginatedArchivePageOutOfRange(SECOND_PAGE, FIRST_PAGE)).toBe(
      true
    );
    expect(isPaginatedArchivePageOutOfRange(SECOND_PAGE, ZERO_PAGES)).toBe(
      true
    );
  });

  it("returns true when the requested page exceeds total pages", () => {
    expect(isPaginatedArchivePageOutOfRange(FIFTH_PAGE, FOURTH_PAGE)).toBe(
      true
    );
  });
});
