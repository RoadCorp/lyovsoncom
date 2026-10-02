import { describe, expect, it } from "vitest";
import { getRelationId, isPopulated } from "./relations";

describe("getRelationId", () => {
  it.each([
    ["a numeric id", 42, 42],
    ["a string id", "abc", "abc"],
    ["a populated document", { id: 7, title: "Book" }, 7],
  ])("returns the id from %s", (_label, value, expected) => {
    expect(getRelationId(value)).toBe(expected);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["an object without an id", { title: "Book" }],
  ])("returns null for %s", (_label, value) => {
    expect(getRelationId(value)).toBeNull();
  });
});

describe("isPopulated", () => {
  it("distinguishes documents from ids", () => {
    expect(isPopulated({ id: 1 })).toBe(true);
    expect(isPopulated(1)).toBe(false);
    expect(isPopulated(null)).toBe(false);
  });
});
