import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

interface User {
  id: string;
  name: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdBy: string;
}

const users: Record<string, User> = {};
const rooms: Record<string, Todo[]> = {};

io.on("connection", (socket) => {
  io.emit("userCount", { count: io.sockets.sockets.size });

  socket.on("setName", ({ name }: { name: string }) => {
    users[socket.id] = {
      id: socket.id,
      name: name,
    };
  });

  socket.on("join", ({ room }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }

    socket.emit("init", rooms[room]);
  });

  socket.on("message", ({ room, message }) => {
    io.to(room).emit("message", message);
  });

  socket.on("addToDo", ({ room, text }) => {
    const user = users[socket.id];
    const newToDo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdBy: user ? user.name : "알수없음",
    };
    rooms[room].push(newToDo);
    io.to(room).emit("update", rooms[room]);
  });

  socket.on("toggleToDo", ({ room, id }) => {
    const todo = rooms[room].find((t) => t.id === id);
    if (todo) {
      todo.completed = true;
      io.to(room).emit("update", rooms[room]);
    }
  });

  socket.on("deleteToDo", ({ room, id }) => {
    rooms[room] = rooms[room].filter((t) => t.id !== id);
    io.to(room).emit("update", rooms[room]);
  });

  socket.on("startEditing", ({ room, id }) => {
    const user = users[socket.id];
    io.to(room).emit("editing", { id, user: user ? user.name : "알수없음" });
  });

  socket.on("disconnect", () => {
    io.emit("userCount", { count: io.sockets.sockets.size });
  });
});

app.get("/", (req, res) => {
  res.send("Hello NB07~!~!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
