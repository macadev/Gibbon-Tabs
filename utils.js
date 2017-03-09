function isScrolledIntoView(el) {
  var elemTop = el.getBoundingClientRect().top;
  var elemBottom = el.getBoundingClientRect().bottom;
  return (elemTop >= 0) && (elemBottom <= window.innerHeight);
}

function removeHighlight(tabIndex) {
  var active = document.getElementById("search_id_" + tabIndex);
  if (active !== null) {
    active.classList.remove("highlighted");
  }
}

var TAB_BORDER_COLORS = ["#568AF2", "#DE5259", "#1AA15F", "#FFCE45"];
function highlightTab(tabIndex, shouldScrollIntoView) {
  var toHighlight = document.getElementById("search_id_" + tabIndex);
  if (toHighlight == null) {
    console.log("Tab has been deleted.")
    return false;
  }
  toHighlight.classList.add("highlighted");
  if (shouldScrollIntoView && !isScrolledIntoView(toHighlight)) toHighlight.scrollIntoView(false);
  toHighlight.style["border-left-color"] = TAB_BORDER_COLORS[tabIndex % 4];
  return true;
}

var lastCursorPos = { x: 0, y: 0};
function highlightTabOnHover(tabIndex, event) {
  var currentCursorPos = { x: event.screenX, y: event.screenY };
  if (lastCursorPos.x == currentCursorPos.x &&
      lastCursorPos.y == currentCursorPos.y) {
    // Mouse didn't move, don't process hover event
    return;
  }
  lastCursorPos.x = currentCursorPos.x;
  lastCursorPos.y = currentCursorPos.y;

  removeHighlight(highlightIndex);
  highlightIndex = tabIndex;
  highlightTab(tabIndex, false);
}
