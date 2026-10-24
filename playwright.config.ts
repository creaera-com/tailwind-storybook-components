import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:6007',
    headless: true,
    launchOptions: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
      ? { executablePath: process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'] }
      : {},
  },
  webServer: {
    command: 'node tools/serve-storybook.mjs',
    url: 'http://127.0.0.1:6007',
    reuseExistingServer: !process.env['CI'],
  },
});
