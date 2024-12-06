import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Player } from "./classes/Player";
import { Food } from "./classes/Food";
import { colorGenerator, generateFood, handlePlayerToFoodContact, handlePlayerToPlayerContact } from "./game";
import { GAME_WIDTH, GAME_HEIGHT, INIT_RADIUS } from "./constant";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true },
});

let players: { [key: string]: Player } = {};
let foods: { [key: string]: Food } = {};

// Initialize food
for (let i = 0; i < 300; i++) {
  const x = Math.random() * GAME_WIDTH;
  const y = Math.random() * GAME_HEIGHT;
  const food = generateFood(x, y);
  foods[food.id] = food;
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add new player
  players[socket.id] = new Player(
    socket.id,
    Math.random() * GAME_WIDTH,
    Math.random() * GAME_HEIGHT,
    INIT_RADIUS,
    colorGenerator()
  );

  socket.on("move", (data: { x: number; y: number }) => {
    const player = players[socket.id];
    if (player) {
      player.x = Math.max(0, Math.min(GAME_WIDTH, data.x));
      player.y = Math.max(0, Math.min(GAME_HEIGHT, data.y));

      // Check collisions with food
      Object.keys(foods).forEach((foodId) => {
        if (handlePlayerToFoodContact(player, foods[foodId])) {
          delete foods[foodId]; // Remove consumed food
          const x = Math.random() * GAME_WIDTH;
          const y = Math.random() * GAME_HEIGHT;
          const newFood = generateFood(x, y);
          foods[newFood.id] = newFood; // Generate a new food item
        }
      });

      // Check collisions with other players
      Object.keys(players).forEach((id) => {
        if (id !== socket.id) {
          const otherPlayer = players[id];
          const eatenPlayerId = handlePlayerToPlayerContact(player, otherPlayer);
          if (eatenPlayerId) {
            delete players[eatenPlayerId]; // Remove the "eaten" player
          }
        }
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
  });
});

setInterval(() => {
  const x = Math.random() * GAME_WIDTH;
  const y = Math.random() * GAME_HEIGHT;
  const newFood = generateFood(x, y);
  foods[newFood.id] = newFood;
}, 500);

// Broadcast game state to all clients at 60 FPS
setInterval(() => {
  io.emit("update", { players, foods });
}, 1000 / 60);

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
