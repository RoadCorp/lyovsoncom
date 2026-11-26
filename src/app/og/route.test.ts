import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("dynamic /og image route", () => {
  it("renders a valid PNG Open Graph card with self-hosted Plex fonts", async () => {
    const response = await GET(
      new Request(
        "https://www.lyovson.com/og?title=Archival+Editorial+Craft&eyebrow=Article&meta=Rafa+Ly%C3%B3vson+%C2%B7+Nov+2026"
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(response.headers.get("cache-control")).toContain("public");

    const bytes = new Uint8Array(await response.arrayBuffer());
    // PNG magic signature: 89 50 4E 47 0D 0A 1A 0A
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    expect(bytes.byteLength).toBeGreaterThan(5000);
  });
});
