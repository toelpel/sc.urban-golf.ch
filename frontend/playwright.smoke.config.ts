import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke-Suite: kein Backend erforderlich, alle API-Routen werden gemockt.
 * Gedacht für schnelle Sanity-Tests in CI und bei Pre-Push Hooks.
 *
 * Start-Script: `npm run test:e2e:smoke`
 * Die Vite-Dev-Server-Instanz wird automatisch gestartet (webServer).
 */
const PORT = 5173

export default defineConfig({
  testDir: './e2e/smoke',
  outputDir: './e2e/test-results-smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 20_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report-smoke' }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: 'playwright-report-smoke' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
  },

  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
