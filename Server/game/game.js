const User = require("../models/User");

module.exports = class Game {
  State = {
    LOBBY: "lobby",
    INGAME: "ingame",
    ENDED: "ended",
  };
  constructor() {
    this.players = {};
    this.gameState = this.State.LOBBY;
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
