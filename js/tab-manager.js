document.onkeydown = function(event) {
  event = event || window.event;
  // Prevent arrow keys from scrolling
  if (event.keyCode == 38 || event.keyCode == 40) event.preventDefault();
  // Escape key
  if (event.keyCode == 27) {
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
  // Shift + backspace key
  if (event.keyCode == 8 && event.shiftKey) {
    event.preventDefault() // Prevent delete key from deleting
    if (document.getElementById('save_snap_menu').style.display == "initial") return;
    closeTab(highlightIndex);
  }
  // Ctrl key
  if (event.keyCode == 17) {
    highlightActiveTab();
  }
};

function highlightActiveTab() {
  if (activeTabIndex == null) return;
  removeHighlight(highlightIndex)
  highlightIndex = activeTabIndex;
  highlightTab(highlightIndex, true);
}

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
    focusOnSearchInput();
    // Delete tab element from page
    tabElement.remove();
    // Delete tab from search list
    var tabInSearchList;
    for (var i = 0; i < tabsToSearch.length; i++) {
      tabInSearchList = tabsToSearch[i];
      if (tab.tabId == tabInSearchList.tabId) {
        tabsToSearch.splice(i, 1);
      }
    }
    slideHighlighting(SlideDirectionEnum.DOWN);
  });
}

function getAllTabs(callback) {
  chrome.tabs.query({}, function(tabs) {
    chrome.windows.getCurrent({}, function(windowData) {
      callback(tabs, windowData.id);
    });
  });
}

function createTabHtmlElement(tabData, tabIndex) {
  var title = tabData.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var url = tabData.url;
  
  if ("title_highlighted" in tabData) title = tabData.title_highlighted;
  if ("url_highlighted" in tabData) url = tabData.url_highlighted;
  if (tabData.iconUrl === undefined) {
    if (tabData.isOnActiveWindow) {
      return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><div class=\"tab_title_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"demo-icon icon-cancel\" aria-hidden=\"true\"></i></button><button class=\"menu_button_base tab_in_active_window_badge\" type=\"button\"><i class=\"demo-icon icon-window-maximize\" aria-hidden=\"true\"></i></button></div>";
    } else {
      return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><div class=\"tab_title_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"demo-icon icon-cancel\" aria-hidden=\"true\"></i></button></div>";
    }
  } else {
    if (tabData.isOnActiveWindow) {
      return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><img class=\"url_icon\" src=\"" + tabData.iconUrl + "\"><div class=\"tab_title_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"demo-icon icon-cancel\" aria-hidden=\"true\"></i></button><button class=\"menu_button_base tab_in_active_window_badge\" type=\"button\"><i class=\"demo-icon icon-window-maximize\" aria-hidden=\"true\"></i></button></div>";
    } else {
      return "<div class=\"tab\" data-tabnumber=\"" + tabIndex + "\" id=\"search_id_" + tabIndex + "\"><img class=\"url_icon\" src=\"" + tabData.iconUrl + "\"><div class=\"tab_title_container\"><div>" + title + "</div><div class=\"url_container\">" + url +"</div></div><button class=\"menu_button_base close_tab_button\" type=\"button\"><i class=\"demo-icon icon-cancel\" aria-hidden=\"true\"></i></button></div>";
    }
  }
}

function renderSearchResults(tabsToRender) {
  var tabsHtml = "";
  var activeTabToBeRendered = false;
  for (let tab of tabsToRender) {
    if (tab.isActiveTab) {
      activeTabToBeRendered = true;
      activeTabIndex = tab.renderIndex;
    }
    tabsHtml += tab.html;
  }
  if (!activeTabToBeRendered) activeTabIndex = null;
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
    tab.renderIndex = tabIndex;
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
    result.item.renderIndex = tabIndex;
    tabsToRender.push(result.item);
    tabIndex++;
  }
  return tabsToRender;
}

function initializeSearchVariables(tabs, activeWindowId) {
  for (let tab of tabs) {
    tabsToSearch.push({
      title: tab.title,
      url: tab.url,
      tabId: tab.id,
      windowId: tab.windowId,
      iconUrl: tab.favIconUrl,
      isOnActiveWindow: tab.windowId == activeWindowId,
      isActiveTab: (tab.active && tab.windowId == activeWindowId ? true : false)
    });
  }

  var searchOpts = {
    shouldSort: true,
    keys: ["title", "url"],
    include: ['matches']
  }
  fuse = new Fuse(tabsToSearch, searchOpts);
  searchTabs();
}

