const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (room, name) => {
    if (getUsersInRoom(room).length === 0) {
      io.to(socket.id).emit("host_joined", { host: true });
    }

    if (getUsersInRoom(room).length > 5) {
      io.to(socket.id).emit("roomStatus", { text: "this room is filled" });
    } else {
      socket.join(room);
      const { error, user } = addUser({ id: socket.id, name, room });
      if (error) return callback(error);
      socket.join(user.room);
      console.log(user);

      io.to(socket.id).emit("position", {
        data: getUsersInRoom(user.room).length,
      });

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("send_choice", (choice, wager) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("getPlayerChoice", {
      player: user,
      selection: choice,
    });
  });

  socket.on("start_game", (room) => {
    io.to(room).emit("start", {
      text: "game has started",
    });
  });

  socket.on("next_round", (room, round) => {
    io.to(room).emit("next_round_detected", {
      round: round,
      answer: Math.floor(Math.random() * 11),
    });
  });

  socket.on(
    "sending_user_lat_and_lang",
    (room, user, userInputLat, userInputLang) => {
      io.to(room).emit("incoming_lat_lang", {
        user: user,
        data: {
          lat: userInputLat,
          lang: userInputLang,
        },
      });
    }
  );

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("send_host_answer", (data) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("recieve_host_answer", { data });
  });

  socket.on("request_answer", () => {
    var random = Math.random();
    const user = getUser(socket.id);
    io.to(user.room).emit("recieve_answer");
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
