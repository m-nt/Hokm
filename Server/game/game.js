const User = require("../models/User");
const Stage = require("./stage");
const { Server } = require("socket.io");

module.exports = class Game {
  State = {
    LOBBY: "lobby",
    INGAME: "ingame",
    ENDED: "ended",
  };
  constructor(/** @type {Server} */ io) {
    this.room = "";
    this.io = io;
    this.players = {};
    this.gameState = this.State.LOBBY;
    this.stage = new Stage();
    this.readySignal = 0;
    // data = {
    //   pn:0,
    //   cd:309,
    // }
  }
  next(data) {
    this.readySignal = 0;
    switch (this.gameState) {
      case this.State.LOBBY:
        this.io.to(this.room).emit("StartTheMatch");
        this.gameState = this.State.INGAME;
        this.stage.next(data);
        break;
      case this.State.INGAME:
        clearTimeout();
        let result = this.stage.next(data);
        this.io.to(this.room).emit("GetStage", result);
        setTimeout(() => {
          let nex = this.stage.nextPlayer.toString();
          let leng = this.players[nex].length;
          data = {
            pn: this.stage.nextPlayer,
            cd: this.players[nex][Math.floor(Math.random() * leng)],
          };
          this.next(data);
        }, 5000);
        break;
      case this.State.ENDED:
        this.io.to(this.room).emit("EndTheMatch");
        break;
      default:
        break;
    }
  }
  addPlayer(/** @type {User} */ _player) {
    for (let index = 0; index < 4; index++) {
      if (!(index.toString() in this.players)) {
        let player = _player;
        player.number = index.toString();
        this.players[player.number] = player;
        return player;
      }
    }
    return null;
  }
  get playersJson() {
    let result = [];
    Object.values(this.players).forEach((/** @type {User} */ user) => {
      result.push(user.userJson);
    });
    return result;
  }
};
