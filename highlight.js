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
  console.log("Scroll into view: " + shouldScrollIntoView);
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

var SlideDirectionEnum = {
  UP: 1,
  DOWN: 2
}

function isHighlightOverTop() {
  return highlightIndex < 1;
}
function isHighLightPastBottom() {
  return highlightIndex > numTabs;
}

function slideHighlighting(slideDirection) {
  var boundaryCondition;
  var oppositeBoundaryCondition;
  var oppositeSlideDirection;
  if (slideDirection == SlideDirectionEnum.UP) {
    boundaryCondition = isHighlightOverTop;
    oppositeBoundaryCondition = isHighLightPastBottom;
    oppositeSlideDirection = SlideDirectionEnum.DOWN;
  } else {
    boundaryCondition = isHighLightPastBottom;
    oppositeBoundaryCondition = isHighlightOverTop;
    oppositeSlideDirection = SlideDirectionEnum.UP;
  }

  removeHighlight(highlightIndex);
  if (!boundaryCondition()) {
    if (slideDirection == SlideDirectionEnum.UP) {
      --highlightIndex;
    } else {
      ++highlightIndex;
    }
  }

  while (!highlightTab(highlightIndex, true) && !boundaryCondition()) {
    if (slideDirection == SlideDirectionEnum.UP) {
      --highlightIndex;
    } else {
      ++highlightIndex;
    }
  }
  if (highlightIndex == 0 || highlightIndex == numTabs + 1) {
    while(!highlightTab(highlightIndex, true) && !oppositeBoundaryCondition()) {
      if (oppositeSlideDirection == SlideDirectionEnum.UP) {
        --highlightIndex;
      } else {
        ++highlightIndex;
      }
    }
    if (highlightIndex == 0 || highlightIndex == numTabs + 1) {
      console.log("stuff is really messed up");
    }
  }
  return;
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

function highLightSearchResults(tab) {
  var matchKey;
  var highLightedText;
  var new_key;
  for (let match of tab.matches) {
    matchKey = match.key;
    highLightedText = _highLightSearchResultsHelper(
      tab[matchKey].replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      match.indices);
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
