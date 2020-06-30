import React, { useState, useEffect } from "react";
import Tab from "./Tab";

type Tabs = any[] | null;

export default function TabsContainer(): React.ReactElement {
  const [tabs, setTabs] = useState<Tabs>(null);

  useEffect(() => {
    (window as any)["chrome"].tabs.query({}, function (tabs: any[]) {
      console.log(tabs);
      setTabs(tabs);
    });
  }, []);

  return (
    <div>
      {tabs?.map((tab) => (
        <Tab
          title={tab.title}
          url={tab.url}
          active={tab.active}
          iconUrl={tab.favIconUrl}
        ></Tab>
      ))}
    </div>
  );
}
