import React, { useState } from "react";

interface Tab {
  title: string;
  url: string;
  active: boolean;
}

export default function Tab({ title, url, active }: Tab): React.ReactElement {
  return (
    <div className="pt-2 pl-1 pr-1 m-1 text-white bg-gray-800">
      <h1>{title}</h1>
      <p>{url}</p>
    </div>
  );
}
