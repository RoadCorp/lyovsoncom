import { describe, expect, it } from "vitest";
import { lyovsonPortfolioWhere, moreWorkWhere } from "./content-queries";
import { generateArticleSchema } from "./generate-json-ld";
import { formatProjectYears, getProjectHost } from "./project-display";
import { getPublishedProject } from "./public-project";

describe("portfolio queries", () => {
  it("lists only published projects that credit the person", () => {
    expect(lyovsonPortfolioWhere(7)).toEqual({
      people: { contains: 7 },
      _status: { equals: "published" },
    });
  });

  it("finds other published work by the same people", () => {
    expect(moreWorkWhere([1, 2], 9)).toEqual({
      people: { in: [1, 2] },
      id: { not_equals: 9 },
      _status: { equals: "published" },
    });
  });
});

describe("post links to projects", () => {
  it("hides a project until it is published", () => {
    expect(
      getPublishedProject({ _status: "draft", slug: "avenews" })
    ).toBeNull();
    expect(getPublishedProject(3)).toBeNull();
    expect(
      getPublishedProject({ _status: "published", slug: "avenews" })
    ).toMatchObject({ slug: "avenews" });
  });
});

describe("project display", () => {
  it("reads the picked month's year for editors east of UTC", () => {
    // January 2025 picked at local midnight in Yerevan (UTC+4).
    expect(formatProjectYears({ startedAt: "2024-12-31T20:00:00.000Z" })).toBe(
      "2025–present"
    );
  });

  it("collapses a single-year project and spans multi-year ones", () => {
    expect(
      formatProjectYears({
        startedAt: "2025-03-01T12:00:00.000Z",
        endedAt: "2025-09-01T12:00:00.000Z",
      })
    ).toBe("2025");
    expect(
      formatProjectYears({
        startedAt: "2023-03-01T12:00:00.000Z",
        endedAt: "2025-09-01T12:00:00.000Z",
      })
    ).toBe("2023–2025");
  });

  it("shows a bare host for the live link", () => {
    expect(getProjectHost("https://www.example.am/en")).toBe("example.am");
    expect(getProjectHost("not a url")).toBeNull();
  });
});

describe("case-study structured data", () => {
  it("describes the article and the website it is about", () => {
    const schema = generateArticleSchema({
      title: "Example",
      slug: "example",
      url: "https://www.example.am/projects/example",
      publishedAt: "2026-10-16T12:00:00.000Z",
      authors: [{ name: "Rafa Lyóvson", username: "rafa" }],
      about: {
        name: "Example",
        url: "https://example.am",
        creators: [{ name: "Rafa Lyóvson", username: "rafa" }],
        dateCreated: "2025-03-01T12:00:00.000Z",
        keywords: ["Next.js", "Payload"],
      },
    });

    expect(schema["@type"]).toBe("Article");
    expect(schema.datePublished).toBe("2026-10-16T12:00:00.000Z");
    expect(schema.about).toMatchObject({
      "@type": "WebSite",
      name: "Example",
      url: "https://example.am",
      keywords: "Next.js, Payload",
      creator: [expect.objectContaining({ "@type": "Person" })],
    });
  });
});
