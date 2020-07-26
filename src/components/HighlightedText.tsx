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
  if (highlightMatches.length === 0) return <>{text}</>;

  let indicesToHighlight = highlightMatches[0].indices;

  let result: string = "";

  console.log(text, indicesToHighlight);

  let matchIndex = 0;
  let match = indicesToHighlight[matchIndex];
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i);
    if (match && i === match[0]) {
      result += '<b style="color: #faf089;">';
    }
    result += char;
    if (match && i === match[1]) {
      result += "</b>";
      matchIndex++;
      match = indicesToHighlight[matchIndex];
    }
  }

  return <span dangerouslySetInnerHTML={{ __html: result }}></span>;
}
