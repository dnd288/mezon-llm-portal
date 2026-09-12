import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

// Load local environment variables (same as Next.js does)
if (typeof process.loadEnvFile === "function") {
  if (fs.existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (fs.existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

const PORT = process.env.PORT || "3001";
const MOCK_PORT = process.env.MOCK_PORT || "3099";
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  /* Run tests with controlled concurrency to prevent Next.js dev server contention */
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
    /* Cross-browser testing for CI (install browsers first: bunx playwright install firefox webkit):
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    */
  ],
  webServer: [
    {
      command: `MOCK_PORT=${MOCK_PORT} bun run e2e/mock-backend.ts`,
      url: `http://localhost:${MOCK_PORT}/api/pricing`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    {
      command: `PORT=${PORT} NEW_API_BASE_URL=http://localhost:${MOCK_PORT} bun run dev`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
