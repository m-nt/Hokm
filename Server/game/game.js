const User = require("../models/User");
const Stage = require("./stage");
const { Server } = require("socket.io");
const UserM = require("../models/UserM");
const mongoose = require("mongoose");
const fs = require("fs");
const { Logger } = require("../tools/utils");
module.exports = class Game {
  State = {
    LOBBY: "lobby",
    INGAME: "ingame",
  };
  constructor(/** @type {Server} */ io) {
    this.ready = false;
    this.room = "";
    this.io = io;
    this.players = {};
    this.gameState = this.State.LOBBY;
    this.stage = new Stage();
    this.readySignal = 0;
    this.alert;
    // data = {
    //   pn:0,
    //   cd:309,
    // }
  }
  next(data) {
    this.readySignal = 0;
    switch (this.gameState) {
      case this.State.LOBBY:
        this.LoggerLobby();
        Logger("/////////////////////// Game State: LOBBY /////////////////////////");
        this.io.to(this.room).emit("StartTheMatch");
        this.gameState = this.State.INGAME;
        this.stage.next(data);
        this.stage.nextStage();
        break;
      case this.State.INGAME:
        Logger(this.LoggerinGame());
        clearTimeout(this.alert);
        let result = this.stage.next(data);
        if (result.msg == "end") {
          let score = (result.teamScore.team0 - result.teamScore.team1) * 5;
          Object.values(this.players).forEach((/** @type {User} */ users) => {
            UserM.findOne({ _id: mongoose.Types.ObjectId(users.id) })
              .then((user) => {
                if (user) {
                  user.Debt +=
                    score > 0
                      ? Number(users.number) == 0 || Number(users.number) == 2
                        ? score
                        : score * -1
                      : Number(users.number) == 0 || Number(users.number) == 2
                      ? score
                      : score * -1;
                }
              })
              .catch((err) => {
                console.log(err);
              });
          });
          this.io.to(this.room).emit("EndTheMatch", result);

          //if (data.pn == this.stage.nextPlayer)
        } else {
          this.io.to(this.room).emit("GetStage", {
            ...result,
            timeout:
              this.stage.stage == this.stage.StageEnum.STAGE5
                ? this.players[this.stage.nextPlayer].timeout
                : result.timeout,
          });
          this.stage.nextStage();
        }
        this.alert = setTimeout(
          () => {
            data = {
              pn: this.stage.nextPlayer,
              cd: this.AIdecision(result),
            };
            console.log("[*]stagte triggered Timeout");
            this.next(data);
          },
          this.stage.stage == this.stage.StageEnum.STAGE5
            ? this.players[this.stage.nextPlayer].timeout
            : this.players[this.stage.nextPlayer].active
            ? result.timeout
            : this.players[this.stage.nextPlayer].timeout
        );
        break;
      default:
        break;
    }
  }
  LoggerinGame() {
    let loger = `^^^^^^^^^^^^^^^^ Game State: INGAME[${this.room}] ^^^^^^^^^^^^^^^^^\n[*]Players Status:`;
    Object.entries(this.players).forEach((user) => {
      loger +=
        "\n" +
        "⌊____[" +
        user[0] +
        "] " +
        user[1].name +
        ": " +
        (user[1].active ? "Live" : "Offline") +
        " - id[" +
        user[1].id +
        "]";
    });
    return loger;
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
        let hands = this.DetectType(cards, result.hand);
        let hokms = this.DetectType(cards, result.hokm);
        //let rad_hold = [...cards.filter(n=>!hands.includes(n))]
        //let rad = [...rad_hold.filter(n=>!hokms.includes(n))]
        if (hands.length > 0 && (leng < 13 || result.cardsOnIndex > 0)) {
          res = hands[Math.floor(Math.random() * hands.length)];
        } else if (hokms.length > 0 && (leng < 13 || result.cardsOnIndex > 0)) {
          res = hokms[Math.floor(Math.random() * hokms.length)];
        } else {
          res = cards[Math.floor(Math.random() * cards.length)];
        }
        break;
    }
    Logger(
      `AI Decide:(${res})\ncards length:${leng} - stage:${stage}\ncards:[${cards}]\nhands:[${this.DetectType(
        cards,
        result.hand
      )}]\nhokms:[${this.DetectType(cards, result.hokm)}]`
    );
    return res;
  }
  DetectType(x, type) {
    let cards = [];
    for (const key in x) {
      let m = x[key] - type;
      if (m > 0 && m < 15) {
        cards.push(x[key]);
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
  changePosition(index, toIndex) {
    if (!(toIndex.toString() in this.players)) {
      this.players[toIndex] = this.players[index];
      this.players[toIndex].number = toIndex.toString();
      delete this.players[index];
      return this.playersJson;
    } else {
      return null;
    }
  }
};
