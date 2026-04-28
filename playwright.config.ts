import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./src/__tests__/pages",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Snapshot tests are inherently sensitive to subpixel/animation drift; one
  // retry locally and two on CI smooths that out without masking real bugs.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 60000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 45000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "desktop-dark",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
      },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-dark",
      use: {
        ...devices["Pixel 5"],
        colorScheme: "dark",
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
})
