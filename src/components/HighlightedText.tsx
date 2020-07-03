import React from "react";
import fuse from "fuse.js";

interface HighlightedTextInterface {
  text: string;
  highlightMatches: readonly fuse.FuseResultMatch[];
}

export default function HighlightedText({
  text,
  highlightMatches,
}: HighlightedTextInterface) {
  if (highlightMatches.length === 0) return <p>{text}</p>;

  let indicesToHighlight = highlightMatches[0].indices;

  let result: any[] = [];
  indicesToHighlight.map((indicesPair) => {
    let boldMode = false;
    let toBold = "";
    for (let i = 0; i < text.length; i++) {
      let char = text.charAt(i);
      if (indicesPair && i == indicesPair[0]) {
        boldMode = true;
      }

      if (boldMode) {
        toBold += char;
      } else {
        result.push(char);
      }

      if (indicesPair && i == indicesPair[1]) {
        result.push(<b className="text-yellow-300">{toBold}</b>);
        boldMode = false;
        toBold = "";
      }
    }
  });

  return <p className="truncate">{result}</p>;
}
