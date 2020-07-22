import React, { useState, useEffect, useMemo } from "react";
import TabsContainer from "./components/TabsContainer";
import ExtensionHeader from "./components/ExtensionHeader";
import Fuse from "fuse.js";

type ChromeTabs = any[];

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tabs, setTabs] = useState<ChromeTabs>([]);
  const [tabsToRender, setTabsToRender] = useState<ChromeTabs>([]);

  let chrome: any = (window as any)["chrome"];

  useEffect(() => {
    chrome.tabs.query({}, function (tabs: any[]) {
      setTabs(tabs);
    });
  }, []);

  const fuse = useMemo(() => {
    console.log(tabs);
    return new Fuse(tabs, {
      shouldSort: true,
      keys: ["title", "url"],
      includeMatches: true,
      findAllMatches: true,
    });
  }, [tabs]);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      setTabsToRender(
        fuse.search(searchQuery).map((match, index) => {
          return {
            key: match.item.id,
            title: match.item.title,
            url: match.item.url,
            active: match.item.active,
            iconUrl: match.item.favIconUrl,
            windowId: match.item.windowId,
            tabId: match.item.id,
            highlightMatches: match.matches,
            listIndex: index,
          };
        })
      );
    } else {
      setTabsToRender(
        tabs.map((tab, index) => {
          return {
            key: tab.id,
            title: tab.title,
            url: tab.url,
            active: tab.active,
            iconUrl: tab.favIconUrl,
            windowId: tab.windowId,
            tabId: tab.id,
            listIndex: index,
          };
        })
      );
    }
  }, [tabs, searchQuery]);

  let closeTab = (tabIdToDelete: number) => {
    chrome.tabs.remove(tabIdToDelete, function () {
      setTabs(tabs.filter((tab) => tab.id !== tabIdToDelete));
    });
  };

  return (
    <div className="w-600 mx-auto bg-gray-900">
      <ExtensionHeader tabs={tabs} setSearchQuery={setSearchQuery} />
      <TabsContainer tabsToRender={tabsToRender} closeTab={closeTab} />
    </div>
  );
}

export default App;
