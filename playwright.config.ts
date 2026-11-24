import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * The target is a public third-party demo site, so tests run one at a time (workers: 1)
 * and there are no load-style loops. Retries are CI-only so flakiness stays visible locally.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: env.isCI ? [['blob'], ['github'], ['list']] : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
  ],
});
