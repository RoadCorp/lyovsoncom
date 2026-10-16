/**
 * Captures screenshots of live sites for portfolio covers and galleries:
 * desktop (1440×900) and phone (390×844), each in light and dark, at 2×.
 * Files land in tmp/portfolio-shots/<host>-<viewport>-<theme>.png; upload
 * them in the admin. The script only reads public pages and never touches
 * a database. Re-run it whenever a site changes, and set the gallery item's
 * capture date to the day you ran it.
 *
 *   node scripts/capture-portfolio-screenshots.mjs [url ...]
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const DEFAULT_URLS = [
  "https://www.individuum.am",
  "https://www.avenews.am",
  "https://www.bagaranagency.com",
  "https://www.concernedeu.com",
  "https://www.lyovson.com",
];
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};
const THEMES = ["light", "dark"];
// Some sites (lyovson.com included) refuse headless user agents.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const SETTLE_MS = 1500;
const NETWORK_IDLE_TIMEOUT_MS = 10_000;

const outputDir = fileURLToPath(
  new URL("../tmp/portfolio-shots/", import.meta.url)
);
const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_URLS;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();

try {
  for (const url of urls) {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const colorScheme of THEMES) {
        const context = await browser.newContext({
          colorScheme,
          deviceScaleFactor: 2,
          isMobile: viewportName === "phone",
          hasTouch: viewportName === "phone",
          reducedMotion: "reduce",
          userAgent: USER_AGENT,
          viewport,
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: "load" });
        // Analytics beacons can keep the network busy; settle either way.
        await page
          .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS })
          .catch(() => undefined);
        await page.waitForTimeout(SETTLE_MS);
        const path = `${outputDir}${host}-${viewportName}-${colorScheme}.png`;
        await page.screenshot({ path });
        console.log(path);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
