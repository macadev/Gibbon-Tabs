document.onkeydown = function(event) {
  event = event || window.event;
  // Escape key
  if (event.keyCode == 27) {
    chrome.storage.local.clear(function() {
      var error = chrome.runtime.lastError;
      if (error) {
          console.error(error);
      }
    });
    window.close();
  }
  // Down arrow key
  if (event.keyCode == 40) {
    slideHighlighting(SlideDirectionEnum.DOWN);
    return;
  }
  // Up arrow key
  if (event.keyCode == 38) {
    slideHighlighting(SlideDirectionEnum.UP);
    return;
  }
  // Enter key
  if (event.keyCode == 13) {
    activateTab(highlightIndex);
  }
  // Backspace key
  if (event.keyCode == 8) {
    if (document.getElementById('save_snap_menu').style.display == "initial") return;
    closeTab(highlightIndex);
  }
};

function activateTab(tabIndex) {
  var tab = tabsToRender[tabIndex - 1];
  chrome.windows.update(tab.windowId, { focused : true });
  chrome.tabs.update(tab.tabId, {
    active: true,
    highlighted: true
  });
  window.close();
}

function closeTab(tabIndex, tabElement, event) {
  if (event != null) event.stopPropagation();
  tabElement = tabElement || document.getElementById("search_id_" + tabIndex);
  var tab = tabsToRender[tabIndex - 1];
  chrome.tabs.remove(tab.tabId, function() {
    console.log("closed!");
    tabElement.remove();
    tabsToSearch.splice(tab.tabsToSearchIndex, 1);
    slideHighlighting(SlideDirectionEnum.DOWN);
  });
}

function getAllTabs(callback) {
  var queryInfo = {};
  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function createTabHtmlElement(tabData, tabIndex) {
  // TODO: embedding html like this is horrible. Fix.
  var title = tabData.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var url = tabData.url;
  if ("title_highlighted" in tabData) title = tabData.title_highlighted;
  if ("url_highlighted" in tabData) url = tabData.url_highlighted;
  if (tabData.iconUrl === undefined) {
    return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><div class=\"text_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"fa fa-times fa-lg\" aria-hidden=\"true\"></i></button></div>";
  } else {
    return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><img class=\"url_icon\" src=\"" + tabData.iconUrl + "\"><div class=\"text_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"fa fa-times fa-lg\" aria-hidden=\"true\"></i></button></div>";
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

function makeTabElementsClickable() {
  var tabElements = document.getElementsByClassName('tab');
  var closeTabButton;
  var tabIndex;
  for (let tabElement of tabElements) {
    tabIndex = tabElement.getAttribute('data-tabnumber');
    tabElement.onclick = activateTab.bind(null, tabIndex);
    tabElement.addEventListener("mouseover", highlightTabOnHover.bind(null, tabIndex));
    closeTabButton = tabElement.getElementsByClassName('close_tab_button');
    closeTabButton[0].addEventListener("click", closeTab.bind(null, tabIndex, tabElement));
    tabIndex++;
  }
}

function searchTabs() {
  var searchText = document.getElementById('search_box').value;

  tabsToRender;
  if (searchText.length === 0) {
    tabsToRender = _searchTabsNoQuery(tabsToSearch);
  } else {
    tabsToRender = _searchTabsWithQuery(searchText);
  }

  renderSearchResults(tabsToRender);
  makeTabElementsClickable();
  highlightIndex = 1; // Reset highlight index to the first tab
  if (tabsToRender.length > 0) highlightTab(highlightIndex, true); // highlight first result
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

function _searchTabsWithQuery(query) {
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

function initializeSearchVariables(tabs) {
  var index = 0;
  for (let tab of tabs) {
    if (tab.active) continue;
    tabsToSearch.push({
      title: tab.title,
      url: tab.url,
      tabId: tab.id,
      windowId: tab.windowId,
      iconUrl: tab.favIconUrl,
      tabsToSearchIndex: index
    });
    index++;
  }

  var searchOpts = {
    shouldSort: true,
    keys: ["title", "url"],
    include: ['matches']
  }
  fuse = new Fuse(tabsToSearch, searchOpts);
  searchTabs();
}

var fuse; // used to perform the fuzzy search
var tabsToSearch = [];
var tabsToRender = [];
var highlightIndex = 1;
var numTabs;
document.addEventListener('DOMContentLoaded', function() {
  // Add event handler to input box
  var tabSearchInputBox = document.getElementById('search_box');
  tabSearchInputBox.focus();
  tabSearchInputBox.oninput = searchTabs;

  var saveSnapMenuElement = document.getElementById('save_snap_menu');
  var showSaveSnapshotMenuButton = document.getElementById('save_snap_button');
  showSaveSnapshotMenuButton.onclick = showSaveSnapshotMenu;

  var submitSaveSnapshotButton = document.getElementById('submit_save_snap_button');
  submitSaveSnapshotButton.onclick = saveSnapshot

  var cancelSaveSnapshotButton = document.getElementById('cancel_save_snap_button');
  cancelSaveSnapshotButton.onclick = closeSaveSnapMenu.bind(null, saveSnapMenuElement);

  var renderSnapsListButton = document.getElementById('get_snaps_button');
  renderSnapsListButton.onclick = renderListOfSnapshots;

  getAllTabs(initializeSearchVariables);
});
