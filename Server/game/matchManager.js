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
      console.log(this.games);
      console.log(this.rooms);
    } else {
      this.MakeAMatch(player, socket);
      console.log(this.games);
      console.log(this.rooms);
    }
  }
  MakeAMatch(/** @type {User} */ player, /** @type {Socket} */ socket) {
    let game = new Game();
    let plyr = game.addPlayer(player);
    let roomName = RandomAlphabet(10, true, true, true);
    this.games[roomName] = game;
    this.rooms[plyr.id] = key[0];
    socket.join(roomName);
    socket.emit("imjoined", { users: game.playersJson() });
    socket.to(roomName).emit("playerjoined", /** @type {User} */ plyr.getUserJson());
  }

  findSpot(/** @type {User} */ player, /** @type {Socket} */ socket) {
    Object.entries(games).forEach((key, /** @type {Game} */ game) => {
      let plyr = game.addPlayer(player);
      if (plyr) {
        this.rooms[plyr.id] = key[0];
        socket.join(key[0]);
        socket.emit("imjoined", /** @type {User} */ { users: game.playersJson() });
        socket.to(key[0]).emit("playerjoined", /** @type {User} */ plyr.getUserJson());
        return true;
      }
      return false;
    });
  }
};
