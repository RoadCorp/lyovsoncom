import { describe, expect, it } from "vitest";
import { captionWithText } from "./extract-lexical-text";

const caption = (children: unknown[]) => ({
  root: { type: "root", children: [{ type: "paragraph", children }] },
});

describe("captionWithText", () => {
  it("drops a cleared caption", () => {
    expect(captionWithText(caption([]))).toBeNull();
    expect(captionWithText(caption([{ type: "text", text: "  " }]))).toBeNull();
    expect(captionWithText(null)).toBeNull();
  });

  it("keeps a caption with text", () => {
    const value = caption([{ type: "text", text: "On strike" }]);
    expect(captionWithText(value)).toBe(value);
  });
});
