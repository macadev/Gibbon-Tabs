import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { chromeStorageGet, chromeStorageSet } from "../chrome/storageApi";
import { isOutOfViewport } from "../utils/viewport";

import { useActiveWindowId } from "../hooks/useActiveWindowId";

interface SaveSnapshotMenu {
  tabs: any[];
  showSaveSnapshotMenu: boolean;
  setShowSaveSnapshotMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setContainerHeightClass: React.Dispatch<React.SetStateAction<string>>;
}

enum SnapshotType {
  ACTIVE_WINDOW,
  ALL_WINDOWS,
}

enum SnapshotSavingState {
  IDLE,
  SAVING,
  DONE_SAVING,
}

async function saveSnapshot(
  snapshotName: string,
  snapshotType: SnapshotType,
  tabs: any[],
  activeWindowId: number
) {
  if (snapshotName.length === 0) {
    alert("Please specify a name for the snapshot");
    return;
  }

  let urlsByWindow = tabs.reduce((urlsByWindowsAccumulator, tab) => {
    if (
      snapshotType === SnapshotType.ACTIVE_WINDOW &&
      tab.windowId !== activeWindowId
    ) {
      return urlsByWindowsAccumulator;
    }

    if (urlsByWindowsAccumulator[tab.windowId] === undefined) {
      urlsByWindowsAccumulator[tab.windowId] = [{ url: tab.url }];
    } else {
      urlsByWindowsAccumulator[tab.windowId].push({ url: tab.url });
    }
    return urlsByWindowsAccumulator;
  }, {});

  let snapshot = {
    name: snapshotName,
    creationTimestamp: Date.now(),
    uid: uuidv4(),
    tabsPerWindow: urlsByWindow,
  };

  let snapshotKeyValueFormat: any = {};
  snapshotKeyValueFormat[snapshot.uid] = snapshot;

  try {
    await chromeStorageSet(snapshotKeyValueFormat);
  } catch (err) {
    alert(
      "Failed to save snapshot. It's too large to sync. Please remove some tabs and try again."
    );
    return;
  }

  let tabSnapUIDsWrapper: any;
  try {
    tabSnapUIDsWrapper = await chromeStorageGet("tabSnapshotUIDs");
  } catch (err) {
    alert(
      "Failed to save snapshot. Couldn't retrieve snapshot IDs. Please try again later."
    );
    return;
  }

  if (tabSnapUIDsWrapper.tabSnapshotUIDs === undefined) {
    tabSnapUIDsWrapper.tabSnapshotUIDs = { mapOfSnapUIDs: {} };
  }
  tabSnapUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs[snapshot.uid] = 1;

  try {
    await chromeStorageSet({
      tabSnapshotUIDs: tabSnapUIDsWrapper.tabSnapshotUIDs,
    });
  } catch (err) {
    alert(
      "Failed to save snapshot. An error occurred while storing the snapshot ID. Please try again later."
    );
    return;
  }
}

export default function SaveSnapshotMenu({
  tabs,
  showSaveSnapshotMenu,
  setShowSaveSnapshotMenu,
  setContainerHeightClass,
}: SaveSnapshotMenu) {
  let [snapshotType, setSnapshotType] = useState<SnapshotType>(
    SnapshotType.ACTIVE_WINDOW
  );

  let [snapshotSavingState, setSnapshotSavingState] = useState<
    SnapshotSavingState
  >(SnapshotSavingState.IDLE);

  let [snapshotName, setSnapshotName] = useState<string>("");

  let activeWindowId: number | undefined = useActiveWindowId();

  const saveSnapshotsMenu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (SnapshotSavingState.DONE_SAVING === snapshotSavingState) {
      setTimeout(() => {
        setSnapshotSavingState(SnapshotSavingState.IDLE);
        setShowSaveSnapshotMenu(false);
      }, 800);
    }
  }, [snapshotSavingState]);

  useEffect(() => {
    if (
      showSaveSnapshotMenu &&
      saveSnapshotsMenu &&
      saveSnapshotsMenu?.current &&
      isOutOfViewport(saveSnapshotsMenu?.current).any
    ) {
      setContainerHeightClass("h-48");
    }
  }, [showSaveSnapshotMenu]);

  if (showSaveSnapshotMenu === false || activeWindowId === undefined) {
    return null;
  }

  return (
    <div
      ref={saveSnapshotsMenu}
      className="absolute flex flex-col bg-gray-900 text-white p-3 w-1/3 border-2 border-solid border-gray-700"
    >
      <input
        onChange={(e) => {
          setSnapshotName(e.target.value);
        }}
        placeholder="Snapshot name..."
        type="text"
        className="bg-black text-white p-1 mb-2"
        autoFocus
      ></input>
      <div>
        <input
          type="checkbox"
          id="ACTIVE_WINDOW"
          name="ACTIVE_WINDOW"
          value="ACTIVE_WINDOW"
          className="mr-2"
          checked={snapshotType === SnapshotType.ACTIVE_WINDOW ? true : false}
          onChange={() => {
            setSnapshotType(SnapshotType.ACTIVE_WINDOW);
          }}
        ></input>
        <label htmlFor="ACTIVE_WINDOW">Active Window</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="ALL_WINDOWS"
          name="ALL_WINDOWS"
          value="ALL_WINDOWS"
          className="mr-2"
          checked={snapshotType === SnapshotType.ALL_WINDOWS ? true : false}
          onChange={() => {
            setSnapshotType(SnapshotType.ALL_WINDOWS);
          }}
        ></input>
        <label htmlFor="All_WINDOWS">All Windows</label>
      </div>
      <div className="flex flex-row">
        <button
          onClick={() => {
            setSnapshotSavingState(SnapshotSavingState.SAVING);
            saveSnapshot(
              snapshotName,
              snapshotType,
              tabs,
              // Running into a weird problem where the compiler says this might be undefined, even though we exit early if that is the case.
              // Fixed by forcing a cast.
              activeWindowId as number
            )
              .then(() => {
                setSnapshotSavingState(SnapshotSavingState.DONE_SAVING);
              })
              .catch(() => {
                setSnapshotSavingState(SnapshotSavingState.IDLE);
              });
          }}
          className={`text-xs ${
            snapshotSavingState === SnapshotSavingState.DONE_SAVING
              ? "bg-green-400"
              : "bg-blue-400"
          } text-white px-3 py-1 rounded-md mr-3 mt-2`}
          disabled={
            snapshotSavingState === SnapshotSavingState.SAVING ||
            snapshotSavingState === SnapshotSavingState.DONE_SAVING
          }
        >
          {snapshotSavingState === SnapshotSavingState.DONE_SAVING
            ? "Success"
            : "Save"}
        </button>
        <button
          onClick={() => setShowSaveSnapshotMenu(false)}
          className="text-xs bg-red-500 text-white px-3 py-1 rounded-md mr-3 mt-2"
          disabled={
            snapshotSavingState === SnapshotSavingState.SAVING ||
            snapshotSavingState === SnapshotSavingState.DONE_SAVING
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
