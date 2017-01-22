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

function searchTabs() {
  var searchText = document.getElementById('search_box').value;
  var results = fuse.search(searchText);
  var resText = "";
  for (let result of results) {
    resText = resText + "Title: " + result.title + "\nurl: " + result.url + "\n\n";
    renderStatus(resText);
  }
}

var fuse;
document.addEventListener('DOMContentLoaded', function() {
  console.log("getting all tabs");
  
  // Add event handler to input box
  var inputBox = document.getElementById('search_box');
  inputBox.addEventListener('keyup', searchTabs);

  getAllTabs(function(tabs) {
    var urls = "";
    var tabsToSearch = [];
    for (let tab of tabs) {
      tabsToSearch.push({
        title: tab.title,
        url: tab.url
      })
      urls = urls + tab.url + "\n";
    }
    
    var searchOpts = {
      shouldSort: true,
      keys: ["title", "url"]
    }
    fuse = new Fuse(tabsToSearch, searchOpts);
    // renderStatus(urls);
  });
});
