import React, { useState, useEffect } from "react";
import Tab from "./Tab";
import { activateTab } from "../chrome/tabApi";
import { useActiveWindowId } from "../hooks/useActiveWindowId";

interface TabsContainerInterface {
  tabsToRender: any[];
  closeTab: (tabIdToDelete: number) => void;
  searchQuery: string;
  focusOnSearchInput: () => void;
}

export default function TabsContainer({
  tabsToRender,
  closeTab,
  searchQuery,
  focusOnSearchInput,
}: TabsContainerInterface): React.ReactElement {
  const [tabToActivate, setTabToActivate] = useState<number>(0);
  const activeWindowId: number | undefined = useActiveWindowId();

  useEffect(() => {
    // Little bit of logic to highlight the correct tab when user closes them using the keyboard shortcut
    setTabToActivate((prevTabToActivate) => {
      if (prevTabToActivate === 0) return 0;

      if (prevTabToActivate === tabsToRender.length) {
        return prevTabToActivate - 1;
      }

      return prevTabToActivate;
    });
  }, [tabsToRender]);

  // Whenever the user types, reset the tab to activate to the one at the top
  useEffect(() => {
    setTabToActivate(0);
  }, [searchQuery]);

  let keyboardNavigationHandler = (e: KeyboardEvent) => {
    // Down arrow
    if (e.keyCode === 40 && tabToActivate < tabsToRender.length - 1) {
      e.preventDefault();
      setTabToActivate((prevTabToActivate) => prevTabToActivate + 1);
      return;
    }

    // Up arrow
    if (e.keyCode === 38 && tabToActivate > 0) {
      e.preventDefault();
      setTabToActivate((prevTabToActivate) => prevTabToActivate - 1);
      return;
    }

    // Enter key
    if (e.keyCode === 13) {
      e.preventDefault();
      let selectedTab = tabsToRender[tabToActivate];
      activateTab({ windowId: selectedTab.windowId, tabId: selectedTab.tabId });
      return;
    }

    // Shift + backspace key
    if (e.keyCode === 8 && e.shiftKey) {
      e.preventDefault();
      let selectedTab = tabsToRender[tabToActivate];
      closeTab(selectedTab.tabId);
      return;
    }

    // Escape key
    if (e.keyCode === 27) {
      window.close();
      return;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyboardNavigationHandler);

    return () => {
      document.removeEventListener("keydown", keyboardNavigationHandler);
    };
  }, [tabsToRender, tabToActivate]);

  return (
    <div>
      {tabsToRender.map((tab, index) => (
        <Tab
          key={tab.key}
          title={tab.title}
          url={tab.url}
          active={tab.active}
          iconUrl={tab.iconUrl}
          windowId={tab.windowId}
          tabId={tab.tabId}
          highlightMatches={tab.highlightMatches}
          closeTabHandler={(tabId) => {
            closeTab(tabId);
            focusOnSearchInput();
          }}
          listIndex={index}
          setTabToActivate={setTabToActivate}
          selectedForActivation={index === tabToActivate}
          isInActiveWindow={activeWindowId === tab.windowId}
        ></Tab>
      ))}
    </div>
  );
}
