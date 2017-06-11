function getListOfTabSnapshotUIDs(callback) {
  chrome.storage.sync.get("tabSnapshotUIDs", function(tabSnapsUUIDs) {
    callback(tabSnapsUUIDs);
  });
}

function _storeTabSnapshotUID(snapUID, callback) {
  getListOfTabSnapshotUIDs(function(tabSnapUIDsWrapper) {
    if (tabSnapUIDsWrapper.tabSnapshotUIDs === undefined) {
      tabSnapUIDsWrapper. tabSnapshotUIDs = { mapOfSnapUIDs: {} };
    }
    tabSnapUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs[snapUID] = 1;
    chrome.storage.sync.set({ "tabSnapshotUIDs": tabSnapUIDsWrapper.tabSnapshotUIDs }, function() {
      if (chrome.runtime.lastError) {
        console.log("Failed to store snapshot UID.");
        alert("Failed to save snapshot. You've created too many snapshots. Please delete some and try again.")
        return;
      }
      callback();
    });
  });
}

function _closeSaveSnapshotMenuOnSave(saveSnapshotButton, saveSucceeded) {
  var originalBackground = saveSnapshotButton.style.background;
  var originalText = saveSnapshotButton.innerText;
  var saveSnapshotMenu = document.getElementById('save_snap_menu');
  if (saveSucceeded) {
    saveSnapshotButton.style.background = "#69B578";
    saveSnapshotButton.innerText = "Success!";
  } else {
    saveSnapshotButton.innerText = "Failed";
    saveSnapshotButton.style.background = "#DE5259";
  }
  saveSnapshotButton.disabled = true;
  setTimeout(function() {
    saveSnapshotButton.style.background = originalBackground;
    saveSnapshotButton.innerText = originalText;
    saveSnapshotButton.disabled = false;
    closeMenu(saveSnapshotMenu);
  }, 800);
}

function getSnapshot(snapshotUID, tabSnapUUIDsList, listOfSnapshots, returnCallback) {
  chrome.storage.sync.get(snapshotUID, function(snapshotWrapper) {
    listOfSnapshots.push(snapshotWrapper[snapshotUID]);
    var nextUID = tabSnapUUIDsList.pop();
    if (nextUID !== undefined) {
      getSnapshot(nextUID, tabSnapUUIDsList, listOfSnapshots, returnCallback);
    } else {
      returnCallback(listOfSnapshots);
    }
  });
}

function getTabSnapshots(returnCallback) {
  getListOfTabSnapshotUIDs(function(tabSnapsUUIDsWrapper) {
    var listOfSnapshots = [];
    if (tabSnapsUUIDsWrapper.tabSnapshotUIDs === undefined
      ||  Object.keys(tabSnapsUUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs).length === 0) {
        returnCallback(listOfSnapshots);
        return;
      }
    var tabSnapUUIDsList = Object.keys(tabSnapsUUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs);
    var uidToRetrieve = tabSnapUUIDsList.pop();
    getSnapshot(uidToRetrieve, tabSnapUUIDsList, listOfSnapshots, returnCallback);
  });
}

function deleteTabSnap(tabSnapElement, event) {
  event.stopPropagation();
  var tabSnapName = tabSnapElement.getElementsByClassName('tab_snap_name_box')[0].innerText;
  var tabSnapCreationTimestamp = tabSnapElement.getAttribute('data-creationTimestamp');
  var tabSnapUID = tabSnapElement.getAttribute('data-uid');

  getListOfTabSnapshotUIDs(function(tabSnapUIDsWrapper) {
    delete tabSnapUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs[tabSnapUID];
    chrome.storage.sync.set({ "tabSnapshotUIDs": tabSnapUIDsWrapper.tabSnapshotUIDs }, function() {
      console.log("Removed snapshot UID.");
    });
  });
  var numOfTabSnaps = document.getElementsByClassName('tab_snap_box').length - 1;
  chrome.storage.sync.remove(tabSnapUID, function() {
    if (numOfTabSnaps === 0) {
      var tabSnapContainer = tabSnapElement.parentNode;
      tabSnapContainer.innerHTML = "<p id=\"no_snaps_message\">You haven't saved any tab snapshots!</p>";
    } else {
      tabSnapElement.remove();
    }
  });
}

function displayOverwriteTabSnapWidget(tabSnapElement, event) {
  event.stopPropagation();

  // Close the list of snapshots dropdown menu
  var snapshotsListMenuElement = document.getElementById('tab_snaps_dropdown');
  closeMenu(snapshotsListMenuElement);
  // Close the save snapshot dropdown menu
  var saveSnapMenuElement = document.getElementById('save_snap_menu');
  closeMenu(saveSnapMenuElement);

  var overwriteSnapshotWidget = document.getElementById('overwrite_snap_widget');
  overwriteSnapshotWidget.style.display = "initial";

  var tabSnapName = tabSnapElement.getElementsByClassName('tab_snap_name_box')[0].innerText;
  var snapToOverwritePlaceholder = document.getElementById('snap_to_overwrite_placeholder');
  snapToOverwritePlaceholder.innerText = tabSnapName;
}

