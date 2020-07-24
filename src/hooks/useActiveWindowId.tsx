import { useState, useEffect } from "react";

export function useActiveWindowId() {
  let [activeWindowId, setActiveWindowId] = useState<number>();

  let chrome: any = (window as any)["chrome"];
  useEffect(() => {
    chrome.windows.getCurrent({}, (windowData: any) => {
      setActiveWindowId(windowData.id);
    });
  }, []);

  return activeWindowId;
}
