import { describe, expect, it } from "vitest";
import { buildDynamicOgImageUrl } from "./og-image";

describe("buildDynamicOgImageUrl", () => {
  it("builds a clean /og query URL with trimmed fields", () => {
    const url = buildDynamicOgImageUrl({
      eyebrow: "  Article  ",
      title: "Designing   the Crest",
      meta: "Rafa Lyóvson · 2026",
    });

    expect(url).toBe(
      "/og?title=Designing+the+Crest&eyebrow=Article&meta=Rafa+Ly%C3%B3vson+%C2%B7+2026"
    );
  });

  it("clamps overly long titles with an ellipsis", () => {
    const longTitle = "A".repeat(140);
    const url = buildDynamicOgImageUrl({ title: longTitle });
    const parsed = new URL(url, "https://www.lyovson.com");
    const title = parsed.searchParams.get("title") ?? "";

    expect(title.length).toBeLessThanOrEqual(110);
    expect(title.endsWith("…")).toBe(true);
  });
});
