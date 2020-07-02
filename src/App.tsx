import React, { useState } from "react";
import TabsContainer from "./components/TabsContainer";
import ExtensionHeader from "./components/ExtensionHeader";

function App() {
  let [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-600 mx-auto bg-gray-900">
      <ExtensionHeader setSearchQuery={setSearchQuery} />
      <TabsContainer searchQuery={searchQuery} />
    </div>
  );
}

export default App;
