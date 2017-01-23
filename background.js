chrome.commands.onCommand.addListener(function(command) {
  if(command === "show_tabs"){
		console.log("Show tabs command called");
		var createData = {
			url: chrome.extension.getURL("popup.html"),
			type: "popup"
		}
		chrome.windows.create(createData);
  }
});