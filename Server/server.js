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

const matchM = new MatchManager();

io.on("connection", (socket) => {
  //console.log("a user connected");
  socket.on("init", (data) => {});
  socket.on("ready", (data) => {
    console.log(data);
    const user = new User(data.name, data.id, socket.id);
    matchM.PlayerReady(user, io, socket);
  });

  socket.on("disconnect", () => {
    matchM.playerDisconnect(io, socket);
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
