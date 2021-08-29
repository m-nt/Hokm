const { Socket } = require("socket.io");
const User = require("../models/User");
const Game = require("./game");
const { RandomAlphabet } = require("../tools/utils");

module.exports = class MatchManager {
  constructor() {
    this.games = {};
    this.rooms = {};
  }

  PlayerReady(/** @type {User} */ player, /** @type {Socket} */ socket) {
    if (this.findSpot(player, socket)) {
    } else {
      this.MakeAMatch(player, socket);
    }
  }
  MakeAMatch(/** @type {User} */ player, /** @type {Socket} */ socket) {
    let game = new Game();
    let g = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    this.games[roomName] = game;
    socket.join(roomName);
    socket.to(roomName).emit("playerjoined", /** @type {User} */ (game.players[player.number]).getUserJson());
  }

  findSpot(/** @type {User} */ player, /** @type {Socket} */ socket) {
    Object.entries(games).forEach((key, /** @type {Game} */ game) => {
      if (game.addPlayer(player)) {
        this.rooms[player.id] = key[0];
        socket.join(key[0]);
        socket.to(key[0]).emit("playerjoined", /** @type {User} */ (game.players[player.number]).getUserJson());
        return true;
      }
      return false;
    });
  }
};
