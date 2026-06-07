import { describe, expect, it } from "vitest";
import {
  isHostileProbePath,
  shouldBlockExpensiveBotRequest,
} from "./request-guards";

describe("request guards", () => {
  it.each([
    "/.env",
    "/.env.local",
    "/admin/.env",
    "/api/.env",
    "/laravel/.env",
    "/core/.env.save",
    "/.git/config",
    "/wp-login.php",
    "/wordpress/wp-login.php",
    "/xmlrpc.php",
    "/phpinfo.php",
    "/server-status",
    "/server-status/",
    "/upload.php",
    "/rip.php",
    "/ms-edit.php",
    "/update/da222.php",
  ])("blocks hostile probe path %s", (pathname) => {
    expect(isHostileProbePath(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/posts/bye-bye-apple-tv",
    "/topics/media",
    "/feed.xml",
  ])("does not classify normal public path as a hostile probe: %s", (pathname) => {
    expect(isHostileProbePath(pathname)).toBe(false);
  });

  it("blocks AI crawlers on expensive public paths without blocking search crawlers", () => {
    expect(shouldBlockExpensiveBotRequest("/posts/example", "GPTBot")).toBe(
      true
    );
    expect(shouldBlockExpensiveBotRequest("/posts/example", "Googlebot")).toBe(
      false
    );
  });
});
