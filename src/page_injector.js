/**
 * CSS injector.
 */
var PageInjector = function(chrome) {
  this.chrome = chrome;
};

PageInjector.CONTENT_SCRIPT_ID = "textblock_css";

/**
 * Register/unregister a document_start content stylesheet so text is hidden
 * before the page paints (avoids the flash of visible text on new loads).
 * @param isEnabled - bool value indicating whether hiding is on.
 */
PageInjector.prototype.SyncContentScripts = function (isEnabled) {
  var id = PageInjector.CONTENT_SCRIPT_ID;

  return chrome.scripting.getRegisteredContentScripts({ ids: [id] })
    .then(function(existing) {
      var isRegistered = existing.length > 0;
      if(isEnabled && !isRegistered) {
        return chrome.scripting.registerContentScripts([{
          id: id,
          js: ["injected.js", "content_start.js"],
          matches: ["http://*/*", "https://*/*"],
          runAt: "document_start",
          allFrames: true,
          persistAcrossSessions: true
        }]);
      }
      if(!isEnabled && isRegistered) {
        return chrome.scripting.unregisterContentScripts({ ids: [id] });
      }
    })
    .catch(function() { /* registration races are non-fatal */ });
};

/**
 * Toggle text hiding on/off.
 * @param isEnabled - bool value indicating whether the text hiding sequence should be added/removed.
 * @param tabId - the id of the tab to inject into.
*/
PageInjector.prototype.ToggleCSS = function (isEnabled, tabId) {
  if(tabId === undefined || tabId === null) {
    return;
  }

  var extId = chrome.runtime.id;

  if(isEnabled) {
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      args: [extId],
      func: textBlockEnable
    });
  }
  else {
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      func: textBlockDisable
    });
  }
}
