module.exports = class User {
  constructor(name, id, socketID) {
    this.name = name;
    this.id = id;
    this.sockID = socketID;
    this.number = null;
  }
  getUserJson() {
    return { name: this.name, id: this.id, sockID: this.sockID, number: this.number };
  }
};
