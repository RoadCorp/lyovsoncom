import { describe, expect, it } from "vitest";
import {
  isHostileProbePath,
  shouldBlockExpensiveBotRequest,
} from "./request-guards";

describe("request guards", () => {
  it.each([
    "/.env",
    "/admin/.env",
    "/core/.env.save",
    "/.git/config",
    "/wp-login.php",
    "/server-status",
    "/actuator/env",
    "/defunct.dat",
    "/backup.sql",
    "/dump.sql.gz",
    "/old/archive.zip",
    "/db.sqlite",
    "/upload.php",
    "/shell.phtml",
    "/update/da222.php",
  ])("blocks hostile probe path %s", (pathname) => {
    expect(isHostileProbePath(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/posts/bye-bye-apple-tv",
    "/topics/media",
    "/feed.xml",
    "/posts/a.php-story",
  ])(
    "does not classify normal public path as a hostile probe: %s",
    (pathname) => {
      expect(isHostileProbePath(pathname)).toBe(false);
    }
  );

  it.each([
    ["/posts/example", "GPTBot", false],
    ["/", "ClaudeBot", false],
    ["/rafa/notes", "PerplexityBot", false],
    ["/api/posts", "GPTBot", true],
    ["/admin", "ClaudeBot", true],
    ["/playground/skeleton", "CCBot", true],
    ["/rafa/search", "GPTBot", true],
    ["/posts/example", "python-requests", true],
    ["/api/search", "python-requests", true],
    ["/admin/login", "curl/8.7.1", true],
    ["/search", "ClaudeBot", true],
    ["/searchlight", "ClaudeBot", false],
    ["/posts/example", "Googlebot", false],
    ["/posts/example", "Twitterbot", false],
    ["/posts/example", "Mozilla/5.0", false],
    ["/crest-light-simple.webp", "GPTBot", false],
    ["/postscripts", "GPTBot", false],
  ])("applies crawler policy to %s for %s", (pathname, userAgent, blocked) => {
    expect(shouldBlockExpensiveBotRequest(pathname, userAgent)).toBe(blocked);
  });
});
