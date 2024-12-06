import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Player } from "./classes/Player";
import { GAME_WIDTH, GAME_HEIGHT, INIT_RADIUS } from "./constant";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let players: { [key: string]: Player } = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add new player
  players[socket.id] = new Player(
    socket.id,
    Math.random() * GAME_WIDTH,
    Math.random() * GAME_HEIGHT,
    INIT_RADIUS,
    "red"
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("update", { players });
}, 1000 / 60);

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