function closeMenu(element) {
  hideElement(element);
  focusOnSearchInput();
}

function focusOnSearchInput() {
  var x = window.scrollX, y = window.scrollY;
  var tabSearchInputBox = document.getElementById('search_box');
  tabSearchInputBox.focus();
  window.scrollTo(x, y);
}

function hideElement(element) {
  element.style.display = "none";
}

var fuse; // used to perform the fuzzy search
var tabsToSearch = [];
var tabsToRender = [];
var highlightIndex = 1;
var numTabs;
var activeTabIndex;
document.addEventListener('DOMContentLoaded', function() {
  // Call searchTabs when user inputs in search box
  var tabSearchInputBox = document.getElementById('search_box');
  tabSearchInputBox.focus();
  tabSearchInputBox.oninput = searchTabs;

  // Display the save snapshot menu
  var showSaveSnapshotMenuButton = document.getElementById('save_snap_button');
  showSaveSnapshotMenuButton.onclick = showSaveSnapshotMenu;

  // Close the save snap menu
  var saveSnapMenuElement = document.getElementById('save_snap_menu');
  var cancelSaveSnapshotButton = document.getElementById('cancel_save_snap_button');
  cancelSaveSnapshotButton.onclick = closeMenu.bind(null, saveSnapMenuElement);

  // Toggle checkboxes for selecting saving a snapshot of only the active window vs all windows
  // Default checkboxes do not go well with the theme of Gibbon Tabs. We use fontello icons for the checkboxes.
  var snapshotActiveWindowCheckbox = document.getElementById('snapshot_only_active_window_checkbox');
  var snapshotAllWindowsCheckbox = document.getElementById('snapshot_all_windows_checkbox');
  snapshotActiveWindowCheckbox.onclick = toggleSnapshotTypeCheckbox.bind(null, snapshotActiveWindowCheckbox, snapshotAllWindowsCheckbox);
  snapshotAllWindowsCheckbox.onclick = toggleSnapshotTypeCheckbox.bind(null, snapshotAllWindowsCheckbox, snapshotActiveWindowCheckbox);

  // Save a snapshot
  var submitSaveSnapshotButton = document.getElementById('submit_save_snap_button');
  submitSaveSnapshotButton.onclick = saveSnapshot.bind(null, snapshotActiveWindowCheckbox);

  // Display list of saved snapshots
  var renderSnapsListButton = document.getElementById('get_snaps_button');
  renderSnapsListButton.onclick = renderListOfSnapshots;

  // Clicking on logo opens the Github page
  var logoImage = document.getElementById('gibbon_tabs_logo_image');
  logoImage.onclick = function() {
    chrome.tabs.create({url: 'https://github.com/macadev/Gibbon-Tabs'});
  }

  // Having the mouse leave the Overwrite snapshot widget closes it
  var overwriteSnapshotWidget = document.getElementById('overwrite_snap_widget');
  overwriteSnapshotWidget.onmouseleave = closeMenu.bind(null, overwriteSnapshotWidget);

  // Toggle checkboxes for selecting the granularity of overwriting a snapshot (active window vs all windows)
  var overwriteSnapshotActiveWindowCheckbox = document.getElementById('overwrite_snapshot_only_active_window_checkbox');
  var overwriteSnapshotAllWindowsCheckbox = document.getElementById('overwrite_snapshot_all_windows_checkbox');
  overwriteSnapshotActiveWindowCheckbox.onclick = toggleSnapshotTypeCheckbox.bind(null, overwriteSnapshotActiveWindowCheckbox, overwriteSnapshotAllWindowsCheckbox);
  overwriteSnapshotAllWindowsCheckbox.onclick = toggleSnapshotTypeCheckbox.bind(null, overwriteSnapshotAllWindowsCheckbox, overwriteSnapshotActiveWindowCheckbox);

  getAllTabs(initializeSearchVariables);
});