function activateTabSnapshot(tabData) {
  if (!("tabsPerWindow" in tabData)) {
    // Support for legacy tab snapshots where tabs were opened in the same window
    // even if they were in separate ones when the snapshot was created
    _processCreationOfWindow(tabData.tabs);
  } else {
    for (var key in tabData.tabsPerWindow) {
      _processCreationOfWindow(tabData.tabsPerWindow[key]);
    }
  }
  window.close();
}

function showSaveSnapshotMenu() {
  var saveSnapButtonRect = document.getElementById('save_snap_button').getBoundingClientRect();
  var saveSnapMenu = document.getElementById('save_snap_menu');
  if (saveSnapMenu.style.display == "initial") {
    saveSnapMenu.style.display = "none";
    return;
  }
  // Close the list of snapshots dropdown menu
  var snapshotsListMenuElement = document.getElementById('tab_snaps_dropdown');
  closeMenu(snapshotsListMenuElement);
  // Close the overwrite snapshot widget
  var overwriteSnapshotWidget = document.getElementById('overwrite_snap_widget');
  closeMenu(overwriteSnapshotWidget);

  var snapshotActiveWindowCheckbox = document.getElementById('snapshot_only_active_window_checkbox');
  toggleSnapshotTypeCheckbox(snapshotActiveWindowCheckbox);

  var snapshotNameInputBox = document.getElementById('save_snap_name_input');
  snapshotNameInputBox.value = "";
  saveSnapMenu.style.left = saveSnapButtonRect.left + "px";
  saveSnapMenu.style.top = saveSnapButtonRect.bottom + "px";
  saveSnapMenu.style.display = "initial";
  snapshotNameInputBox.focus();
}

var tickedCheckboxClassName = "icon-ok-squared";
var untickedCheckboxClassName = "icon-blank";
function toggleSnapshotTypeCheckbox(checkboxElement) {
  // If checkbox has already been ticked do nothing
  if (checkboxElement.classList.contains(tickedCheckboxClassName)) return;
  // Get the currently ticked checbox and make it unticked
  var tickedCheckboxElement = document.getElementsByClassName(tickedCheckboxClassName)[0];
  tickedCheckboxElement.classList.remove(tickedCheckboxClassName);
  tickedCheckboxElement.classList.add(untickedCheckboxClassName);
  // Tick the other checkbox
  checkboxElement.classList.remove(untickedCheckboxClassName);
  checkboxElement.classList.add(tickedCheckboxClassName);
}

function _createTabSnapshotObject(tabs, snapshotName, activeWindowId, snapshotOnlyActiveWindow) {
  // Remove useless metadata from tab objects before storing them
  var filteredTabsByWindow = {};
  for (let tab of tabs) {
    // Skip tabs not in the active window when the snapshotOnlyActiveWindow checkbox
    // has been ticked
    if (snapshotOnlyActiveWindow && tab.windowId !== activeWindowId) continue;
    if (!(tab.windowId in filteredTabsByWindow)) {
      filteredTabsByWindow[tab.windowId] = [];
    }
    filteredTabsByWindow[tab.windowId].push({
      url: tab.url
    });
  }
  var snapUID = generateUID();
  var newSnapshot = {
    name: snapshotName,
    tabsPerWindow: filteredTabsByWindow,
    creationTimestamp: Date.now(),
    uid: snapUID
  };
  return newSnapshot;
}

function saveSnapshot(snapshotActiveWindowCheckbox) {
  var snapshotOnlyActiveWindow = false;
  if (snapshotActiveWindowCheckbox.classList.contains(tickedCheckboxClassName)) {
    snapshotOnlyActiveWindow = true;
  }

  var snapshotName = document.getElementById('save_snap_name_input')
    .value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var saveSnapshotButton = document.getElementById('submit_save_snap_button');
  if (snapshotName == "") {
    alert("Please specify a name for the snapshot.");
    return;
  }

  getAllTabs(function(tabs, activeWindowId) {
    var newSnapshot = _createTabSnapshotObject(tabs, snapshotName, activeWindowId, snapshotOnlyActiveWindow);
    var snapUID = newSnapshot.uid;
    var snapshotKeyValueFormat = {};
    snapshotKeyValueFormat[snapUID] = newSnapshot;

    chrome.storage.sync.set(snapshotKeyValueFormat, function() {
      if (chrome.runtime.lastError) {
        console.log("Failed to store snapshot. It's too large to sync.");
        alert("Failed to save snapshot. It's too large to sync. Please remove some tabs and try again.")
        _closeSaveSnapshotMenuOnSave(saveSnapshotButton, false);
        return;
      }
      getListOfTabSnapshotUIDs(function(tabSnapUIDsWrapper) {
        if (tabSnapUIDsWrapper.tabSnapshotUIDs === undefined) {
          tabSnapUIDsWrapper.tabSnapshotUIDs = { mapOfSnapUIDs: {} };
        }
        tabSnapUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs[snapUID] = 1;
        chrome.storage.sync.set(
          { "tabSnapshotUIDs": tabSnapUIDsWrapper.tabSnapshotUIDs },
          _storeTabSnapshotUID.bind(null, snapUID, _closeSaveSnapshotMenuOnSave.bind(null, saveSnapshotButton, true))
        );
      });
    });
  });
}

