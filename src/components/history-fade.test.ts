import { describe, expect, it } from "vitest";
import { shouldFadeNavigation } from "./history-fade";

describe("Back/Forward fade", () => {
  it("fades history traversals", () => {
    expect(shouldFadeNavigation({ navigationType: "traverse" })).toBe(true);
    expect(
      shouldFadeNavigation({
        navigationType: "traverse",
        hasUAVisualTransition: false,
      })
    ).toBe(true);
  });

  it("skips traversals the browser already animated, like swipe-back", () => {
    expect(
      shouldFadeNavigation({
        navigationType: "traverse",
        hasUAVisualTransition: true,
      })
    ).toBe(false);
  });

  it.each(["push", "replace", "reload"] as const)(
    "leaves %s navigations to view transitions",
    (navigationType) => {
      expect(shouldFadeNavigation({ navigationType })).toBe(false);
    }
  );
});
