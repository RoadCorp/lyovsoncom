import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const bundle = buildSync({
  entryPoints: ["e2e/fixtures/media.tsx"],
  bundle: true,
  write: false,
  alias: { "next/image": "./e2e/fixtures/next-image.ts" },
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: {
    "process.env": "{}",
    "process.env.NODE_ENV": '"production"',
    "process.env.__NEXT_IMAGE_OPTS": "undefined",
  },
}).outputFiles[0].text;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.pause = function pause() {
      this.dataset.paused = "true";
    };
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Clipboard denied")) },
    });
  });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/fixture.js") {
      return route.fulfill({ contentType: "text/javascript", body: bundle });
    }
    if (url.hostname === "media-fixture.test" && url.pathname === "/") {
      return route.fulfill({
        contentType: "text/html",
        body: '<!doctype html><html><body><style>button{min-width:40px;min-height:40px} .media-frame{position:relative;width:400px} video{width:320px;height:180px}</style><div id="root"></div><script src="/fixture.js"></script></body></html>',
      });
    }
    return route.fulfill({ status: 204 });
  });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("http://media-fixture.test/");
  await expect(
    page.getByRole("button", { name: "Toggle activity" })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("Activity hiding pauses an observed lazy video", async ({ page }) => {
  await expect(page.locator("video source")).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await expect(page.locator("video")).toHaveAttribute("data-paused", "true");
});

test("returning to a hidden YouTube player requires another deliberate play", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Play video" }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play video" })).toBeVisible();
});

test("clipboard failure is announced and cleared when the content is hidden", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("status")).toContainText("Copy failed");
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  await expect(page.getByRole("status")).toBeEmpty();
});

test("a delayed clipboard result cannot restore feedback after returning", async ({
  page,
}) => {
  await page.evaluate(() => {
    navigator.clipboard.writeText = () =>
      new Promise<void>((resolve) => {
        document.addEventListener("finish-copy", () => resolve(), {
          once: true,
        });
      });
  });
  await page.getByRole("button", { name: "Copy code" }).click();
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await page.getByRole("button", { name: "Toggle activity" }).click();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  await page.evaluate(async () => {
    document.dispatchEvent(new Event("finish-copy"));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  expect(await page.getByRole("status").textContent()).toBe("");
});