function _storeLegacySnapshot(listOfUIDs, returnCallback) {
  var uidToStore = listOfUIDs.pop();
  if (uidToStore !== undefined) {
    _storeTabSnapshotUID(uidToStore, _storeLegacySnapshot.bind(null, listOfUIDs, returnCallback));
  } else {
    returnCallback();
  }
}

function _processLegacySnapshots(renderListOfSnapshotsFunction) {
  chrome.storage.local.get("tabSnaps", function(tabSnapsObj) {
    if (chrome.runtime.lastError) {
      console.log("Error getting legacy snapshots.");
      renderListOfSnapshotsFunction();
      return;
    }
    if (tabSnapsObj.tabSnaps === undefined || tabSnapsObj.tabSnaps.listOfSnaps.length === 0) {
      console.log("No legacy snapshots");
      renderListOfSnapshotsFunction();
      return;
    }
    var uid;
    var newUIDs = [];
    for (let snapshot of tabSnapsObj.tabSnaps.listOfSnaps) {
      uid = generateUID();
      snapshot.uid = uid;
      var snapshotKeyValueFormat = {};
      snapshotKeyValueFormat[uid] = snapshot;
      chrome.storage.sync.set(snapshotKeyValueFormat, function(){});
      newUIDs.push(uid);
    }
    _storeLegacySnapshot(newUIDs, function() {
      chrome.storage.local.remove("tabSnaps", function() {
        console.log("Completed processing of all legacy snapshots.");
        renderListOfSnapshotsFunction();
      })
    });
  });
}

function renderListOfSnapshots() {
  _processLegacySnapshots(function() {
    var getSnapsButtonRect = document.getElementById('get_snaps_button').getBoundingClientRect();
    var tabSnapsDropdown = document.getElementById("tab_snaps_dropdown");
    if (tabSnapsDropdown.style.display == "initial") {
      tabSnapsDropdown.style.display = "none";
      return;
    }

    // Close the save snapshot dropdown menu
    var saveSnapMenuElement = document.getElementById('save_snap_menu');
    closeMenu(saveSnapMenuElement);

    // Close the overwrite snapshot widget
    var overwriteSnapshotWidget = document.getElementById('overwrite_snap_widget');
    closeMenu(overwriteSnapshotWidget);

    getTabSnapshots(function(tabSnapshots) {
      var tabSnapsHtml = "<div id=\"tab_snap_container\">";
      if (tabSnapshots.length > 0) {
        tabSnapsHtml += "<p class=\"snap_action_title\">Tab Snapshots</p>"
        for (let tabSnap of tabSnapshots) {
          tabSnapsHtml += "<div class=\"tab_snap_box\" data-uid=\"" + tabSnap.uid + "\"  data-creationTimestamp=\"" + tabSnap.creationTimestamp + "\"><div class=\"tab_snap_name_box\">" + tabSnap.name + "</div><button class=\"menu_button_base delete_tab_snap_button\" type=\"button\"><i class=\"demo-icon icon-cancel\"></i></button><button class=\"menu_button_base overwrite_tab_snap_button\" type=\"button\"><i class=\"demo-icon icon-edit\"></i></button></div>";
        }
      } else {
        tabSnapsHtml = "<p id=\"no_snaps_message\">You haven't saved any tab snapshots!</p>";
      }
      tabSnapsHtml += "</div>";

      tabSnapsDropdown.style.left = getSnapsButtonRect.left + "px";
      tabSnapsDropdown.style.top = getSnapsButtonRect.bottom + "px";
      tabSnapsDropdown.style.display = "initial";
      tabSnapsDropdown.onmouseleave = closeMenu.bind(null, tabSnapsDropdown);
      var tabSnapDropdown = document.getElementById('tab_snaps_dropdown');
      tabSnapDropdown.innerHTML = tabSnapsHtml;

      var deleteTabSnapButton;
      var tabSnapBoxes = document.getElementsByClassName('tab_snap_box');
      for (var i = 0; i < tabSnapBoxes.length; i++) {
        tabSnapBoxes[i].onclick = activateTabSnapshot.bind(null, tabSnapshots[i]);
        deleteTabSnapButton = tabSnapBoxes[i].getElementsByClassName('delete_tab_snap_button');
        deleteTabSnapButton[0].addEventListener("click", deleteTabSnap.bind(null, tabSnapBoxes[i]));
        overwriteTabSnapButton = tabSnapBoxes[i].getElementsByClassName('overwrite_tab_snap_button');
        overwriteTabSnapButton[0].addEventListener("click", displayOverwriteTabSnapWidget.bind(null, tabSnapBoxes[i]));
      }

      var heightNeededToDisplayTabSnapBox = tabSnapDropdown.offsetHeight + getSnapsButtonRect.bottom;
      var heightOfBody = document.body.offsetHeight;
      if (heightNeededToDisplayTabSnapBox > heightOfBody) {
        document.body.style.height = heightNeededToDisplayTabSnapBox + "px";
      }
    });
  });
}
