import React, { FunctionComponent } from "react";

interface ButtonProps {
  children: React.ReactChild | React.ReactChild[];
  clickHandler: () => void;
}

export default function Button({
  children,
  clickHandler,
}: ButtonProps): React.ReactElement {
  return (
    <button
      className="px-2 py-1 rounded-lg bg-green-400 text-green-800 text-xl font-light uppercase shadow-md hover:shadow-lg"
      onClick={clickHandler}
    >
      {children}
    </button>
  );
}
