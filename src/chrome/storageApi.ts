export function chromeStorageSet(objectToSave: object) {
  let chrome: any = (window as any)["chrome"];

  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(objectToSave, () => {
      if (chrome.runtime.lastError) {
        reject("Failed to store object. It's too large to sync.");
        return;
      }
      resolve();
    });
  });
}

export function chromeStorageGet(storageKey: string) {
  let chrome: any = (window as any)["chrome"];

  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(storageKey, (data: any) => {
      if (chrome.runtime.lastError) {
        reject("Failed to get object.");
        return;
      }
      resolve(data);
    });
  });
}

export function chromeStorageRemove(storageKey: string) {
  let chrome: any = (window as any)["chrome"];

  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(storageKey, () => {
      if (chrome.runtime.lastError) {
        reject("Failed to remove object.");
        return;
      }
      resolve();
    });
  });
}
