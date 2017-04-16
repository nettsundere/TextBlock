/**
 * CSS injector.
 */
var PageInjector = function(chrome) {
  this.chrome = chrome; 
};

/**
 * Toggle text hiding on/off.
 * @param isEnabled - bool value indicating whether the text hiding sequence should be added/removed.
*/
PageInjector.prototype.ToggleCSS = function (isEnabled) {
  var cssLocation = chrome.extension.getURL("/css/text_block.css");
  var extId = chrome.runtime.id;

  if(isEnabled) {
    var code = `(() => {
      let body = document.querySelectorAll('html body');
      let existingInjection = document.getElementById('textblock_injection_css');
      if(body.length && !existingInjection) {
        let stylesheet = document.createElement('link');
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.setAttribute('id', 'textblock_injection_css');
        stylesheet.setAttribute('href', '${cssLocation}');
        
        let iframeTag = "iframe";

        let iframeUpdateHandler = () => { chrome.runtime.sendMessage("${extId}", "iframes_updated"); };
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
        
        mutObserver.observe(document, { childList: true, subtree: true });

        body[0].appendChild(stylesheet);

        window.TextBlockMutationObserver = mutObserver;
    }})();`;
  }
  else
  {
    var code = `(() => {
                  let css = document.getElementById('textblock_injection_css');
                  if(css) {
                    if(window.TextBlockMutationObserver) {
                      window.TextBlockMutationObserver.disconnect();
                    }
                    css.outerHTML = '';
                  }
               })();`;
  }
  chrome.tabs.executeScript({ code: code, allFrames: true });
}
