import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const frontend = path.join(process.cwd(), "src/app/(frontend)");
const prerenders = JSON.parse(
  fs.readFileSync(".next/prerender-manifest.json", "utf8")
).routes as Record<string, { srcRoute?: string }>;
const patterns = fs
  .readdirSync(frontend, { recursive: true })
  .filter(
    (file) =>
      typeof file === "string" &&
      (file === "page.tsx" || file.endsWith("/page.tsx"))
  )
  .map(
    (file) =>
      `/${String(file).replace(/\/?page\.tsx$/, "")}`.replace(/\/$/, "") || "/"
  );

for (const pattern of patterns) {
  if (pattern === "/playground") {
    continue;
  }
  const fixture = pattern.includes("[")
    ? Object.keys(prerenders).find(
        (route) =>
          prerenders[route].srcRoute === pattern &&
          !route.includes("placeholder")
      ) ||
      Object.keys(prerenders)
        .find((route) => prerenders[route].srcRoute === pattern)
        ?.replace("__placeholder__", "1")
    : pattern;
  test(`direct load: ${pattern}`, async ({ page }) => {
    expect(
      fixture,
      `No published build fixture covers ${pattern}`
    ).toBeTruthy();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(fixture || "/");
    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page).toHaveTitle(/\S/);
    expect(errors).toEqual([]);
  });
}

test("unpublished and invalid destinations return missing-page metadata", async ({
  page,
}) => {
  await page.goto("/posts/codex-unpublished-fixture-does-not-exist");
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first()
  ).toBeAttached();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible();
});

test("protected playground keeps its unauthenticated redirect", async ({
  request,
}) => {
  const response = await request.get("/playground", {
    maxRedirects: 0,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await response.text();
  expect(
    response.headers().location?.includes("/admin") || html.includes("/admin")
  ).toBeTruthy();
});
