/**
 * Document-start content script. Registered dynamically while hiding is enabled
 * so the stylesheet is in place before the page paints (no flash of text).
 * Loaded after injected.js, which defines textBlockEnable.
 */
textBlockEnable(chrome.runtime.id);
