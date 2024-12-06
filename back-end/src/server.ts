import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Player } from "./classes/Player";
import { Food } from "./classes/Food";
import { colorGenerator, generateFood, handlePlayerToFoodContact, handlePlayerToPlayerContact } from "./game";
import { GAME_WIDTH, GAME_HEIGHT, INIT_RADIUS } from "./constant";

const app = express();
const server = http.createServer(app);

// INITIALIZE SOCKET.IO
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true },
});

// ALL PLAYERS AND FOOD
let players: { [key: string]: Player } = {};
let foods: { [key: string]: Food } = {};

// INITIALIZE FOOD ITEMS
for (let i = 0; i < 300; i++) {
  const x = Math.random() * GAME_WIDTH;
  const y = Math.random() * GAME_HEIGHT;
  const food = generateFood(x, y); // GENERATE FOOD USING UTILITY FUNCTION
  foods[food.id] = food; // ADD FOOD TO THE FOODS OBJECT
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ADD A NEW PLAYER
  players[socket.id] = new Player(
    socket.id,
    Math.random() * GAME_WIDTH, // RANDOM X POSITION
    Math.random() * GAME_HEIGHT, // RANDOM Y POSITION
    INIT_RADIUS, // INITIAL RADIUS DEFINED IN CONSTANTS
    colorGenerator() // RANDOM COLOR
  );

  // HANDLE PLAYER MOVEMENT
  socket.on("move", (data: { x: number; y: number }) => {
    const player = players[socket.id];
    if (player) {
      // UPDATE PLAYER POSITION WITHIN GAME BOUNDARIES
      player.x = Math.max(0, Math.min(GAME_WIDTH, data.x));
      player.y = Math.max(0, Math.min(GAME_HEIGHT, data.y));
    }
  });

  // CHECK FOR COLLISIONS WITH FOOD
  socket.on("player-eat-food", ({ foodId }: { foodId: string }) => {
    const player = players[socket.id];

    if (handlePlayerToFoodContact(player, foods[foodId])) {
      delete foods[foodId];
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const food = generateFood(x, y);
      foods[food.id] = food;
      io.emit("food-eaten", { foodId });
    }
  });

  // CHECK FOR COLLISIONS WITH PLAYER
  socket.on("player-eat-player", ({ otherPlayerId }: { otherPlayerId: string }) => {
    const player = players[socket.id];
    const otherPlayer = players[otherPlayerId];

    if (!player || !otherPlayer) return;

    const eatenPlayerId = handlePlayerToPlayerContact(player, otherPlayer);
    if (eatenPlayerId) {
      delete players[eatenPlayerId];
      io.emit("player-eaten", { eatenPlayerId });
    }
  });

  // HANDLE PLAYER DISCONNECTION
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id]; // REMOVE PLAYER FROM THE GAME
  });
});

// PERIODICALLY GENERATE NEW FOOD ITEMS
setInterval(() => {
  const x = Math.random() * GAME_WIDTH;
  const y = Math.random() * GAME_HEIGHT;
  const newFood = generateFood(x, y);
  foods[newFood.id] = newFood; // ADD NEW FOOD TO THE FOODS OBJECT
}, 500);

// BROADCAST GAME STATE TO ALL CLIENTS
setInterval(() => {
  io.emit("update", { players, foods });
}, 1000 / 60);

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
