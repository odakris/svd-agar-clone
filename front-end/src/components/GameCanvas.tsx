import React, { useEffect, useRef, useState } from "react";
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
  const [playerScore, setPlayerScore] = useState<number>(0);

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

        const socketId = socket.id as string;
        const player = players[socketId];
        if (!player) return;

        // Center the view on the player
        // const scaleFactor = 20 / player.r;
        // const translateX = p.width / 2 - player.x * scaleFactor;
        // const translateY = p.height / 2 - player.y * scaleFactor;
        const translateX = p.width / 2 - player.x;
        const translateY = p.height / 2 - player.y;

        p.push();
        p.translate(translateX, translateY);
        // p.scale(scaleFactor);

        p.stroke(0);
        p.noFill();
        p.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const gridSize = 100;
        p.stroke(200);
        for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
          p.line(x, 0, x, GAME_HEIGHT);
        }
        for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
          p.line(0, y, GAME_WIDTH, y);
        }

        Object.values(foods).forEach((food) => {
          p.fill(food.color);
          p.ellipse(food.x, food.y, food.r * 2);
        });

        Object.values(players).forEach((player) => {
          p.fill(player.color);
          p.ellipse(player.x, player.y, player.r * 2);
        });

        p.pop();

        p.mouseMoved();

        setPlayerScore(player.r - 10);
      };

      p.mouseMoved = () => {
        const socketId = socket.id as string;
        const player = playersRef.current[socketId];
        if (!player) return;

        const dx = p.mouseX - p.width / 2;
        const dy = p.mouseY - p.height / 2;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag < 10) return;

        const velocity = {
          x: (dx / mag) * 4,
          y: (dy / mag) * 4,
        };

        socket.emit("move", { x: player.x + velocity.x, y: player.y + velocity.y });
      };
    };

    const p5Instance = new p5(sketch);

    socket.on("update", (data) => {
      playersRef.current = data.players;
      foodsRef.current = data.foods;
    });

    return () => {
      p5Instance.remove(); // Clean up the p5 instance
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-gray-100 flex items-center justify-center">
      {/* Game Container */}
      <div
        id="game-container"
        ref={gameContainerRef}
        className="absolute inset-0 flex justify-center items-center"
      ></div>

      {/* Scoreboard */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded shadow-lg">
        <h1 className="text-lg font-bold">Score: {playerScore}</h1>
      </div>
    </div>
  );
};

export default GameCanvas;
