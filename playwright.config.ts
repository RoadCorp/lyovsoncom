import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "/private/tmp/lyovson-playwright-results",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit",
      testMatch: ["**/public-navigation.spec.ts", "**/media.spec.ts"],
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "firefox",
      testMatch: ["**/public-navigation.spec.ts", "**/media.spec.ts"],
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
