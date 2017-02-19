var UI = function() {
  this.icons = {
    false: {
      "16": "icons/disabled/icon16.png",
      "24": "icons/disabled/icon24.png",
      "32": "icons/disabled/icon32.png"
    },
    true: {
      "16": "icons/enabled/icon16.png",
      "24": "icons/enabled/icon24.png",
      "32": "icons/enabled/icon32.png"
    }
  };

  this.tooltips = {
    false: "Click to hide all text",
    true: "Click to show all text"
  };
};

UI.prototype._ToggleIcons = function(isEnabled, callback) {
  chrome.browserAction.setIcon({
    path: this.icons[isEnabled]
  }, callback);
};

UI.prototype._ToggleTooltips = function(isEnabled) {
  chrome.browserAction.setTitle({
    title: this.tooltips[isEnabled]
  });
};

UI.prototype.ToggleInterfaceState = function(isEnabled, callback) {
  var that = this;
  that._ToggleIcons(isEnabled, function() {
    that._ToggleTooltips(isEnabled);
    callback();
  });
};
