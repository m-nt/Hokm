module.exports = class Stage {
  StageEnum = {
    STAGE0: "0,idle",
    STAGE1: "1,decide the ruler",
    STAGE2: "2,send first 4 sets of cards",
    STAGE3: "3,decide the hokm",
    STAGE4: "4,send cards 4 by 4",
    STAGE5: "5,paly the cards",
    STAGE6: "6,decide the winner",
  };
  constructor() {
    this.cards = [
      102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
      212, 213, 214, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 402, 403, 404, 405, 406, 407, 408,
      409, 410, 411, 412, 413, 414,
    ];
    this.playercards = { 0: [], 1: [], 2: [], 3: [] };
    this.teamCount = { team0: 0, team1: 0 };
    this.teamScore = { team0: 0, team1: 0 };
    this.shuffledHand = [];
    this.cardsOnGround = { 0: 0, 1: 0, 2: 0, 3: 0 };
    this.cardsOnIndex = 0;
    this.hokm = 0;
    this.ruler = null;
    this.nextPlayer = 0;
    this.hand = 0;
    this.stage = this.StageEnum.STAGE0;
  }
  next(data) {
    switch (this.stage) {
      case this.StageEnum.STAGE0:
        this.shuffledHand = this.shuffleTheHand();
        this.stage = this.StageEnum.STAGE1;
        break;
      case this.StageEnum.STAGE1:
        let cards = this.shuffledHand.splice(0, 4);
        for (let i = 0; i < cards.length; i++) {
          this.cardsOnGround[i.toString()] = cards[i];
        }
        let result = this.stageJson;
        cards.map((value, index) => {
          if (this.SelectNumber(value) == 14) {
            this.stage = this.StageEnum.STAGE2;
            this.ruler = index;
            this.nextPlayer = index;
            this.shuffledHand = this.shuffleTheHand();
            result = this.stageJson;
            return;
          }
        });
        return result;
      case this.StageEnum.STAGE2:
        Object.values(this.cardsOnGround).forEach((value) => {
          value = 0;
        });
        Object.values(this.playercards).forEach((value) => {
          let cards = this.shuffledHand.splice(0, 5);
          value = [...value, ...cards];
        });
        this.stage = this.StageEnum.STAGE3;
        return this.stageJson;
      case this.StageEnum.STAGE3:
        let type = this.CardType(data.cd);
        this.hokm = type;
        this.stage = this.StageEnum.STAGE4;
        return this.stageJson;
      case this.StageEnum.STAGE4:
        Object.values(this.playercards).forEach((value) => {
          let cards = this.shuffledHand.splice(0, 4);
          value = [...value, ...cards];
        });
        if (this.shuffledHand.length == 0) {
          this.stage = this.StageEnum.STAGE5;
        }
        return this.stageJson;
      case this.StageEnum.STAGE5:
        this.cardsOnGround[data.pn] = data.cd;
        index = this.playercards[data.pn].indexOf(data.cd);
        this.playercards[data.pn].splice(index, 1);
        this.cardsOnIndex++;
        if (this.cardsOnIndex == 1) {
          this.hand = this.CardType(data.cd);
        }
        if (this.cardsOnIndex == 4) {
          let winner = this.DecideWinner(this.cardsOnGround);
          if (winner.team == 0) {
            this.teamCount.team0++;
          } else {
            this.teamCount.team1++;
          }
          if (this.teamCount.team0 >= 7 && this.teamCount.team1 == 0) {
            this.teamScore.team0 += 2;
            this.tea;
          } else if (this.teamCount.team0 >= 7) {
            this.teamScore.team0++;
          }
          if (this.teamCount.team1 >= 7 && this.teamCount.team0 == 0) {
            this.teamScore.team1 += 2;
          } else if (this.teamCount.team1 >= 7) {
            this.teamScore.team1++;
          }
          this.nextPlayer = winner.nxpl;
          this.cardsOnIndex = 0;
          return this.stageJson;
        } else {
          if (this.nextPlayer == 3) {
            this.nextPlayer = 0;
          } else {
            this.nextPlayer++;
          }
          return this.stageJson;
        }
      case this.StageEnum.STAGE6:
        break;

      default:
        break;
    }
  }
  get stageJson() {
    return {
      nextPlayer: this.nextPlayer,
      cardsOnGround: this.cardsOnGround,
      ruler: this.ruler,
      hokm: this.hokm,
      stage: this.stage,
      playercards: this.playercards,
    };
  }
  DecideWinner(cards) {
    let x = [];
    Object.values(cards).forEach((value) => {
      x.push(value);
    });
    let hokms = this.DetectHokm(x);
    if (hokms.length > 0) {
      let Big = this.BigestCard(hokms);
      let index = x.indexOf(Big);
      return { nxpl: index, team: this.WitchTeam(index, false) };
    } else {
      let Big = this.BigestCard(x);
      let index = x.indexOf(Big);
      return { nxpl: index, team: this.WitchTeam(index, false) };
    }
  }
  BigestCard(x) {
    let card = 0;
    for (const key in x) {
      if (key > card.cd) {
        card = key;
      }
    }

    return card;
  }
  // SelectTeam(x, card, pn) {
  //   let team = 0;
  //   let index = x.indexOf(card);
  //   if (index == 1 || index == 3) {
  //     team = this.WitchTeam(pn, false);
  //   } else {
  //     team = this.WitchTeam(pn, true);
  //   }
  //   return team
  // }
  DetectHokm(x) {
    let hokm = [];
    for (const key in x) {
      let m = key - this.hokm;
      if (m > 0 && m < 15) {
        hokm.push(key);
      }
    }
    return hokm;
  }
  WitchTeam(x, reverse) {
    if (x == 0 || x == 2) {
      if (reverse) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (reverse) {
        return 0;
      } else {
        return 1;
      }
    }
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
  SelectNumber(x) {
    let m = x - 100;
    let res = m;
    if (m > 20) {
      res = SelectNumber(m);
    }
    return res;
  }
  CardType(x) {
    if (x > 400) {
      return 400;
    } else if (x > 300) {
      return 300;
    } else if (x > 200) {
      return 200;
    } else {
      return 100;
    }
  }
};
