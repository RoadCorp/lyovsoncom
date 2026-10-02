import { describe, expect, it } from "vitest";
import { getSocialImage } from "./seo-metadata";

describe("social preview images", () => {
  it("serves Blob uploads through the optimizer at the Open Graph width", () => {
    const image = getSocialImage({
      url: "https://abc123.public.blob.vercel-storage.com/Finding%20the%20Truth%20wide.png",
      width: 2400,
      height: 1260,
      alt: "Cover",
    });
    expect(image.url).toMatch(
      /\/_next\/image\?url=https%3A%2F%2Fabc123\.public\.blob\.vercel-storage\.com%2FFinding%2520the%2520Truth%2520wide\.png&w=1200&q=75$/
    );
    expect(image).toMatchObject({ width: 1200, height: 630, alt: "Cover" });
  });

  it("leaves other images unchanged", () => {
    expect(
      getSocialImage({ url: "https://www.lyovson.com/og-default.png" })
    ).toMatchObject({ url: "https://www.lyovson.com/og-default.png" });
  });
});
