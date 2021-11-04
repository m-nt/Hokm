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

    if (data) {
      if (data.pn == this.games[roomName].stage.nextPlayer) {
        console.log("stage triggered by player number:[" + data.pn.toString() + "]");
        this.games[roomName].next(data);
      }
    } else {
      console.log("stage triggered by player number:[-1]");
      this.games[roomName].next({ pn: -1, cd: -1 });
    }
  }
  PlayerReadyCustom(/** @type {User} */ player) {
    this.MakeAMatch(player, false);
    console.log("-------------- make a match/ Custom --------------");
    console.log("player: " + player.name);
  }
  PlayerJoinCustom(/** @type {User} */ player, room) {
    let plyr = this.games[room].addPlayer(player);
    if (plyr) {
      this.rooms[plyr.socket.id] = room;
      player.socket.join(room);
      this.io.to(roomname).emit("playersjoined", { users: this.games[room].playersJson });
    }
  }
  PlayerChangePosition(/** @type {Socket} */ socket, data) {
    let room = this.rooms[socket.id];
    if (data.index && data.toIndex && !this.games[room].ready) {
      let plyrs = this.games[room].changePosition(data.index, data.toIndex);
      if (plyrs) {
        this.io.to(roomname).emit("playerpositionchange", { users: this.games[room].playersJson });
      }
    }
  }
  CustomMatchReady(/** @type {Socket} */ socket) {
    let room = this.rooms[socket.id];
    if (!("4" in this.games[room].players)) {
      this.games[room].ready = true;
      this.io.to(roomname).emit("customlobbieready");
    }
  }
  PlayerReady(/** @type {User} */ player) {
    //console.log(this.games);
    if (this.findSpot(player)) {
      console.log("-------------- find a spot --------------");
      // console.log(this.games);
      // console.log(this.rooms);
      console.log(player.name);
    } else {
      this.MakeAMatch(player, true);
      console.log("-------------- make a match/ Random --------------");
      // console.log(this.games);
      // console.log(this.rooms);
      console.log(player.name);
    }
  }
  MakeAMatch(/** @type {User} */ player, custom) {
    let game = new Game(this.io);
    game.ready = custom;
    let plyr = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    game.room = roomName;
    this.games[roomName] = game;
    this.rooms[player.socket.id] = roomName;
    player.socket.join(roomName);
    this.io.to(roomName).emit("playersjoined", { users: game.playersJson, room: game.room });
  }

  findSpot(/** @type {User} */ player) {
    let res = false;
    Object.entries(this.games).forEach((game, key) => {
      if (game[1].ready) {
        let plyr = game[1].addPlayer(player);
        let roomname = game[0];
        if (plyr) {
          this.rooms[plyr.socket.id] = roomname;
          player.socket.join(roomname);
          this.io.to(roomname).emit("playersjoined", { users: game[1].playersJson });
          res = true;
          return true;
        }
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
    if (roomName) {
      Object.entries(this.games[roomName].players).forEach((user, key) => {
        if (user[1].socket.id == socket.id) {
          this.games[roomName].players[user[0]].timeout = 3000;
          this.games[roomName].players[user[0]].active = false;
          return true;
        }
      });
    }
    // if (this.games[roomName].gameState == this.games[roomName].State.LOBBY) {
  }
};
