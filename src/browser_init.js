var application = new App();
var ui = new UI();
var pageInjector = new PageInjector(chrome);

/**
 * Apply a known state: keep the document_start stylesheet registration in sync
 * (so future loads hide text before paint), update the icon, and inject into
 * the given tab for an immediate effect on the already-open page.
 * @param isEnabled - the desired state.
 * @param tabId - the tab to inject into; if absent only icon + registration update.
 */
function applyState(isEnabled, tabId) {
  pageInjector.SyncContentScripts(isEnabled);
  ui.ToggleInterfaceState(isEnabled, function() {
    pageInjector.ToggleCSS(isEnabled, tabId);
  });
}

/**
 * Sync icon + injection to the stored state for a specific tab.
 * @param tabId - the tab to update; if absent only the icon is updated.
 */
function refresh(tabId) {
  application.GetEnabled(function(isEnabled) {
    applyState(isEnabled, tabId);
  });
}

/**
 * Resolve the active tab and refresh it.
 */
function refreshActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if(tabs.length) {
      refresh(tabs[0].id);
    }
  });
}

// Service worker (re)start: ensure stored default exists and sync the active tab.
chrome.runtime.onInstalled.addListener(function() {
  application.Init(function() { refreshActiveTab(); });
});

chrome.runtime.onStartup.addListener(function() {
  application.Init(function() { refreshActiveTab(); });
});

// Toggle application on / off
chrome.action.onClicked.addListener(function(tab) {
  application.GetEnabled(function(current) {
    application.SetEnabled(!current, function(isActive) {
      applyState(isActive, tab.id);
    });
  });
});

// tab navigated: re-apply once the page is ready
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete") {
    refresh(tabId);
  }
});

// active tab changed
chrome.tabs.onActivated.addListener(function(activeInfo) {
  refresh(activeInfo.tabId);
});

// content changed: iframes updated
chrome.runtime.onMessage.addListener(function(message, sender) {
  // Only trust messages originating from this extension's own injected code.
  if(sender.id !== chrome.runtime.id) {
    return;
  }
  if(message == "iframes_updated") {
    var tabId = sender.tab ? sender.tab.id : null;
    refresh(tabId);
  }
});
