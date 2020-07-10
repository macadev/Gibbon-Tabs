let chrome: any = (window as any)["chrome"];

interface TabData {
  windowId: number;
  tabId: number;
}

export function activateTab({ windowId, tabId }: TabData) {
  chrome.windows.update(windowId, { focused: true });
  chrome.tabs.update(tabId, {
    active: true,
    highlighted: true,
  });
}
