import React, { useEffect, useRef } from "react";
import p5 from "p5";

export const GAME_WIDTH = 5000;
export const GAME_HEIGHT = 5000;

const GameCanvas: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null); // Reference to the game container

  useEffect(() => {
    const sketch = (p: p5) => {
      p.setup = () => {
        // Attach canvas to the #game-container div
        if (gameContainerRef.current) {
          p.createCanvas(p.windowWidth, p.windowHeight).parent(gameContainerRef.current);
        }
      };

      p.draw = () => {
        p.background(135, 206, 235); // Light blue background
      };
    };

    const p5Instance = new p5(sketch); // Initialize p5.js sketch

    return () => {
      p5Instance.remove(); // Clean up p5 instance on component unmount
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={gameContainerRef}
      className="relative h-screen w-screen bg-gray-100 flex items-center justify-center"
    ></div>
  );
};

export default GameCanvas;
