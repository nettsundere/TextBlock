/**
 * Playwright fixtures: launch a persistent context with the instrumented
 * extension loaded, expose its service worker and extension id, and collect
 * coverage from the service worker after each test.
 */
const path = require('path');
const base = require('@playwright/test');
const { chromium } = require('@playwright/test');
const coverage = require('./coverage');

const EXT_PATH = path.resolve(__dirname, '..', 'dist-test');

const test = base.test.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        '--headless=new',
        `--disable-extensions-except=${EXT_PATH}`,
        `--load-extension=${EXT_PATH}`
      ]
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) {
      sw = await context.waitForEvent('serviceworker');
    }
    await use(sw);
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  }
});

// Pull accumulated istanbul counters out of the service worker after each test.
test.afterEach(async ({ serviceWorker }) => {
  try {
    const data = await serviceWorker.evaluate(() => globalThis.__coverage__ || {});
    coverage.add(data);
  } catch (e) {
    // Service worker may have been torn down with the context; ignore.
  }
});

test.afterAll(async () => {
  coverage.flush();
});

module.exports = { test, expect: base.expect };
