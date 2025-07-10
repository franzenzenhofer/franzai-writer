import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  
  // Visual regression testing configuration
  expect: {
    // Threshold for visual differences (0.0 = exact match, 1.0 = completely different)
    threshold: 0.5,
    // Pixel threshold for visual differences
    toHaveScreenshot: {
      threshold: 0.3,
      mode: 'actual',
      // Enable animations for visual tests to be consistent
      animations: 'disabled',
    },
    // Match screenshot options
    toMatchSnapshot: {
      threshold: 0.3,
      mode: 'actual',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Visual regression testing project - Chrome only for consistency
    {
      name: 'visual-regression',
      testMatch: '**/wizard-visual-regression.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual tests
        viewport: { width: 1280, height: 720 },
        // Disable animations for consistent screenshots
        actionTimeout: 10000,
        // Ensure consistent font rendering
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--font-render-hinting=none',
            '--disable-font-subpixel-positioning',
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 9002,
    reuseExistingServer: !process.env.CI,
  },
});