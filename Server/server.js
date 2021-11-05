const Express = require("express");
const mongoose = require("mongoose");
const app = Express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const MatchManager = require("./game/matchManager");
const Game = require("./game/game");
const User = require("./models/User");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 3000;
//MongoDB URL
const URL = require("../conf.json").MongoURL;
const Options = require("../conf.json").MongoOpt;
// //mongose connection
// mongoose
//   .connect(URL, Options)
//   .then(() => console.log(`mongoose conected to Data Base...`))
//   .catch((err) => console.log(err));
const matchM = new MatchManager(io);
io.on("connection", (socket) => {
  //console.log("a user connected");
  socket.on("init", (data) => {
    const user = new User(data.name, data.id, socket);
    matchM.players[socket.id] = user;
  });
  socket.on("PlayerReadyLobbie", (data) => {
    console.log(data);
    const user = new User(data.name, data.id, socket);
    matchM.PlayerReady(user);
  });
  socket.on("PlayerReadyCustomLobbie", (data) => {
    const user = new User(data.name, data.id, socket);
    matchM.PlayerReadyCustom(user);
  });
  socket.on("PlayerJoinCustomLobby", (data) => {
    // player join in a custom lobby
    const user = new User(data.name, data.id, socket);
    matchM.PlayerJoinCustom(user, data.room);
  });
  socket.on("ChangePosition", (data) => {
    // changing the player position for custom lobby
    matchM.PlayerChangePosition(socket, data);
  });
  socket.on("RequestToJoin", (data) => {
    Object.entries(matchM.players).forEach((obj) => {
      if (data.userID == obj[1].id) {
        io.to(obj[0]).emit("RequestToJoin", { room: data.room, name: data.name });
      }
    });
  });
  socket.on("ReadySignal", (data) => {
    matchM.ReadySignal(socket, data);
  });
  socket.on("setStage", (data) => {
    matchM.NextStage(socket, data);
  });
  socket.on("SendChat", (data) => {
    io.to(matchM.rooms[socket.id]).emit("GetChat", data);
  });
  socket.on("PlayerLeaveLobbie", (data) => {
    // remove the player from lobby
  });

  socket.on("disconnect", () => {
    delete matchM.players[socket.id];
    matchM.playerDisconnect(socket);
    console.log("user disconnected");
  });
});
io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
server.listen(PORT, () => {
  console.log(`listening on ${PORT} . . .`);
});
