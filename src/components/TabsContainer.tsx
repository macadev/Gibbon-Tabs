import React, { useState, useEffect, useMemo } from "react";
import Tab from "./Tab";
import Fuse from "fuse.js";

// Does chrome have ts bindings?
type ChromeTabs = any[];

interface TabsContainerInterface {
  searchQuery: string;
}

export default function TabsContainer({
  searchQuery,
}: TabsContainerInterface): React.ReactElement {
  const [tabs, setTabs] = useState<ChromeTabs>([]);

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
    tabsToDisplay = tabs.map((tab) => (
      <Tab
        title={tab.title}
        url={tab.url}
        active={tab.active}
        iconUrl={tab.favIconUrl}
        windowId={tab.windowId}
        tabId={tab.id}
        closeTabHandler={closeTab}
      ></Tab>
    ));
  } else {
    tabsToDisplay = fuse.search(searchQuery).map((match) => {
      return (
        <Tab
          title={match.item.title}
          url={match.item.url}
          active={match.item.active}
          iconUrl={match.item.favIconUrl}
          windowId={match.item.windowId}
          tabId={match.item.id}
          highlightMatches={match.matches}
          closeTabHandler={closeTab}
        ></Tab>
      );
    });
  }

  return <div>{tabsToDisplay}</div>;
}
