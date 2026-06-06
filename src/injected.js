/**
 * Functions injected into page/frame contexts via chrome.scripting.executeScript.
 * They are serialized and run in the page's isolated world, so they must not
 * reference anything from the service worker scope.
 */

/**
 * Add the text-hiding stylesheet and watch for newly added iframes.
 * Uses an inline <style> (applies synchronously, no async fetch) appended to
 * <head> when available, otherwise documentElement, so it works at
 * document_start before <body> exists — avoiding any flash of visible text.
 */
function textBlockEnable(extId) {
  let existingInjection = document.getElementById('textblock_injection_css');
  if(!existingInjection) {
    let stylesheet = document.createElement('style');
    stylesheet.setAttribute('id', 'textblock_injection_css');
    stylesheet.textContent =
      "*,*::-webkit-input-placeholder{" +
      "color:rgba(0,0,0,0)!important;" +
      "-webkit-text-fill-color:rgba(0,0,0,0)!important;" +
      "text-shadow:none!important;}";

    let iframeUpdateHandler = () => { chrome.runtime.sendMessage(extId, "iframes_updated"); };
    let mutObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        let addNodes = mutation.addedNodes;
        if(addNodes) {
          for(var node of addNodes.values()) {
            if(node.nodeName.toLowerCase() == "iframe") {
              node.onload = iframeUpdateHandler;
            }
          }
        }
      });
    });

    mutObserver.observe(document.documentElement || document, { childList: true, subtree: true });

    (document.head || document.documentElement).appendChild(stylesheet);

    window.TextBlockMutationObserver = mutObserver;
  }
}

/**
 * Remove the stylesheet and stop watching iframes.
 */
function textBlockDisable() {
  let css = document.getElementById('textblock_injection_css');
  if(css) {
    if(window.TextBlockMutationObserver) {
      window.TextBlockMutationObserver.disconnect();
    }
    css.outerHTML = '';
  }
}
