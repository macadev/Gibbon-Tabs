// Close the popup when the escape key is pressed
document.onkeydown = function(event) {
  event = event || window.event;
  if (event.keyCode == 27) {
    window.close();
  }
};

function getAllTabs(callback) {
  var queryInfo = {};
  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function createTabHtmlElement(tabData) {
  // TODO: embedding html like this is horrible. Fix.
  return "<div id=\"tab\"><div>" + tabData.title + "</div><div>" + tabData.url +"</div></div>";
}

function renderSearchResults(tabsToRender) {
  document.getElementById('tab_container').innerHTML = tabsToRender.join('');
}

function searchTabs() {
  var searchText = document.getElementById('search_box').value;

  var results;
  if (searchText.length === 0) {
    results = tabsToSearch;
  } else {
    results = fuse.search(searchText);
  }

  var tabsToRender = [];
  for (let result of results) {
    tabsToRender.push(createTabHtmlElement(result));
  }
  renderSearchResults(tabsToRender);
}

var fuse; // used to perform the fuzzy search
var tabsToSearch = [];
document.addEventListener('DOMContentLoaded', function() {
  // Add event handler to input box
  var inputBox = document.getElementById('search_box');
  inputBox.focus();
  inputBox.addEventListener('keyup', searchTabs);

  getAllTabs(function(tabs) {
    for (let tab of tabs) {
      tabsToSearch.push({
        title: tab.title,
        url: tab.url
      })
    }

    var searchOpts = {
      shouldSort: true,
      keys: ["title", "url"]
    }
    fuse = new Fuse(tabsToSearch, searchOpts);
    searchTabs();
  });
});
