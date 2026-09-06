import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

test("initial shell exposes usable navigation before dynamic content", async ({
  page,
  baseURL,
}) => {
  await instant(
    page,
    async () => {
      await page.goto("/");
      await expect(
        page.getByRole("navigation", { name: "Main navigation" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Rafa", exact: true }).first()
      ).toBeVisible();
    },
    { baseURL }
  );
  await expect(page.locator('a[href^="/posts/"]').first()).toBeVisible();
});

test("menu navigation keeps its frame while destination work is withheld", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const posts = page.getByRole("link", { name: "Posts", exact: true });
  await expect(posts).toBeVisible();
  await instant(page, async () => {
    await posts.click();
    await page.waitForURL("**/posts");
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toBeVisible();
  });
  await expect(page.locator('a[href^="/posts/"]').first()).toBeVisible();
});

test("article and Back retain correct content and navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/posts");
  const article = page
    .locator('a[href^="/posts/"]')
    .filter({ has: page.locator("h2") })
    .first();
  const title = await article.locator("h2").innerText();
  const href = await article.getAttribute("href");
  await article.hover();
  await article.click();
  await expect(page).toHaveURL((url) => url.pathname === href);
  await expect(page.locator("h1").first()).toHaveText(title);
  await page.goBack();
  await expect(page).toHaveURL((url) => url.pathname === "/posts");
  await expect(article).toBeVisible();
  expect(errors).toEqual([]);
});

test("typing does not execute search and Escape restores navigation", async ({
  page,
}) => {
  const searchRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === "/api/search" ||
      (url.pathname.endsWith("/search") && url.searchParams.has("q"))
    ) {
      searchRequests.push(request.url());
    }
  });
  await page.goto("/search");
  const input = page.getByRole("searchbox", { name: "Search", exact: true });
  await input.fill("a query that is never submitted");
  await expect(input).toHaveValue("a query that is never submitted");
  await expect(
    page.getByRole("button", { name: "Submit search" })
  ).toBeEnabled();
  await input.press("Escape");
  await expect(page).toHaveURL((url) => url.pathname === "/");
  expect(searchRequests).toEqual([]);
});

test("public pages remain navigable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    `${test.info().project.use.baseURL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100"}/`
  );
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible();
  await expect(page.locator('a[href="/rafa"]').first()).toBeVisible();
  await context.close();
});

test("author context survives section changes and a journey beyond route retention", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Rafa", exact: true }).first().click();
  await expect(page).toHaveURL((url) => url.pathname === "/rafa");
  for (const section of ["Posts", "Notes", "Activities"]) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page
      .getByRole("link", { name: section, exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`/rafa/${section.toLowerCase()}$`));
    await expect(
      page.getByRole("link", { name: "Jess", exact: true }).first()
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "Jess", exact: true }).first().click();
  await expect(page).toHaveURL((url) => url.pathname === "/jess");
  for (const route of [
    "/rafa/activities",
    "/rafa/notes",
    "/rafa/posts",
    "/rafa",
    "/",
  ]) {
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(
      page.getByRole("navigation", { name: "Main navigation" })
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("the narrow menu stays usable in both themes and restores keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(menu).toBeEnabled();
  await menu.press("Enter");
  for (const theme of ["light", "dark"]) {
    if (!(await page.locator("html").getAttribute("class"))?.includes(theme)) {
      await page.getByRole("button", { name: "Theme", exact: true }).click();
    }
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await expect(
      page.getByRole("link", { name: "Posts", exact: true })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1);
    await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise(requestAnimationFrame);
      await Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.effect?.getComputedTiming().iterations !==
              Number.POSITIVE_INFINITY
          )
          .map((animation) => animation.finished.catch(() => null))
      );
    });
    await page.screenshot({
      animations: "disabled",
      path: test.info().outputPath(`narrow-menu-${theme}.png`),
    });
  }
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search", exact: true });
  await expect(search).toBeFocused();
  await search.press("Escape");
  await expect(
    page.getByRole("button", { name: "Search", exact: true })
  ).toBeFocused();
});
