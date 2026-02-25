import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const rooms: Record<string, Todo[]> = {};

io.on("connection", (socket) => {
  socket.on("join", ({ room }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }
  });

  socket.on("message", ({ room, message }) => {
    io.to(room).emit("message", message);
  });

  socket.on("addToDo", ({ room, text }) => {
    const newToDo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    };
    rooms[room].push(newToDo);
    io.to(room).emit("update", rooms[room]);
  });

  socket.on("deleteToDo", ({ room, id }) => {
    rooms[room] = rooms[room].filter(t => t.id !== id);
    io.to(room).emit("update", rooms[room]);
  });
});

app.get("/", (req, res) => {
  res.send("Hello NB07~!~!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
