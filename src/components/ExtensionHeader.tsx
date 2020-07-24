import React, { useState, useEffect } from "react";
import { faCameraRetro, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SaveSnapshotMenu from "./SaveSnapshotMenu";
import ManageSnapshotsMenu from "./ManageSnapshotsMenu";
import { createTab } from "../chrome/tabApi";

interface ExtensionHeaderInterface {
  tabs: any[];
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setContainerHeightClass: React.Dispatch<React.SetStateAction<string>>;
}

export default function ExtensionHeader({
  tabs,
  setSearchQuery,
  setContainerHeightClass,
}: ExtensionHeaderInterface): React.ReactElement {
  let [showSaveSnapshotMenu, setShowSaveSnapshotMenu] = useState<boolean>(
    false
  );

  let [showManageSnapshotsMenu, setShowManageSnapshotsMenu] = useState<boolean>(
    false
  );

  useEffect(() => {
    if (showSaveSnapshotMenu) {
      setShowManageSnapshotsMenu(false);
    }
  }, [showSaveSnapshotMenu]);

  useEffect(() => {
    if (showManageSnapshotsMenu) {
      setShowSaveSnapshotMenu(false);
    }
  }, [showManageSnapshotsMenu]);

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
          setContainerHeightClass={setContainerHeightClass}
        ></SaveSnapshotMenu>
      </div>
      <div>
        <button
          onClick={() => {
            setShowManageSnapshotsMenu(!showManageSnapshotsMenu);
          }}
          className="text-lg bg-blue-500 text-white px-5 py-1 rounded-md mr-3"
        >
          <FontAwesomeIcon icon={faFolderOpen}></FontAwesomeIcon>
        </button>
        <ManageSnapshotsMenu
          showManageSnapshotsMenu={showManageSnapshotsMenu}
          setShowManageSnapshotsMenu={setShowManageSnapshotsMenu}
          setContainerHeightClass={setContainerHeightClass}
        ></ManageSnapshotsMenu>
      </div>
      <p
        onClick={(e) => {
          e.preventDefault();
          createTab("https://github.com/macadev/Gibbon-Tabs");
        }}
        className="text-white text-lg tracking-wider italic ml-auto mr-4 cursor-pointer"
      >
        Gibbon Tabs
      </p>
    </div>
  );
}
