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

  // Fetch the tabs and initialize fuse for fuzzy searching
  useEffect(() => {
    (window as any)["chrome"].tabs.query({}, function (tabs: any[]) {
      setTabs(tabs);
    });
  }, []);

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
        ></Tab>
      );
    });
  }

  return <div>{tabsToDisplay}</div>;
}
