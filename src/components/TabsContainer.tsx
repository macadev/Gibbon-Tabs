import React, { useState } from "react";
import Tab from "./Tab";

type Tabs = any[] | null;

export default function TabsContainer(): React.ReactElement {
  const [tabs, setTabs] = useState<Tabs>(null);

  (window as any)["chrome"].tabs.query({}, function (tabs: any[]) {
    setTabs(tabs);
  });

  return (
    <div className="bg-gray-900">
      {tabs?.map((tab) => (
        <Tab title={tab.title} url={tab.url} active={tab.active}></Tab>
      ))}
    </div>
  );
}
