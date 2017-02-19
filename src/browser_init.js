var application = new App();
var ui = new UI();

application.Init(function() {
  var pageInjector = new PageInjector(chrome);

  application.GetEnabled(function(isCurrentlyEnabled) {
    pageInjector.ToggleCSS(isCurrentlyEnabled);
  });

  var appHandler = function() { 
    application.GetEnabled(function(isCurrentlyEnabled) {
      ui.ToggleInterfaceState(isCurrentlyEnabled, function() {
        pageInjector.ToggleCSS(isCurrentlyEnabled);
      });
    });
  };

  var toggleHandler = function(tab) {
    application.GetEnabled(function(isCurrentlyEnabled) {
      application.SetEnabled(!isCurrentlyEnabled, function(isActive) {
        ui.ToggleInterfaceState(isActive, function() {
          pageInjector.ToggleCSS(isActive);
        });
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
