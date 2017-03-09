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
  var snapshotName = document.getElementById('save_snap_name_input').value;
  var saveSnapshotButton = document.getElementById('submit_save_snap_button');
  if (snapshotName == "") {
    alert("Please specify a name for the snapshot.");
    return;
  }
  getTabsSnapshots(function(tabSnapsObj) {
    getAllTabs(function (tabs) {
      var newSnapshot = {
        name: snapshotName,
        tabs: tabs
      };
      if (tabSnapsObj.tabSnaps === undefined) {
        tabSnapsObj.tabSnaps = { listOfSnaps: [] };
      }
      tabSnapsObj.tabSnaps.listOfSnaps.push(newSnapshot);
      chrome.storage.local.set({ "tabSnaps": tabSnapsObj.tabSnaps }, function() {
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
          hideElement(saveSnapshotMenu);
        }, 1000);
        console.log("Save successfully!");
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
    if (tabSnapsObj.tabSnaps !== undefined) {
      tabSnapsHtml += "<p class=\"snap_action_title\">Tab Snapshots</p>"
      for (let tabSnap of tabSnapsObj.tabSnaps.listOfSnaps) {
        tabSnapsHtml += "<div class=\"tab_snap_box\">" + tabSnap.name + "</div>";
      }
    } else {
      tabSnapsHtml = "<p id=\"no_snaps_message\">You haven't saved any tab snapshots!</p>";
    }
    tabSnapsHtml += "</div>";

    tabSnapsDropdown.style.left = getSnapsButtonRect.left + "px";
    tabSnapsDropdown.style.top = getSnapsButtonRect.bottom + "px";
    tabSnapsDropdown.style.display = "initial";
    tabSnapsDropdown.onmouseleave = hideElement.bind(null, tabSnapsDropdown);
    document.getElementById('tab_snaps_dropdown').innerHTML = tabSnapsHtml;

    var tabSnapBoxes = document.getElementsByClassName('tab_snap_box');
    for (var i = 0; i < tabSnapBoxes.length; i++) {
      tabSnapBoxes[i].onclick = activateTabSnapshot.bind(null, tabSnapsObj.tabSnaps.listOfSnaps[i]);
    }
  });
}

function closeSaveSnapMenu(element) {
  hideElement(element);
  var tabSearchInputBox = document.getElementById('search_box');
  tabSearchInputBox.focus();
}

function hideElement(element) {
  element.style.display = "none";
}
