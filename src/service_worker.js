/**
 * MV3 service worker entry point.
 * Loads the classic background scripts into the worker scope.
 */
importScripts(
  "injected.js",
  "page_injector.js",
  "ui.js",
  "app.js",
  "browser_init.js"
);
