import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Based on Phase2-测试指南.md
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid state conflicts
  reporter: 'list',
  timeout: 60000, // Increase timeout to 60 seconds
  use: {
    baseURL: 'http://localhost:9082',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  // Don't start webServer automatically - use existing server
  // webServer: {
  //   command: 'pnpm run dev',
  //   url: 'http://localhost:9082',
  //   reuseExistingServer: true,
  //   timeout: 120 * 1000,
  // },
});
