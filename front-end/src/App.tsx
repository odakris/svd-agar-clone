import React from "react";
import GameCanvas from "./components/GameCanvas";

const App: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="absolute top-10 right-10 z-10 text-2xl font-bold">AGAR.io Clone</h1>
      <GameCanvas />
    </div>
  );
};

export default App;
