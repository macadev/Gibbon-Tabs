import React, { useRef, useEffect } from "react";
import fuse from "fuse.js";
import HighlightedText from "./HighlightedText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { activateTab } from "../chrome/tabApi";
import { isOutOfViewport } from "../utils/viewport";

interface Tab {
  title: string;
  url: string;
  iconUrl: string | undefined;
  active: boolean;
  windowId: number;
  tabId: number;
  highlightMatches?: readonly fuse.FuseResultMatch[];
  listIndex: number;
  closeTabHandler: (tabIdToDelete: number) => void;
  setTabToActive: React.Dispatch<React.SetStateAction<number>>;
  selectedForActivation: boolean;
  isInActiveWindow: boolean;
}

export default function Tab({
  title,
  url,
  iconUrl,
  active,
  windowId,
  tabId,
  highlightMatches = [],
  listIndex,
  closeTabHandler,
  setTabToActive,
  selectedForActivation,
  isInActiveWindow,
}: Tab): React.ReactElement {
  const tabElementRef = useRef<HTMLDivElement | null>(null);

  let titleHighlightMatches = highlightMatches.filter(
    (match) => match.key === "title"
  );

  let urlHighlightMatches = highlightMatches.filter(
    (match) => match.key === "url"
  );

  useEffect(() => {
    if (
      selectedForActivation &&
      tabElementRef &&
      tabElementRef?.current &&
      isOutOfViewport(tabElementRef?.current).any
    ) {
      tabElementRef?.current?.scrollIntoView(false);
    }
  }, [selectedForActivation]);

  return (
    <div
      ref={tabElementRef}
      onClick={() => activateTab({ windowId, tabId })}
      onMouseEnter={(e) => setTabToActive(listIndex)}
      className={`pt-4 pb-4 pl-1 pr-1 m-1 mb-2 text-white flex flex-row ${
        selectedForActivation ? "bg-gray-700" : "bg-gray-800"
      }`}
    >
      <div className="flex flex-col pl-2 pr-2 justify-center h-8 w-8">
        {iconUrl ? (
          <img className="object-contain max-w-none" src={iconUrl}></img>
        ) : null}
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="text-sm truncate">
          <HighlightedText
            text={title}
            highlightMatches={titleHighlightMatches}
          ></HighlightedText>
        </div>
        <div className="text-xs truncate">
          <HighlightedText
            text={url}
            highlightMatches={urlHighlightMatches}
          ></HighlightedText>
        </div>
      </div>
      {isInActiveWindow && (
        <div className="text-base text-blue-600 pl-4 flex flex-col justify-center">
          <FontAwesomeIcon
            icon={faWindowMaximize}
            onClick={(e) => {
              e.stopPropagation();
              closeTabHandler(tabId);
            }}
          ></FontAwesomeIcon>
        </div>
      )}
      <div className="text-base pr-4 pl-2 flex flex-col justify-center hover:text-red-600 cursor-pointer">
        <FontAwesomeIcon
          icon={faTimes}
          onClick={(e) => {
            e.stopPropagation();
            closeTabHandler(tabId);
          }}
        ></FontAwesomeIcon>
      </div>
    </div>
  );
}
