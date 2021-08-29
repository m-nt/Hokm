module.exports = class User {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.number = null;
  }
  getUserJson() {
    return { name: this.name, id: this.id, number: this.number };
  }
};
