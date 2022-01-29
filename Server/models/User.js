const { Socket } = require("socket.io");
module.exports = class User {
  constructor(name, id, /**@type {Socket} */ socket) {
    this.name = name;
    this.id = id;
    this.socket = socket || null;
    this.number = "";
    this.cards = [];
    this.timeout = 120000;
    this.active = true;
  }
  get userJson() {
    return {
      name: this.name,
      id: this.id,
      sockID: this.socket ? this.socket.id : null,
      number: this.number,
      active: this.active,
    };
  }
};
