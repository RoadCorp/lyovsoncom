import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isUnknownProfilePath,
  TOP_LEVEL_ROUTE_SEGMENTS,
} from "./top-level-routes";

const APP = path.join(process.cwd(), "src/app");

/** Dotless route folders at the top level, looking through (groups). */
function topLevelRouteFolders(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      if (entry.name.startsWith("(")) {
        return topLevelRouteFolders(path.join(directory, entry.name));
      }
      const isRouteSegment = !(
        entry.name.startsWith("[") ||
        entry.name.startsWith("_") ||
        entry.name.includes(".") ||
        entry.name === "fonts"
      );
      return isRouteSegment ? [entry.name] : [];
    });
}

describe("unknown profile paths", () => {
  it("lists every top-level route folder", () => {
    const missing = topLevelRouteFolders(APP).filter(
      (segment) => !TOP_LEVEL_ROUTE_SEGMENTS.has(segment)
    );
    expect(missing).toEqual([]);
  });

  it.each(["/nobody", "/no-such-user-xyz", "/nobody/posts", "/Rafa"])(
    "treats %s as an unknown profile",
    (pathname) => {
      expect(isUnknownProfilePath(pathname)).toBe(true);
    }
  );

  it.each([
    "/",
    "/rafa",
    "/jess/posts/page/2",
    "/posts/some-post",
    "/admin/login",
    "/api/search",
    "/sitemap.xml",
    "/.well-known/ai-resources",
    "/_next/image",
  ])("leaves %s to the router", (pathname) => {
    expect(isUnknownProfilePath(pathname)).toBe(false);
  });
});
