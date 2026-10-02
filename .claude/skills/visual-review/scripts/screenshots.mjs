// Screenshot routes on two origins at desktop and phone width, light and
// dark, for side-by-side review.
//
//   OUT=/tmp/shots TAG=change ROUTES=/,/notes node screenshots.mjs \
//     https://www.lyovson.com http://127.0.0.1:3100
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require("@playwright/test");

const UA =
  "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140 Safari/537.36";
const VIEWPORTS = {
  desk: { width: 1440, height: 900 },
  mob: { width: 390, height: 844 },
};
const [before, after] = process.argv.slice(2);
const out = process.env.OUT ?? "shots";
const tag = process.env.TAG ?? "review";
const routes = (process.env.ROUTES ?? "/").split(",");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [label, origin] of [
  ["before", before],
  ["after", after],
].filter(([, o]) => o)) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport,
        userAgent: UA,
        colorScheme: theme,
      });
      await context.addInitScript(
        (t) => localStorage.setItem("theme", t),
        theme
      );
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(origin + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        const name = route.replace(/\W+/g, "_");
        await page.screenshot({
          path: `${out}/${tag}-${label}-${viewportName}-${theme}-${name}.png`,
        });
      }
      await context.close();
    }
  }
}
await browser.close();
console.log(`screenshots in ${out}`);
