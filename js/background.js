chrome.commands.onCommand.addListener(function(command) {
  if (command === "activate_in_popup") {
    var createData = {
      url: chrome.extension.getURL("popup.html"),
      type: "popup"
    }
    chrome.windows.create(createData);
  }
});
