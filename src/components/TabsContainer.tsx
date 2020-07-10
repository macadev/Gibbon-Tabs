import React, { useState, useEffect, useMemo } from "react";
import Tab from "./Tab";
import Fuse from "fuse.js";
import { activateTab } from "../chrome/tabApi";

// Does chrome have ts bindings?
type ChromeTabs = any[];

interface TabsContainerInterface {
  searchQuery: string;
}

export default function TabsContainer({
  searchQuery,
}: TabsContainerInterface): React.ReactElement {
  const [tabs, setTabs] = useState<ChromeTabs>([]);
  const [tabToActivate, setTabToActivate] = useState<number>(0);

  let chrome: any = (window as any)["chrome"];

  // Fetch the tabs and initialize fuse for fuzzy searching
  useEffect(() => {
    chrome.tabs.query({}, function (tabs: any[]) {
      setTabs(tabs);
    });
  }, []);

  let closeTab = (tabIdToDelete: number) => {
    chrome.tabs.remove(tabIdToDelete, function () {
      setTabs(tabs.filter((tab) => tab.id !== tabIdToDelete));
    });
  };

  let keyboardNavigationHandler = (e: KeyboardEvent) => {
    e.preventDefault();

    let keyPressed: string = e.key;
    if ("ArrowDown" === keyPressed && tabToActivate < tabs.length - 1) {
      setTabToActivate((prevTabToActivate) => prevTabToActivate + 1);
    }

    if ("ArrowUp" === keyPressed && tabToActivate > 0) {
      setTabToActivate((prevTabToActivate) => prevTabToActivate - 1);
    }

    if ("Enter" === keyPressed) {
      let selectedTab = tabs[tabToActivate];
      activateTab({ windowId: selectedTab.windowId, tabId: selectedTab.id });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyboardNavigationHandler);

    return () => {
      document.removeEventListener("keydown", keyboardNavigationHandler);
    };
  }, [tabs, tabToActivate]);

  const fuse = useMemo(() => {
    return new Fuse(tabs, {
      shouldSort: true,
      keys: ["title", "url"],
      includeMatches: true,
      findAllMatches: true,
    });
  }, [tabs]);

  let tabsToDisplay: React.ReactElement[];
  if (searchQuery === undefined || searchQuery.length === 0) {
    tabsToDisplay = tabs.map((tab, index) => (
      <Tab
        key={tab.id}
        title={tab.title}
        url={tab.url}
        active={tab.active}
        iconUrl={tab.favIconUrl}
        windowId={tab.windowId}
        tabId={tab.id}
        closeTabHandler={closeTab}
        listIndex={index}
        setTabToActive={setTabToActivate}
        selectedForActivation={index === tabToActivate}
      ></Tab>
    ));
  } else {
    tabsToDisplay = fuse.search(searchQuery).map((match, index) => {
      return (
        <Tab
          key={match.item.id}
          title={match.item.title}
          url={match.item.url}
          active={match.item.active}
          iconUrl={match.item.favIconUrl}
          windowId={match.item.windowId}
          tabId={match.item.id}
          highlightMatches={match.matches}
          closeTabHandler={closeTab}
          listIndex={index}
          setTabToActive={setTabToActivate}
          selectedForActivation={index === tabToActivate}
        ></Tab>
      );
    });
  }

  return <div>{tabsToDisplay}</div>;
}
