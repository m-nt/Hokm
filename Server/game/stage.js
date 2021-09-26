module.exports = class Stage {
  constructor() {
    this.cards = [
      102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
      212, 213, 214, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 402, 403, 404, 405, 406, 407, 408,
      409, 410, 411, 412, 413, 414,
    ];
    this.shuffledHand = [];
    this.cardsOnGround = [];
    this.hokm = 0;
    this.ruler = null;
  }
  init() {
    this.shuffledHand = this.shuffleTheHand();
  }
  shuffleTheHand() {
    let cardHolder = this.cards;
    let cards = [];
    for (let i = 0; i < this.cards.length; i++) {
      let index = Math.floor(Math.random() * cardHolder.length);
      cards.push(cardHolder[index]);
      this.cardHolder.splice(index, 1);
    }
    return cards;
  }
};
