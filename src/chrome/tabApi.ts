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

export function createWindow(urls: string[]) {
  console.log(urls);
  var createData = {
    url: urls,
    focused: true,
    type: "normal",
  };
  return new Promise((resolve, reject) => {
    chrome.windows.create(createData, function () {
      if (chrome.runtime.lastError) {
        reject("Failed to create window.");
        return;
      }
      resolve();
    });
  });
}

export function createTab(url: string) {
  chrome.tabs.create({ url });
}
