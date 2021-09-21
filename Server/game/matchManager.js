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
      console.log("-------------- find a spot --------------");
      console.log(this.games);
      console.log(this.rooms);
    } else {
      this.MakeAMatch(player, io, socket);
      console.log("-------------- make a match --------------");
      console.log(this.games);
      console.log(this.rooms);
    }
  }
  MakeAMatch(/** @type {User} */ player, /** @type {Server} */ io, /** @type {Socket} */ socket) {
    let game = new Game();
    let plyr = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    this.games[roomName] = game;
    this.rooms[player.sockID] = roomName;
    socket.join(roomName);
    io.to(roomName).emit("playersjoined", /** @type {User} */ { users: game.playersJson });
  }

  findSpot(/** @type {User} */ player, /** @type {Server} */ io, /** @type {Socket} */ socket) {
    let res = false;
    Object.entries(this.games).forEach((game, key) => {
      let plyr = game[1].addPlayer(player);
      let roomname = game[0];
      if (plyr) {
        this.rooms[plyr.sockID] = roomname;
        socket.join(roomname);
        io.to(roomname).emit("playersjoined", /** @type {User} */ { users: game[1].playersJson });
        res = true;
        return true;
      }
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
  playerDisconnect(/** @type {Server} */ io, /** @type {Socket} */ socket) {
    let roomName = this.rooms[socket.id];
    if (this.games[roomName].gameState == this.games[roomName].State.LOBBY) {
      Object.entries(this.games[roomName].players).forEach((user, key) => {
        let playerNumber = key;
        if (user[1].sockID == socket.id) {
          io.to(roomName).emit("playerDCedLobby", user[1].userJson);
          delete this.games[roomName].players[user[0]];
          return true;
        }
      });
      delete this.rooms[socket.id];
    } else {
      io.to(roomName).emit("playerDCed");
      delete this.games[roomName];
      delete this.rooms[socket.id];
    }
    console.log("-------------- player DCed --------------");
    console.log(this.games);
    console.log(this.rooms);
  }
};
