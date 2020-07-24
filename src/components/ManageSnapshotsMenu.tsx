import React, { useState, useEffect, useRef } from "react";
import {
  chromeStorageGet,
  chromeStorageSet,
  chromeStorageRemove,
} from "../chrome/storageApi";
import { createWindow } from "../chrome/tabApi";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isOutOfViewport } from "../utils/viewport";

interface ManageSnapshotsMenu {
  showManageSnapshotsMenu: boolean;
  setShowManageSnapshotsMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setContainerHeightClass: React.Dispatch<React.SetStateAction<string>>;
}

async function getTabSnapshots() {
  let snapshotUIDsWrapper: any = await chromeStorageGet("tabSnapshotUIDs");

  if (
    snapshotUIDsWrapper.tabSnapshotUIDs === undefined ||
    Object.keys(snapshotUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs).length === 0
  ) {
    // User hasn't created any snapshots
    return [];
  }

  let snapshotUIDs = Object.keys(
    snapshotUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs
  );

  let snapshots: any[] = [];
  for (let uid of snapshotUIDs) {
    snapshots.push(((await chromeStorageGet(uid)) as any)[uid]);
  }

  return snapshots;
}

async function deleteTabSnapshot(snapshotUID: string) {
  let snapshotUIDsWrapper: any = await chromeStorageGet("tabSnapshotUIDs");

  delete snapshotUIDsWrapper.tabSnapshotUIDs.mapOfSnapUIDs[snapshotUID];

  await chromeStorageSet({
    tabSnapshotUIDs: snapshotUIDsWrapper.tabSnapshotUIDs,
  });

  await chromeStorageRemove(snapshotUID);
}

export default function ManageSnapshotsMenu({
  showManageSnapshotsMenu,
  setShowManageSnapshotsMenu,
  setContainerHeightClass,
}: ManageSnapshotsMenu) {
  let [snapshots, setSnapshots] = useState<any[] | null>(null);
  let [errorFetchingSnapshots, setErrorFetchingSnapshots] = useState<boolean>(
    false
  );
  const manageSnapshotsMenu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      showManageSnapshotsMenu &&
      manageSnapshotsMenu &&
      manageSnapshotsMenu?.current &&
      isOutOfViewport(manageSnapshotsMenu?.current).any
    ) {
      setContainerHeightClass("h-400");
    }
  }, [showManageSnapshotsMenu]);

  useEffect(() => {
    getTabSnapshots()
      .then((snapshots) => {
        // Sort the snapshots based on name
        snapshots.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        setSnapshots(snapshots);
      })
      .catch(() => {
        setErrorFetchingSnapshots(true);
      });
  }, [showManageSnapshotsMenu]);

  if (showManageSnapshotsMenu === false || snapshots === null) {
    return null;
  }

  return (
    <div
      ref={manageSnapshotsMenu}
      className="absolute bg-gray-900 text-white p-4 w-5/12 border-2 border-solid border-gray-700 max-h-64 overflow-y-scroll"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowManageSnapshotsMenu(false);
        }}
        className="text-sm absolute right-0 top-0 pt-1 px-4 hover:text-red-600 cursor-pointer"
      >
        <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
      </div>
      <div className="flex justify-center">
        <p className="text-sm underline m-auto">Tab Snapshots</p>
      </div>
      {errorFetchingSnapshots ? (
        <div className="flex justify-center mt-2">
          <p className="text-sm m-auto">
            An error occurred fetching your snapshots. Please try again later.
          </p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="flex justify-center mt-2">
          <p className="text-sm text-center m-auto">
            You haven't created any snapshots.
          </p>
        </div>
      ) : (
        <div className="flex flex-col mt-2">
          {snapshots.map((snapshot) => {
            return (
              <div
                key={snapshot.uid}
                onClick={(e) => {
                  e.stopPropagation();

                  let windowCreationPromises: any[] = [];
                  Object.values(snapshot.tabsPerWindow).map((tabs) => {
                    let urls = (tabs as any[]).map((tab) => tab.url);
                    windowCreationPromises.push(createWindow(urls));
                  });

                  Promise.all(windowCreationPromises).then(() => {
                    window.close();
                  });
                }}
                className="bg-gray-800 hover:bg-gray-700 p-2 my-1 w-full flex flex-row items-center"
              >
                <p className="w-full truncate">{snapshot.name}</p>
                <FontAwesomeIcon
                  className="mx-1 hover:text-red-600 cursor-pointer"
                  icon={faTimes}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTabSnapshot(snapshot.uid)
                      .then(() => {
                        setSnapshots(
                          (snapshots as any[]).filter((snapshotToFilter) => {
                            return snapshot.uid !== snapshotToFilter.uid;
                          })
                        );
                      })
                      .catch(() => {
                        alert(
                          "An unexpected error occurred while deleting the tab snapshot."
                        );
                      });
                  }}
                ></FontAwesomeIcon>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
