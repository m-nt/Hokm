const User = require("../models/User");
const Stage = require("./stage");
const { Server } = require("socket.io");

module.exports = class Game {
  State = {
    LOBBY: "lobby",
    INGAME: "ingame",
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
        console.log("Game State: LOBBY");
        this.io.to(this.room).emit("StartTheMatch");
        this.gameState = this.State.INGAME;
        this.stage.next(data);
        this.stage.nextStage();
        break;
      case this.State.INGAME:
        console.log("Game State: INGAME");
        clearTimeout();
        let result = this.stage.next(data);
        if (result.msg == "end") {
          this.io.to(this.room).emit("EndTheMatch", result);
        } else {
          this.io.to(this.room).emit("GetStage", result);
          this.stage.nextStage();
        }
        setTimeout(() => {
          data = {
            pn: this.stage.nextPlayer,
            cd: this.AIdecision(result),
          };
          this.next(data);
        }, result.timeout);
        break;
      default:
        break;
    }
  }
  AIdecision(result) {
    let nex = this.stage.nextPlayer.toString();
    let leng = result.playerCards["P" + nex].length;
    let cards = [...result.playerCards["P" + nex]];
    let stage = parseInt(this.stage.stage.split(",")[0]);
    let res = 0;
    switch (stage) {
      case 3:
        res = cards[Math.floor(Math.random() * leng)];
        break;
      case 5:
        let hands = this.DetectType(cards, result.hands);
        if (hands.length > 0) {
          res = hands[Math.floor(Math.random() * hands.length)];
          break;
        }
        let hokms = this.DetectType(cards, result.hokm);
        if (hokms.length > 0) {
          res = hokms[Math.floor(Math.random() * hands.length)];
          break;
        }
        res = cards[Math.floor(Math.random() * hands.length)];
        break;
    }
    return res;
  }
  DetectType(x, type) {
    let cards = [];
    for (const key in x) {
      let m = key - type;
      if (m > 0 && m < 15) {
        cards.push(key);
      }
    }
    return cards;
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
