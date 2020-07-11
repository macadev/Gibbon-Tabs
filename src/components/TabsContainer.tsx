import React, { useState, useEffect } from "react";
import Tab from "./Tab";
import { activateTab } from "../chrome/tabApi";

interface TabsContainerInterface {
  tabsToRender: any[];
  closeTab: (tabIdToDelete: number) => void;
}

export default function TabsContainer({
  tabsToRender,
  closeTab,
}: TabsContainerInterface): React.ReactElement {
  const [tabToActivate, setTabToActivate] = useState<number>(0);

  useEffect(() => {
    setTabToActivate(0);
  }, [tabsToRender]);

  let keyboardNavigationHandler = (e: KeyboardEvent) => {
    // Down arrow
    if (e.keyCode === 40 && tabToActivate < tabsToRender.length - 1) {
      e.preventDefault();
      setTabToActivate((prevTabToActivate) => prevTabToActivate + 1);
    }

    // Up arrow
    if (e.keyCode === 38 && tabToActivate > 0) {
      e.preventDefault();
      setTabToActivate((prevTabToActivate) => prevTabToActivate - 1);
    }

    // Enter key
    if (e.keyCode == 13) {
      let selectedTab = tabsToRender[tabToActivate];
      activateTab({ windowId: selectedTab.windowId, tabId: selectedTab.tabId });
    }

    // Shift + backspace key
    if (e.keyCode == 8 && e.shiftKey) {
      let selectedTab = tabsToRender[tabToActivate];
      closeTab(selectedTab.tabId);
    }

    // Escape key
    if (e.keyCode == 27) {
      window.close();
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
          closeTabHandler={closeTab}
          listIndex={index}
          setTabToActive={setTabToActivate}
          selectedForActivation={index === tabToActivate}
        ></Tab>
      ))}
    </div>
  );
}
