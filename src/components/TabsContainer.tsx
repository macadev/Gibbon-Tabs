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
      include: ["matches"],
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
      ></Tab>
    ));
  } else {
    tabsToDisplay = fuse
      .search(searchQuery)
      .map((match) => (
        <Tab
          title={match.item.title}
          url={match.item.url}
          active={match.item.active}
          iconUrl={match.item.favIconUrl}
        ></Tab>
      ));
  }

  return <div>{tabsToDisplay}</div>;
}
