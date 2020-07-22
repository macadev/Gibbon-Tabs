import React, { useState } from "react";
import { faCameraRetro, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SaveSnapshotMenu from "./SaveSnapshotMenu";

interface ExtensionHeaderInterface {
  tabs: any[];
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function ExtensionHeader({
  tabs,
  setSearchQuery,
}: ExtensionHeaderInterface): React.ReactElement {
  let [showSaveSnapshotMenu, setShowSaveSnapshotMenu] = useState<boolean>(
    false
  );

  return (
    <div className="flex flex-row items-center">
      <input
        placeholder="Search text..."
        className="bg-black m-4 p-2 w-4/12 text-white"
        onChange={(event) => setSearchQuery(event.target.value)}
        autoFocus
      ></input>
      <div>
        <button
          onClick={() => setShowSaveSnapshotMenu(!showSaveSnapshotMenu)} // Toggle the menu on and off
          className="text-lg bg-blue-500 text-white px-5 py-1 rounded-md mr-3"
        >
          <FontAwesomeIcon icon={faCameraRetro}></FontAwesomeIcon>
        </button>
        <SaveSnapshotMenu
          tabs={tabs}
          showSaveSnapshotMenu={showSaveSnapshotMenu}
          setShowSaveSnapshotMenu={setShowSaveSnapshotMenu}
        ></SaveSnapshotMenu>
      </div>
      <button className="text-lg bg-blue-500 text-white px-5 py-1 rounded-md mr-3">
        <FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon>
      </button>
    </div>
  );
}
