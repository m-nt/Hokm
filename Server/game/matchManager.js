const { Server } = require("socket.io");
const { Socket } = require("socket.io");
const User = require("../models/User");
const Game = require("./game");
const { RandomAlphabet } = require("../tools/utils");

module.exports = class MatchManager {
  constructor() {
    this.games = {};
    this.rooms = {};
  }

  PlayerReady(/** @type {User} */ player, /** @type {Server} */ io, /** @type {Socket} */ socket) {
    if (this.findSpot(player, io, socket)) {
      console.log(this.games);
      console.log(this.rooms);
    } else {
      this.MakeAMatch(player, io, socket);
      console.log(this.games);
      console.log(this.rooms);
    }
  }
  MakeAMatch(/** @type {User} */ player, /** @type {Server} */ io, /** @type {Socket} */ socket) {
    console.log("make a match ...");
    let game = new Game();
    let plyr = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    this.games[roomName] = game;
    this.rooms[player.id] = roomName;
    socket.join(roomName);
    io.to(roomName).emit("playersjoined", /** @type {User} */ { users: game.playersJson });
  }

  findSpot(/** @type {User} */ player, /** @type {Server} */ io, /** @type {Socket} */ socket) {
    console.log("find an spot ...");
    let res = false;
    Object.entries(this.games).forEach((game, key) => {
      let plyr = game[1].addPlayer(player);
      let roomname = game[0];
      if (plyr) {
        console.log("spot finded :)");
        this.rooms[plyr.id] = roomname;
        socket.join(roomname);
        io.to(roomname).emit("playersjoined", /** @type {User} */ { users: game[1].playersJson });
        res = true;
      }
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
};
