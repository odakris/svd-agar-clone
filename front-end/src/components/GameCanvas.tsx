import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

interface Bubble {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;
}

export const GAME_WIDTH = 5000;
export const GAME_HEIGHT = 5000;

const GameCanvas: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<{ [key: string]: Bubble }>({});
  const foodsRef = useRef<{ [key: string]: Bubble }>({});

  useEffect(() => {
    const sketch = (p: p5) => {
      p.setup = () => {
        if (gameContainerRef.current) {
          p.createCanvas(p.windowWidth, p.windowHeight).parent(gameContainerRef.current);
        }
      };

      p.draw = () => {
        p.background(135, 206, 235);

        const players = playersRef.current;
        const foods = foodsRef.current;

        // Get the current player
        const socketId = socket.id as string;
        const player = players[socketId];
        if (!player) return;

        p.push();

        // Draw foods
        Object.values(foods).forEach((food) => {
          p.fill(food.color);
          p.ellipse(food.x, food.y, food.r * 2);
        });

        // Draw players
        Object.values(players).forEach((player) => {
          p.fill(player.color);
          p.ellipse(player.x, player.y, player.r * 2);
        });

        p.pop();
      };
    };

    const p5Instance = new p5(sketch);

    socket.on("update", (data) => {
      playersRef.current = data.players;
      foodsRef.current = data.foods;
    });

    return () => {
      p5Instance.remove();
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
