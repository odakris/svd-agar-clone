import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Player } from "./classes/Player";
import { GAME_WIDTH, GAME_HEIGHT, INIT_RADIUS } from "./constant";
import { Food } from "./classes/Food";
import { generateFood } from "./game";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
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
  players[socket.id] = new Player(socket.id, GAME_WIDTH / 2, GAME_HEIGHT / 2, INIT_RADIUS, "red");

  socket.on("move", (data: { x: number; y: number }) => {
    const player = players[socket.id];
    if (player) {
      player.x = Math.max(0, Math.min(GAME_WIDTH, data.x));
      player.y = Math.max(0, Math.min(GAME_HEIGHT, data.y));
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("update", { players, foods });
}, 1000 / 60);

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
