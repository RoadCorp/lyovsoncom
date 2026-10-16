import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/utilities/payload-client", () => ({ getPayloadClient: vi.fn() }));

const { countSitemapUrls, getSitemapLocations, resolveHighlights } =
  await import("./live-metrics");

describe("live portfolio metrics", () => {
  it("counts sitemap entries and reads sitemap-index locations", () => {
    const sitemap =
      "<urlset><url><loc>https://example.am/a</loc></url><url><loc>https://example.am/b</loc></url></urlset>";
    expect(countSitemapUrls(sitemap)).toBe(2);
    expect(getSitemapLocations(sitemap)).toEqual([
      "https://example.am/a",
      "https://example.am/b",
    ]);
  });

  it("keeps the typed value when a live source can't be read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("down", { status: 503 }))
    );
    const [highlight] = await resolveHighlights([
      { value: "12", label: "Releases", live: "concernedeu-releases" },
    ]);
    expect(highlight.value).toBe("12");
    vi.unstubAllGlobals();
  });

  it("formats a live count", async () => {
    const releases = Array.from(
      { length: 1234 },
      (_, index) => `<url><loc>https://example.am/gallery/${index}</loc></url>`
    ).join("");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(`<urlset>${releases}</urlset>`))
    );
    const [highlight] = await resolveHighlights([
      { value: "12", label: "Releases", live: "concernedeu-releases" },
    ]);
    expect(highlight.value).toBe("1,234");
    vi.unstubAllGlobals();
  });
});
