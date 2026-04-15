import { describe, expect, it } from "vitest";
import { dedupeRelationItemsById } from "./dedupeRelationItemsById";

describe("dedupeRelationItemsById", () => {
  it("removes duplicate relation objects while preserving order", () => {
    const items = [
      { id: 1, name: "Rafa" },
      { id: 2, name: "Jess" },
      { id: 1, name: "Rafa Duplicate" },
    ];

    expect(dedupeRelationItemsById(items)).toEqual([
      { id: 1, name: "Rafa" },
      { id: 2, name: "Jess" },
    ]);
  });

  it("ignores primitive and malformed relation values", () => {
    const items = [
      1,
      "2",
      null,
      undefined,
      { slug: "missing-id" },
      { id: null, name: "Invalid" },
      { id: "topic-1", name: "Valid" },
    ];

    expect(dedupeRelationItemsById(items)).toEqual([
      { id: "topic-1", name: "Valid" },
    ]);
  });
});
