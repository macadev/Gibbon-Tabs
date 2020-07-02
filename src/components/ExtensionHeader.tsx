import React, { useState } from "react";

interface ExtensionHeaderProps {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function ExtensionHeader({
  setSearchQuery,
}: ExtensionHeaderProps): React.ReactElement {
  return (
    <div className="">
      <input
        placeholder="Search text..."
        className="bg-black m-4 p-2 w-4/12 text-white"
        onChange={(event) => setSearchQuery(event.target.value)}
      ></input>
    </div>
  );
}
