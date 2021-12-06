//require("appmetrics-dash").monitor();
const Express = require("express");
const mongoose = require("mongoose");
const app = Express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const MatchManager = require("./game/matchManager");
const User = require("./models/User");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 3000;
//MongoDB URL
const URL = require("./conf.json").MongoURL;
const Options = require("./conf.json").MongoOpt;
const { match } = require("assert");
// //mongose connection
mongoose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));
const matchM = new MatchManager(io);
io.on("connection", (socket) => {
  //console.log("a user connected");
  socket.on("init", (data) => {
    const user = new User(data.name, data.id, socket);
    matchM.players[socket.id] = user;
    Object.values(matchM.players).forEach((player) => {
      console.log(`player[${player.socket.id}] with name:${player.name}`);
    });
  });
  socket.on("ReadyToPlayCustom", (data) => {
    matchM.CustomMatchReady(socket);
  });
  socket.on("PlayerReadyLobby", (data) => {
    console.log(data);
    const user = new User(data.name, data.id, socket);
    matchM.PlayerReady(user);
  });
  socket.on("PlayerReadyCustomLobby", (data) => {
    const user = new User(data.name, data.id, socket);
    matchM.PlayerReadyCustom(user);
  });
  socket.on("PlayerJoinCustomLobby", (data) => {
    // player join in a custom lobby
    const user = new User(data.name, data.userID, socket);
    matchM.PlayerJoinCustom(user, data.room);
  });
  socket.on("ChangePosition", (data) => {
    // changing the player position for custom lobby
    matchM.PlayerChangePosition(socket, data);
  });
  socket.on("RequestToJoin", (data) => {
    Object.entries(matchM.players).forEach((obj) => {
      if (data.userID == obj[1].id) {
        console.log("send RequestToJoin");
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
  socket.on("PlayerLeaveLobby", (data) => {
    // remove the player from lobby
    matchM.playerLeaveLobby(socket);
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
