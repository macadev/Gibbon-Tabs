function getTabsSnapshots(callback) {
  chrome.storage.sync.get("tabSnaps", function(tabSnaps) {
    callback(tabSnaps);
  });
}

function deleteTabSnap(tabSnapElement, event) {
  event.stopPropagation();
  var tabSnapName = tabSnapElement.getElementsByClassName('tab_snap_name_box')[0].innerText;
  var tabSnapCreationTimestamp = tabSnapElement.getAttribute('data-creationTimestamp');
  getTabsSnapshots(function(tabSnapsObj) {
    var tabSnapshot;
    var numOfTabSnaps = tabSnapsObj.tabSnaps.listOfSnaps.length;
    for (var i = 0; i < numOfTabSnaps; i++) {
      tabSnapshot = tabSnapsObj.tabSnaps.listOfSnaps[i];
      if (tabSnapshot.name == tabSnapName &&
        tabSnapshot.creationTimestamp == tabSnapCreationTimestamp) {
          // Remove the tab snapshot from the array
          tabSnapsObj.tabSnaps.listOfSnaps.splice(i, 1);
          numOfTabSnaps--;
          break;
      }
    }
    chrome.storage.sync.set({ "tabSnaps": tabSnapsObj.tabSnaps }, function() {
      if (numOfTabSnaps === 0) {
        var tabSnapContainer = tabSnapElement.parentNode;
        tabSnapContainer.innerHTML = "<p id=\"no_snaps_message\">You haven't saved any tab snapshots!</p>";
      } else {
        tabSnapElement.remove();
      }
    });
  });
}

function activateTabSnapshot(tabData) {
  var urls = [];
  for (let tab of tabData.tabs) {
    urls.push(tab.url);
  }
  var createData = {
    url: urls,
    focused: true,
    type: "normal"
  }
  chrome.windows.create(createData, function() {
    console.log("Window created successfully");
  });
  window.close();
}

function showSaveSnapshotMenu() {
  var saveSnapButtonRect = document.getElementById('save_snap_button').getBoundingClientRect();
  var saveSnapMenu = document.getElementById('save_snap_menu');
  if (saveSnapMenu.style.display == "initial") {
    saveSnapMenu.style.display = "none";
    return;
  }

  var snapshotNameInputBox = document.getElementById('save_snap_name_input');
  snapshotNameInputBox.value = "";
  saveSnapMenu.style.left = saveSnapButtonRect.left + "px";
  saveSnapMenu.style.top = saveSnapButtonRect.bottom + "px";
  saveSnapMenu.style.display = "initial";
  snapshotNameInputBox.focus();
}

function saveSnapshot() {
  var snapshotName = document.getElementById('save_snap_name_input')
    .value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var saveSnapshotButton = document.getElementById('submit_save_snap_button');
  if (snapshotName == "") {
    alert("Please specify a name for the snapshot.");
    return;
  }
  getTabsSnapshots(function(tabSnapsObj) {
    getAllTabs(function (tabs) {
      var newSnapshot = {
        name: snapshotName,
        tabs: tabs,
        creationTimestamp: Date.now()
      };
      if (tabSnapsObj.tabSnaps === undefined) {
        tabSnapsObj.tabSnaps = { listOfSnaps: [] };
      }
      tabSnapsObj.tabSnaps.listOfSnaps.push(newSnapshot);
      chrome.storage.sync.set({ "tabSnaps": tabSnapsObj.tabSnaps }, function() {
        var originalBackground = saveSnapshotButton.style.background;
        var originalText = saveSnapshotButton.innerText;
        var saveSnapshotMenu = document.getElementById('save_snap_menu');
        saveSnapshotButton.style.background = "#69B578";
        saveSnapshotButton.innerText = "Success!";
        saveSnapshotButton.disabled = true;
        setTimeout(function() {
          saveSnapshotButton.style.background = originalBackground;
          saveSnapshotButton.innerText = originalText;
          saveSnapshotButton.disabled = false;
          closeMenu(saveSnapshotMenu);
        }, 800);
      });
    });
  });
}

function renderListOfSnapshots() {
  var getSnapsButtonRect = document.getElementById('get_snaps_button').getBoundingClientRect();
  var tabSnapsDropdown = document.getElementById("tab_snaps_dropdown");
  if (tabSnapsDropdown.style.display == "initial") {
    tabSnapsDropdown.style.display = "none";
    return;
  }

  getTabsSnapshots(function(tabSnapsObj) {
    var tabSnapsHtml = "<div id=\"tab_snap_container\">";
    if (tabSnapsObj.tabSnaps !== undefined && tabSnapsObj.tabSnaps.listOfSnaps.length > 0) {
      tabSnapsHtml += "<p class=\"snap_action_title\">Tab Snapshots</p>"
      for (let tabSnap of tabSnapsObj.tabSnaps.listOfSnaps) {
        tabSnapsHtml += "<div class=\"tab_snap_box\" data-creationTimestamp=\"" + tabSnap.creationTimestamp + "\"><div class=\"tab_snap_name_box\">" + tabSnap.name + "</div><button class=\"menu_button_base delete_tab_snap_button\" type=\"button\"><i class=\"demo-icon icon-cancel\"></i></button></div>";
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
      tabSnapBoxes[i].onclick = activateTabSnapshot.bind(null, tabSnapsObj.tabSnaps.listOfSnaps[i]);
      deleteTabSnapButton = tabSnapBoxes[i].getElementsByClassName('delete_tab_snap_button');
      deleteTabSnapButton[0].addEventListener("click", deleteTabSnap.bind(null, tabSnapBoxes[i]));
    }

    var heightNeededToDisplayTabSnapBox = tabSnapDropdown.offsetHeight + getSnapsButtonRect.bottom;
    var heightOfBody = document.body.offsetHeight;
    if (heightNeededToDisplayTabSnapBox > heightOfBody) {
      document.body.style.height = heightNeededToDisplayTabSnapBox + "px";
    }
  });
}
