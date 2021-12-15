const { Server } = require("socket.io");
const { Socket } = require("socket.io");
const User = require("../models/User");
const Game = require("./game");
const { RandomAlphabet, Logger } = require("../tools/utils");
module.exports = class MatchManager {
  constructor(/** @type {Server} */ io) {
    this.io = io;
    this.games = {};
    this.rooms = {};
    this.players = {};
  }
  ReadySignal(/** @type {Socket} */ socket, data) {
    let roomName = this.rooms[socket.id];
    let readySignal = this.games[roomName].readySignal;
    Logger(`ReadySignal: [${readySignal}] by: [${socket.id}] in: [${roomName}]`);
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
        Logger("\nstage triggered by player number:[" + data.pn.toString() + "]");
        this.games[roomName].next(data);
      }
    } else {
      Logger("stage triggered by player number:[-1]");
      this.games[roomName].next({ pn: -1, cd: -1 });
    }
  }
  PlayerReadyCustom(/** @type {User} */ player) {
    this.MakeAMatch(player, false);
    let loger = "-------------- make a match/ Custom --------------\n" + "player: " + player.name;
    Logger(loger);
  }
  PlayerJoinCustom(/** @type {User} */ player, room) {
    let plyr = this.games[room].addPlayer(player);
    if (plyr) {
      this.rooms[plyr.socket.id] = room;
      player.socket.join(room);
      this.io
        .to(room)
        .emit("playerpositionchange", { users: this.games[room].playersJson, room: this.games[room].room });
    }
  }
  PlayerChangePosition(/** @type {Socket} */ socket, data) {
    let room = this.rooms[socket.id];
    if (data.index && data.toIndex && !this.games[room].ready) {
      let plyrs = this.games[room].changePosition(data.index, data.toIndex);
      if (plyrs) {
        this.io
          .to(room)
          .emit("playerpositionchange", { users: this.games[room].playersJson, room: this.games[room].room });
      }
    }
  }
  CustomMatchReady(/** @type {Socket} */ socket) {
    let room = this.rooms[socket.id];
    if (!("4" in this.games[room].players)) {
      this.games[room].ready = true;
      this.io.to(room).emit("customlobbyready");
    } else {
      this.io.to(room).emit("customlobbyNOTready");
    }
  }
  PlayerReady(/** @type {User} */ player) {
    if (this.findSpot(player)) {
      Logger(`-------------- find a spot --------------\nPlayer: ${player.name}`);
    } else {
      this.MakeAMatch(player, true);
      Logger(`-------------- make a match/ Random --------------\nPlayer: ${player.name}`);
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
    if (game.ready) {
      this.io.to(roomName).emit("playersjoined", { users: game.playersJson, room: game.room });
    } else {
      this.io.to(roomName).emit("playerpositionchange", { users: game.playersJson, room: game.room });
    }
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
          this.io.to(roomname).emit("playersjoined", { users: game[1].playersJson, room: game[1].room });
          res = true;
          return true;
        }
      }
      // else {
      //   if (Object.keys(game[1].players).length == 0) {
      //     delete this.games[game[0]];
      //   }
      // }
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
  playerLeaveLobby(/** @type {Socket} */ socket) {
    let roomName = this.rooms[socket.id];
    if (roomName) {
      Object.entries(this.games[roomName].players).forEach((item) => {
        if (item[1].socket.id == socket.id) {
          delete this.games[roomName].players[item[0]];
          delete this.rooms[socket.id];
        }
      });
      if (socket.id in this.players) {
        this.players[socket.id].socket.leave(roomName);
        if (this.games[roomName].ready) {
          this.io
            .to(roomName)
            .emit("playersjoined", { users: this.games[roomName].playersJson, room: this.games[roomName].room });
        } else {
          this.io
            .to(roomName)
            .emit("playerpositionchange", { users: this.games[roomName].playersJson, room: this.games[roomName].room });
        }
      }
      let isPlayable = false;
      Object.values(this.games[roomName].players).forEach((player) => {
        isPlayable = true;
        return true;
      });
      if (!isPlayable) {
        delete this.games[roomName];
        this.io.to(roomName).emit("GameDestroied");
      }
      Object.values(this.games).forEach((game) => {
        Logger(`game id(${game.room}) with:${game.gameState} status`);
      });
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
      if (this.games[roomName].gameState == this.games[roomName].State.LOBBY) {
        this.playerLeaveLobby(socket);
      } else {
        let isPlayable = false;
        Object.values(this.games[roomName].players).forEach((player) => {
          if (player.active) {
            isPlayable = true;
            return true;
          }
        });
        if (!isPlayable) {
          clearTimeout(this.games[roomName].alert);
          delete this.games[roomName];
        }
      }
    }
    delete this.players[socket.id];
    Object.values(this.games).forEach((game) => {
      Logger(`game id(${game.room}) with:${game.gameState} status`);
    });
  }
};
