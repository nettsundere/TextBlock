const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: 'list'
});
