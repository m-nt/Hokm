const { Server } = require("socket.io");
const { Socket } = require("socket.io");
const User = require("../models/User");
const Game = require("./game");
const { RandomAlphabet } = require("../tools/utils");

module.exports = class MatchManager {
  constructor(/** @type {Server} */ io) {
    this.io = io;
    this.games = {};
    this.rooms = {};
  }
  ReadySignal(/** @type {Socket} */ socket, data) {
    let roomName = this.rooms[socket.id];
    let readySignal = this.games[roomName].readySignal;
    console.log("ReadySignal: " + readySignal.toString());
    if (readySignal == 3) {
      this.games[roomName].next(data);
    } else {
      this.games[roomName].readySignal++;
    }
  }
  NextStage(/** @type {Socket} */ socket, data) {
    let roomName = this.rooms[socket.id];
    Object.entries(this.games[roomName].players).forEach((user, key) => {
      let playerNumber = user[0];
      if (playerNumber == this.games[roomName].stage.nextPlayer.toString()) {
        this.games[roomName].next(data);
        return;
      }
    });
  }

  PlayerReady(/** @type {User} */ player) {
    //console.log(this.games);
    if (this.findSpot(player)) {
      console.log("-------------- find a spot --------------");
      // console.log(this.games);
      // console.log(this.rooms);
      console.log(player.name);
    } else {
      this.MakeAMatch(player);
      console.log("-------------- make a match --------------");
      // console.log(this.games);
      // console.log(this.rooms);
      console.log(player.name);
    }
  }
  MakeAMatch(/** @type {User} */ player) {
    let game = new Game(this.io);
    let plyr = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    game.room = roomName;
    this.games[roomName] = game;
    this.rooms[player.socket.id] = roomName;
    player.socket.join(roomName);
    this.io.to(roomName).emit("playersjoined", /** @type {User} */ { users: game.playersJson });
  }

  findSpot(/** @type {User} */ player) {
    let res = false;
    Object.entries(this.games).forEach((game, key) => {
      let plyr = game[1].addPlayer(player);
      let roomname = game[0];
      if (plyr) {
        this.rooms[plyr.socket.id] = roomname;
        player.socket.join(roomname);
        this.io.to(roomname).emit("playersjoined", /** @type {User} */ { users: game[1].playersJson });
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
  playerDisconnect(/** @type {Socket} */ socket) {
    let roomName = this.rooms[socket.id];
    console.log(socket.id);
    // if (this.games[roomName].gameState == this.games[roomName].State.LOBBY) {
    //   Object.entries(this.games[roomName].players).forEach((user, key) => {
    //     let playerNumber = key;
    //     if (user[1].socket.id == socket.id) {
    //       this.io.to(roomName).emit("playerDCedLobby", user[1].userJson);
    //       delete this.games[roomName].players[user[0]];
    //       return true;
    //     }
    //   });
    //   delete this.rooms[socket.id];
    // } else {
    //   this.io.to(roomName).emit("playerDCed");
    //   delete this.games[roomName];
    //   delete this.rooms[socket.id];
    // }
    // console.log("-------------- player DCed --------------");
    // console.log(this.games);
    // console.log(this.rooms);
    // console.log(player.name);
  }
};
