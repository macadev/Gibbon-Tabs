import React from "react";
import Button from "./components/button";
import TabsContainer from "./components/TabsContainer";

function App() {
  return (
    <div className="w-600 mx-auto my-12">
      <h1>Super cool page</h1>
      <Button clickHandler={() => console.log("I was clicked")}>
        <h1>I am a button</h1>
        <h1>I am a button</h1>
      </Button>
      <TabsContainer />
    </div>
  );
}

export default App;
