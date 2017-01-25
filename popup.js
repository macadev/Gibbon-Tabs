document.onkeydown = function(event) {
  event = event || window.event;
  // Escape key
  if (event.keyCode == 27) {
    window.close();
  }
  // Down arrow key
  if (event.keyCode == 40) {
    removeHighlight(highlightIndex);
    if (highlightIndex < numTabs) ++highlightIndex;
    highlightTab(highlightIndex);
    return;
  }
  // Up arrow key
  if (event.keyCode == 38) {
    removeHighlight(highlightIndex);
    if (highlightIndex > 1) --highlightIndex;
    highlightTab(highlightIndex);
    return;
  }

  // Enter key
  if (event.keyCode == 13) {
    activateTab(highlightIndex);
    window.close();
  }

};

function activateTab(tabIndex) {
  var tabId = tabsToRender[tabIndex - 1].id;
  chrome.tabs.update(tabId, {
    active: true,
    highlighted: true
  });
}

function removeHighlight(tabIndex) {
  var active = document.getElementById("search_id_" + tabIndex);
  if (active !== null) {
    active.classList.remove("highlighted");
  }
}

function highlightTab(tabIndex) {
  var toHighlight = document.getElementById("search_id_" + tabIndex);
  if (toHighlight !== null) {
    toHighlight.classList.add("highlighted");
  }
}

function getAllTabs(callback) {
  var queryInfo = {};
  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function createTabHtmlElement(tabData, tabIndex) {
  // TODO: embedding html like this is horrible. Fix.
  return "<div class=\"tab\" id=\"search_id_" + tabIndex + "\"><div>" + tabData.title + "</div><div>" + tabData.url +"</div></div>";
}

function renderSearchResults(tabsToRender) {
  var tabsHtml = "";
  for (let tab of tabsToRender) {
    tabsHtml += tab.html;
  }
  numTabs = tabsToRender.length
  document.getElementById('tab_container').innerHTML = tabsHtml;
}

function searchTabs() {
  var searchText = document.getElementById('search_box').value;

  var results;
  if (searchText.length === 0) {
    results = tabsToSearch;
  } else {
    results = fuse.search(searchText);
  }

  tabsToRender = [];
  var tabIndex = 1;
  for (let result of results) {
    tabsToRender.push({
      html: createTabHtmlElement(result, tabIndex),
      id: result.id
    });
    tabIndex++;
  }
  renderSearchResults(tabsToRender);
  highlightIndex = 1; // Reset highlight index to the first tab
  if (tabsToRender.length > 0) highlightTab(highlightIndex); // highlight first result
}

var fuse; // used to perform the fuzzy search
var tabsToSearch = [];
var tabsToRender = [];
var highlightIndex = 1;
var numTabs;
document.addEventListener('DOMContentLoaded', function() {
  // Add event handler to input box
  var inputBox = document.getElementById('search_box');
  inputBox.focus();
  inputBox.oninput = searchTabs;

  getAllTabs(function(tabs) {
    for (let tab of tabs) {
      tabsToSearch.push({
        title: tab.title,
        url: tab.url,
        id: tab.id
      });
    }

    var searchOpts = {
      shouldSort: true,
      keys: ["title", "url"]
    }
    fuse = new Fuse(tabsToSearch, searchOpts);
    searchTabs();
  });
});
