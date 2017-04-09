/**
 * User interface service.
 */
var UI = function() {
  // Icons states
  this.icons = {
    false: { // App is disabled
      "16": "icons/disabled/icon16.png",
      "24": "icons/disabled/icon24.png",
      "32": "icons/disabled/icon32.png"
    },
    true: { // App is enabled
      "16": "icons/enabled/icon16.png",
      "24": "icons/enabled/icon24.png",
      "32": "icons/enabled/icon32.png"
    }
  };

  // Tooltips states
  this.tooltips = {
    false: "Click to hide all text", // App is disabled
    true: "Click to show all text" // App is enabled
  };
};

/**
 * Toggle between app ui icon states.
 * @param isEnabled - bool value indicating whether the app is enabled.
 * @param callback - the callback to handle app ui state change.
 */
UI.prototype._ToggleIcons = function(isEnabled, callback) {
  chrome.browserAction.setIcon({
    path: this.icons[isEnabled]
  }, callback);
};

/**
 * Toggle between app ui tooltips states.
 * @param isEnabled - bool value indicating whether the app is enabled.
 */
UI.prototype._ToggleTooltips = function(isEnabled) {
  chrome.browserAction.setTitle({
    title: this.tooltips[isEnabled]
  });
};

/**
 * Toggle the interface state of the app.
 * @param isEnabled - bool value indicating whether the app is enabled.
 * @param callback - the callback to handle app ui state change.
 */
UI.prototype.ToggleInterfaceState = function(isEnabled, callback) {
  var that = this;
  that._ToggleIcons(isEnabled, function() {
    that._ToggleTooltips(isEnabled);
    callback();
  });
};
