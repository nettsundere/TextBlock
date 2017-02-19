var App = function() {
};

App.prototype.Init = function (callback) {
  var that = this;
  chrome.storage.sync.get("enabled", function(items) {
    if(items["enabled"] === undefined) {
      that.SetEnabled(false, callback);
    }
    else {
      that.GetEnabled(callback);
    }
  });
};

App.prototype.SetEnabled = function (newState, callback) {
  chrome.storage.sync.set({ "enabled": newState }, function() {
    callback(newState);
  });
};

App.prototype.GetEnabled = function (callback) {
  chrome.storage.sync.get("enabled", function(items) {
    callback(items["enabled"] === true);
  });
};
