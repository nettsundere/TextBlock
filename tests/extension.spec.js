const { test, expect } = require('./fixtures');
const { BASE_URL } = require('./server');

const HIDDEN = 'rgba(0, 0, 0, 0)';

/** Wait until App.Init has written the default flag, to avoid racing its write. */
function waitInit(sw) {
  return sw.evaluate(
    () =>
      new Promise((resolve) => {
        const check = () =>
          chrome.storage.sync.get('enabled', (i) =>
            i.enabled === undefined ? setTimeout(check, 50) : resolve()
          );
        check();
      })
  );
}

/** Set the stored enabled flag from the service worker scope. */
async function setEnabled(sw, value) {
  await waitInit(sw);
  await sw.evaluate(
    (v) => new Promise((resolve) => chrome.storage.sync.set({ enabled: v }, resolve)),
    value
  );
}

/** Wait until the top document's text has been hidden by the injected CSS. */
function waitHidden(page) {
  return page.waitForFunction(
    (hidden) => {
      const el = document.getElementById('text');
      return el && getComputedStyle(el).color === hidden;
    },
    HIDDEN,
    { timeout: 10000 }
  );
}

function textColor(page) {
  return page.evaluate(() => getComputedStyle(document.getElementById('text')).color);
}

test('extension loads with a service worker and id', async ({ serviceWorker, extensionId }) => {
  expect(serviceWorker).toBeTruthy();
  expect(extensionId).toMatch(/^[a-z]{32}$/);
});

test('text is visible by default (disabled state)', async ({ context }) => {
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  // Give the service worker a chance to (not) inject.
  await page.waitForTimeout(1000);
  await expect(page.locator('#textblock_injection_css')).toHaveCount(0);
  expect(await textColor(page)).not.toBe(HIDDEN);
});

test('enabling hides all text', async ({ context, serviceWorker }) => {
  await setEnabled(serviceWorker, true);
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(page);
  await expect(page.locator('#textblock_injection_css')).toHaveCount(1);
  expect(await textColor(page)).toBe(HIDDEN);
});

test('disabling shows text again', async ({ context, serviceWorker }) => {
  await setEnabled(serviceWorker, true);
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(page);

  await setEnabled(serviceWorker, false);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(
    () => !document.getElementById('textblock_injection_css'),
    null,
    { timeout: 10000 }
  );
  expect(await textColor(page)).not.toBe(HIDDEN);
});

test('dynamically added iframes get hidden via the message path', async ({ context, serviceWorker }) => {
  await setEnabled(serviceWorker, true);
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(page);

  await page.evaluate((base) => window.addFrame(base + '/frame.html'), BASE_URL);

  const frame = await page.waitForSelector('#dynamic-frame');
  const contentFrame = await frame.contentFrame();
  await contentFrame.waitForFunction(
    (hidden) => {
      const el = document.getElementById('frame-text');
      return el && getComputedStyle(el).color === hidden;
    },
    HIDDEN,
    { timeout: 10000 }
  );
});

test('text is hidden at document_start with no flash (registered content script)', async ({ context, serviceWorker }) => {
  await setEnabled(serviceWorker, true);
  // Drive the enable path so the document_start stylesheet gets registered.
  const warmup = await context.newPage();
  await warmup.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(warmup);

  const registered = await serviceWorker.evaluate(
    () => new Promise((r) => chrome.scripting.getRegisteredContentScripts({ ids: ['textblock_css'] }, r))
  );
  expect(registered.length).toBe(1);
  expect(registered[0].runAt).toBe('document_start');
  expect(registered[0].js).toContain('content_start.js');

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(page);

  // The stylesheet is an inline <style> (applies synchronously, no async fetch),
  // which is what allows hiding before paint with no flash.
  const tag = await page.evaluate(
    () => document.getElementById('textblock_injection_css').tagName
  );
  expect(tag).toBe('STYLE');
  expect(await textColor(page)).toBe(HIDDEN);
});

test('switching tabs re-applies state (onActivated)', async ({ context, serviceWorker }) => {
  await setEnabled(serviceWorker, true);
  const first = await context.newPage();
  await first.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(first);

  const second = await context.newPage();
  await second.goto(BASE_URL, { waitUntil: 'load' });
  await waitHidden(second);

  // Re-activate the first tab to trigger the onActivated handler.
  await first.bringToFront();
  await waitHidden(first);
  expect(await textColor(first)).toBe(HIDDEN);
});
