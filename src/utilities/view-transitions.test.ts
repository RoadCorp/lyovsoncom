import { describe, expect, it } from "vitest";
import {
  getArchiveCardTransitionName,
  getNoteMetaTransitionName,
  getPostTitleTransitionName,
} from "./view-transitions";

const VALID_TRANSITION_NAME = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const SHARED_ID = 12;

describe("shared element identity", () => {
  it("keeps punctuation, Unicode, and literal escape sequences distinct", () => {
    const slugs = ["a/b", "a b", "a-b", "a_2f_b", "a_b", "բարեւ", "hello😀"];
    const names = slugs.map(getPostTitleTransitionName);

    expect(new Set(names).size).toBe(slugs.length);
    for (const name of names) {
      expect(name).toMatch(VALID_TRANSITION_NAME);
    }
  });

  it("separates collections and note metadata sharing targets", () => {
    const names = [
      getArchiveCardTransitionName("post", SHARED_ID),
      getArchiveCardTransitionName("note", SHARED_ID),
      getArchiveCardTransitionName("activity", SHARED_ID),
      getNoteMetaTransitionName("same-note", "topics"),
      getNoteMetaTransitionName("same-note", "byline"),
      getNoteMetaTransitionName("same-note", "type"),
    ];

    expect(new Set(names).size).toBe(names.length);
    expect(getArchiveCardTransitionName("post", SHARED_ID)).toBe(
      getArchiveCardTransitionName("post", String(SHARED_ID))
    );
  });
});
