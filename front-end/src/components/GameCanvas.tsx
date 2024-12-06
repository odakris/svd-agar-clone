import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { io } from "socket.io-client";

// INITIALIZE SOCKET CONNECTION
const socket = io("http://localhost:3001");

// DEFINE THE BUBBLE INTERFACE FOR PLAYER AND FOOD OBJECTS
interface Bubble {
  id: string;
  x: number;
  y: number;
  r: number; // RADIUS OF THE BUBBLE
  color: string; // COLOR OF THE BUBBLE
}

// DEFINE THE GAME BOUNDARIES
export const GAME_WIDTH = 5000;
export const GAME_HEIGHT = 5000;

const GameCanvas: React.FC = () => {
  // REF FOR THE GAME CONTAINER TO ATTACH THE CANVAS
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // STATE OF PLAYERS AND FOOD
  const playersRef = useRef<{ [key: string]: Bubble }>({});
  const foodsRef = useRef<{ [key: string]: Bubble }>({});

  // STATE OF PLAYER'S SCORE AND POSITION
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number } | null>(null);

  // INITIALIZE THE GAME LOGIC
  useEffect(() => {
    const sketch = (p: p5) => {
      // P5 SETUP FUNCTION: CREATE CANVAS AND ATTACH IT TO THE CONTAINER
      p.setup = () => {
        if (gameContainerRef.current) {
          p.createCanvas(p.windowWidth, p.windowHeight).parent(gameContainerRef.current);
        }
      };

      // P5 DRAW FUNCTION
      p.draw = () => {
        // SET THE BACKGROUND COLOR
        p.background(0, 0, 0);

        // GET CURRENT PLAYERS AND FOODS
        const players = playersRef.current;
        const foods = foodsRef.current;

        // GET CURRENT PLAYER BY SOCKET ID
        const socketId = socket.id as string;
        const player = players[socketId];
        if (!player) return; // EXIT IF PLAYER DATA IS NOT AVAILABLE

        // UPDATE PLAYER POSITION IN STATE FOR DISPLAY
        setPlayerPosition({ x: player.x, y: player.y });

        // CENTER THE VIEW ON THE PLAYER
        const translateX = p.width / 2 - player.x;
        const translateY = p.height / 2 - player.y;

        // APPLY TRANSLATION TO P5 CANVAS
        p.push();
        p.translate(translateX, translateY);

        // DRAW GAME BOUNDARIES
        p.stroke(0);
        p.noFill();
        p.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // DRAW GRID INSIDE THE GAME BOUNDARIES
        const gridSize = 100;
        p.stroke(200); // LIGHT GRAY COLOR FOR GRID
        for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
          p.line(x, 0, x, GAME_HEIGHT);
        }
        for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
          p.line(0, y, GAME_WIDTH, y);
        }

        // DRAW ALL FOOD ITEMS
        Object.values(foods).forEach((food) => {
          p.fill(food.color); // SET FOOD COLOR
          p.ellipse(food.x, food.y, food.r * 2); // DRAW FOOD AS CIRCLES
        });

        // DRAW ALL PLAYERS
        Object.values(players).forEach((player) => {
          p.fill(player.color); // SET PLAYER COLOR
          p.ellipse(player.x, player.y, player.r * 2); // DRAW PLAYER AS CIRCLES
        });

        p.pop(); // RESET TRANSLATION

        // HANDLE MOUSE MOVEMENT TO CONTROL PLAYER
        p.mouseMoved();

        // UPDATE THE PLAYER'S SCORE
        setPlayerScore(player.r - 10);
      };

      // P5 MOUSE MOVED FUNCTION: HANDLE PLAYER MOVEMENT BASED ON MOUSE POSITION
      p.mouseMoved = () => {
        const socketId = socket.id as string;
        const player = playersRef.current[socketId];
        if (!player) return; // EXIT IF PLAYER DATA IS NOT AVAILABLE

        // CALCULATE DIRECTION AND SPEED BASED ON MOUSE POSITION
        const dx = p.mouseX - p.width / 2;
        const dy = p.mouseY - p.height / 2;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag < 10) return; // IGNORE MINOR MOVEMENTS

        const velocity = {
          x: (dx / mag) * 4,
          y: (dy / mag) * 4,
        };

        // EMIT MOVE EVENT TO THE SERVER
        socket.emit("move", { x: player.x + velocity.x, y: player.y + velocity.y });
      };
    };

    // INITIALIZE P5 INSTANCE WITH THE SKETCH
    const p5Instance = new p5(sketch);

    // HANDLE UPDATES FROM THE SERVER
    socket.on("update", (data) => {
      playersRef.current = data.players; // UPDATE PLAYERS
      foodsRef.current = data.foods; // UPDATE FOODS
    });

    // CLEAN UP THE P5 INSTANCE ON COMPONENT UNMOUNT
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-gray-100 flex items-center justify-center">
      {/* GAME CONTAINER TO ATTACH THE CANVAS */}
      <div
        id="game-container"
        ref={gameContainerRef}
        className="absolute inset-0 flex justify-center items-center"
      ></div>

      {/* SCOREBOARD */}
      <div className="absolute top-4 left-4 bg-opacity-50 text-white px-4 py-2 rounded shadow-lg bg-transparent bg-slate-100">
        <h1 className="font-bold text-4xl">Score: {playerScore}</h1>
      </div>

      {/* PLAYER POSITION DISPLAY */}
      <div className="absolute bottom-4 left-4 bg-opacity-50 text-white px-4 py-2 rounded shadow-lg bg-transparent bg-slate-100">
        <h1 className="font-bold text-4xl">
          Position: (X : {playerPosition ? Math.round(playerPosition.x) : ""}; Y :{" "}
          {playerPosition ? Math.round(playerPosition.y) : ""})
        </h1>
      </div>
    </div>
  );
};

export default GameCanvas;
