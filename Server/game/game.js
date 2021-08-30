const User = require("../models/User");

module.exports = class Game {
  constructor() {
    this.players = {};
  }
  addPlayer(/** @type {User} */ _player) {
    let length = Object.keys(this.players).length;
    if (length < 3) {
      let player = _player;
      player.number = length;
      this.players[player.number] = player;
      return player;
    } else {
      return null;
    }
  }
  playersJson() {
    result = [];
    Object.entries(this.players).forEach((key, /** @type {User} */ user) => {
      result.push(user.getUserJson());
    });
    return result;
  }
};
