const Express = require("express");
const mongoose = require("mongoose");
const app = Express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const Game = require("./game");
const User = require("./models/User");
const io = new Server(server);

const PORT = 3000;
//MongoDB URL
const URL = require("../conf.json").MongoURL;
const Options = require("../conf.json").MongoOpt;
//mongose connection
mongoose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));

const readyplayers = [];
const games = {};
const rooms = {};

io.on("connection", (socket) => {
  //console.log("a user connected");
  socket.on("init", (data) => {});
  socket.on("ready", (data) => {
    const user = new User(data.name, socket.id);
    readyplayers.push(user);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT} . . .`);
});
