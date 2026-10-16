import { describe, expect, it } from "vitest";
import { getTechInfo } from "./tech-stack";

describe("tech stack pills", () => {
  it("links a known tool and keeps its brand hue", () => {
    expect(getTechInfo("Tailwind CSS")).toMatchObject({
      color: "#06B6D4",
      shortName: "Tailwind",
      url: "https://tailwindcss.com",
    });
  });

  it("drops black and white marks, which have no hue to tint with", () => {
    const nextjs = getTechInfo("Next.js");
    expect(nextjs.icon).toBeDefined();
    expect(nextjs.color).toBeUndefined();
  });

  it("shows an unknown tool as plain text", () => {
    expect(getTechInfo("Something New")).toEqual({ name: "Something New" });
  });
});
