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
  var tab = tabsToRender[tabIndex - 1];
  chrome.windows.update(tab.windowId, { focused : true });
  chrome.tabs.update(tab.tabId, {
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
    toHighlight.scrollIntoView(false);
  }
}

function getAllTabs(callback) {
  var queryInfo = {};
  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function saveTabsSnapshot() {
  getAllTabs(function (tabs){
    chrome.storage.sync.set({ "tabs": "myBody" }, function() {
      console.log("Tab Snapshot saved successfully.");
    });
  });
}

function createTabHtmlElement(tabData, tabIndex) {
  // TODO: embedding html like this is horrible. Fix.
  return "<div class=\"tab\" id=\"search_id_" + tabIndex + "\"><div>" + tabData.title + "</div><div class=\"url_container\">" + tabData.url +"</div></div>";
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

  tabsToRender;
  if (searchText.length === 0) {
    tabsToRender = _searchTabsNoQuery(tabsToSearch);
  } else {
    tabsToRender = _searchTabsWithQuery(tabsToSearch, searchText);
  }

  renderSearchResults(tabsToRender);
  highlightIndex = 1; // Reset highlight index to the first tab
  if (tabsToRender.length > 0) highlightTab(highlightIndex); // highlight first result
}

function _searchTabsNoQuery(tabsToSearch) {
  var tabsToRender = [];
  var tabIndex = 1;
  for (let tab of tabsToSearch) {
    tab.html = createTabHtmlElement(tab);
    tabsToRender.push(tab);
    tabIndex++;
  }
  return tabsToRender;
}

function _searchTabsWithQuery(tabsToSearch, query) {
  results = fuse.search(query);
  var tabsToRender = [];
  var tabIndex = 1;
  for (let result of results) {
    result.item.matches = result.matches;
    result.item.html = createTabHtmlElement(result.item, tabIndex);
    tabsToRender.push(result.item);
    tabIndex++;
  }
  return tabsToRender;
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
        tabId: tab.id,
        windowId: tab.windowId,
        iconUrl: tab.favIconUrl
      });
    }

    var searchOpts = {
      shouldSort: true,
      keys: ["title", "url"],
      include: ['matches']
    }
    fuse = new Fuse(tabsToSearch, searchOpts);
    searchTabs();
  });
});
