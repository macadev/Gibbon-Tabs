// Close the popup when the escape key is pressed
document.onkeydown = function(event) {
  event = event || window.event;
  if (event.keyCode == 27) {
    window.close();
  }
};

function getAllTabs(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {};
  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("getting all tabs");
  getAllTabs(function(tabs) {
    var urls = "";
    for (let tab of tabs) {
      urls = urls + tab.url + "\n";
    }
    renderStatus(urls);
  });
});
