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
  var title = tabData.title;
  var url = tabData.url;
  if ("title_highlighted" in tabData) title = tabData.title_highlighted;
  if ("url_highlighted" in tabData) url = tabData.url_highlighted;
  if (tabData.iconUrl === undefined) {
    return "<div class=\"tab\" id=\"search_id_" + tabIndex + "\"><div class=\"text_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div></div>";
  } else {
    return "<div class=\"tab\" id=\"search_id_" + tabIndex + "\"><img class=\"url_icon\" src=\"" + tabData.iconUrl + "\"><div class=\"text_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div></div>";
  }
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
    delete tab.title_highlighted;
    delete tab.url_highlighted;
    tab.html = createTabHtmlElement(tab, tabIndex);
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
    highLightSearchResults(result.item);
    result.item.html = createTabHtmlElement(result.item, tabIndex);
    tabsToRender.push(result.item);
    tabIndex++;
  }
  return tabsToRender;
}

function highLightSearchResults(tab) {
  var matchKey;
  var highLightedText;
  var new_key;
  for (let match of tab.matches) {
    matchKey = match.key;
    highLightedText = _highLightSearchResultsHelper(tab[matchKey], match.indices);
    new_key = matchKey + '_highlighted';
    tab[new_key] = highLightedText;
  }
}

function _highLightSearchResultsHelper(text, matches) {
  var result = [];
  var pair = matches.shift();
  // Build the formatted string
  for (var i = 0; i < text.length; i++) {
    var char = text.charAt(i);
    if (pair && i == pair[0]) {
      result.push('<b>');
    }
    result.push(char);
    if (pair && i == pair[1]) {
      result.push('</b>');
      pair = matches.shift();
    }
  }
  return result.join('');
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
