import { describe, expect, it } from "vitest";
import {
  getPaginatedArchivePageState,
  isPaginatedArchivePageOutOfRange,
} from "./paginated-archive";

describe("archive page validation", () => {
  it.each([
    "abc",
    "0",
    "2junk",
    "2.5",
    "2e3",
    -1,
    1.5,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])("rejects invalid page %s", (page) => {
    expect(getPaginatedArchivePageState(page)).toEqual({ kind: "notFound" });
  });

  it("redirects page one to the canonical archive", () => {
    expect(getPaginatedArchivePageState("1")).toEqual({ kind: "redirect" });
  });

  it("accepts a complete integer page number", () => {
    expect(getPaginatedArchivePageState("3")).toEqual({
      kind: "page",
      pageNumber: 3,
    });
  });

  it.each([
    [2, 4, false],
    [4, 4, false],
    [2, 1, true],
    [2, 0, true],
    [5, 4, true],
  ])("checks page %s against %s total pages", (page, total, outOfRange) => {
    expect(isPaginatedArchivePageOutOfRange(page, total)).toBe(outOfRange);
  });
});
