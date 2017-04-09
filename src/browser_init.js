var application = new App();
var ui = new UI();

application.Init(function(appIsEnabled) {
  var isCurrentlyEnabled = appIsEnabled;
  var pageInjector = new PageInjector(chrome);

  var appHandler = function() { 
    ui.ToggleInterfaceState(isCurrentlyEnabled, function() {
      pageInjector.ToggleCSS(isCurrentlyEnabled);
    });
  };

  appHandler();

  var toggleHandler = function(tab) {
    isCurrentlyEnabled = !isCurrentlyEnabled;
    application.SetEnabled(isCurrentlyEnabled, function(isActive) {
      ui.ToggleInterfaceState(isActive, function() {
        pageInjector.ToggleCSS(isActive);
      });
    });
  };

  // Toggle application on / off
  chrome.browserAction.onClicked.addListener(toggleHandler);

  // tab changed
  chrome.tabs.onUpdated.addListener(appHandler);

  // tab created
  chrome.tabs.onCreated.addListener(appHandler);

  // active tab changed
  chrome.tabs.onActivated.addListener(appHandler);
});
