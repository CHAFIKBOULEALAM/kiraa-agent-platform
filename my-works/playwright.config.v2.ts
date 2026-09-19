import { defineConfig, devices } from '@playwright/test';

/**
 * Kiraa Agent Platform — Playwright config (v2)
 * - "ui-chrome-visible": headed, slowMo'd, visible Chrome — for UI/monitoring specs.
 * - "api-headless": headless, fast — for backend/API specs.
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
  timeout: 120_000, // default, overridden per-project below where needed
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
      // Visual / user-flow / monitoring scenarios — always visible, human-paced.
      name: 'ui-chrome-visible',
      testMatch: /.*\.(ui|e2e|monitoring)\.spec\.ts/,
      timeout: 180_000, // bumped from 120s to absorb slowMo overhead across multi-step flows
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // launches installed Google Chrome, not bundled Chromium
        headless: false,
        launchOptions: {
          slowMo: 500, // ms delay between actions for visible, human-like pacing
        },
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      // Pure backend/API tests — fast, headless, no visible browser needed.
      name: 'api-headless',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});
