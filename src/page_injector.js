var PageInjector = function(chrome) {
  this.chrome = chrome; 
};

/**
  Toggle text hiding on/off
*/
PageInjector.prototype.ToggleCSS = function (isEnabled) {
  var cssLocation = chrome.extension.getURL("/css/text_block.css");

  if(isEnabled) {
    var code = "var __body = document.querySelectorAll('html body'); " +
               "var __existingInjection = document.querySelectorAll('#textblock_injection'); " +
               "if(__body.length && !__existingInjection.length) {" +
                  "var __stylesheet = document.createElement('link'); " +
                  "__stylesheet.setAttribute('rel', 'stylesheet'); " +
                  "__stylesheet.setAttribute('id', 'textblock_injection');" +
                  "__stylesheet.setAttribute('href', '" + cssLocation + "');" +
                  "__body[0].appendChild(__stylesheet);" + 
              " } ";
  }
  else
  {
    var code = "var __existingInjection = document.querySelectorAll('#textblock_injection'); " +
               "if(__existingInjection.length) {" +
                  "__existingInjection[0].outerHTML = '';" +
               " } ";
  }

  chrome.tabs.executeScript({ code: code });
}
