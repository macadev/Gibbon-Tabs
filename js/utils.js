// 6 character UUID generator
// See http://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
// I can't imagine having more than 20 tab snapshots. This should be sufficient.
function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function _processCreationOfWindow(tabsList) {
  var urls = [];
  for (let tab of tabsList) {
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
}
