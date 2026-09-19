import { defineConfig, devices } from '@playwright/test';

/**
 * Kiraa Agent Platform — Playwright config
 * - "ui" / "monitoring" projects: headed, slowed down, visible Chrome window.
 * - "api" project: headless, fast, no browser UI needed.
 *
 * Run only the visible UI/monitoring suite:
 *   npx playwright test --project=ui-chrome-visible
 *
 * Run only backend/API tests (headless):
 *   npx playwright test --project=api-headless
 *
 * Run everything:
 *   npx playwright test
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Visual / user-flow / monitoring scenarios — always visible.
      name: 'ui-chrome-visible',
      testMatch: /.*\.(ui|e2e|monitoring)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // uses installed Google Chrome, not bundled Chromium
        headless: false,
        launchOptions: {
          slowMo: 500, // ms delay between actions so clicks/typing are human-visible
        },
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      // Pure backend/API tests — fast, headless, no browser needed for assertions.
      name: 'api-headless',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});
