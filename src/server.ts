import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("ping", () => {
    io.emit("pong", `${socket.id} sent ping`);
  });

  socket.on("join", ({ room }) => {
    socket.join(room);
  });

  socket.on("message", ({ room, message }) => {
    io.to(room).emit("message", message);
  });
});

app.get("/", (req, res) => {
  res.send("Hello NB07~!~!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
