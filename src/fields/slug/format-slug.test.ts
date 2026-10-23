import { describe, expect, it } from "vitest";
import { formatSlug } from "./format-slug";

describe("formatSlug", () => {
  it("drops the hyphen a trailing space would leave", () => {
    expect(formatSlug("Laurel: The Woman Who Collects Worlds ")).toBe(
      "laurel-the-woman-who-collects-worlds"
    );
  });

  it("keeps inner double hyphens so live URLs never change on re-save", () => {
    expect(formatSlug("stress--success")).toBe("stress--success");
    expect(formatSlug("Stress & Success")).toBe("stress--success");
  });
});
