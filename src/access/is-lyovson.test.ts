import { describe, expect, it } from "vitest";
import { isLyovson } from "./is-lyovson";

describe("isLyovson", () => {
  it("accepts a Lyovson", () => {
    expect(isLyovson({ collection: "lyovsons" })).toBe(true);
  });

  it("rejects anonymous callers and other auth collections", () => {
    expect(isLyovson(null)).toBe(false);
    expect(isLyovson(undefined)).toBe(false);
    expect(isLyovson({ collection: "agents" })).toBe(false);
  });
});
