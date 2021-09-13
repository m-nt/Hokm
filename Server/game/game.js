const User = require("../models/User");

module.exports = class Game {
  constructor() {
    this.players = {};
  }
  addPlayer(/** @type {User} */ _player) {
    let length = Object.keys(this.players).length;
    if (length < 3) {
      let player = _player;
      player.number = length.toString();
      this.players[player.number] = player;
      return player;
    } else {
      return null;
    }
  }
  get playersJson() {
    let result = [];
    Object.values(this.players).forEach((/** @type {User} */ user) => {
      result.push(user.userJson);
    });
    return result;
  }
};
