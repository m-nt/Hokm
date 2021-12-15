const { Logger } = require("../tools/utils");
module.exports = class Stage {
  StageEnum = {
    STAGE0: "0,idle",
    STAGE1: "1,decide the ruler",
    STAGE2: "2,send first 5 sets of cards",
    STAGE3: "3,decide the hokm",
    STAGE4: "4,send cards 4 by 4",
    STAGE5: "5,paly the cards",
    STAGE6: "6,reset the hand",
  };
  constructor() {
    this.cards = [
      102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
      212, 213, 214, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 402, 403, 404, 405, 406, 407, 408,
      409, 410, 411, 412, 413, 414,
    ];
    this.playercards = { P0: [], P1: [], P2: [], P3: [] };
    this.teamCount = { team0: 0, team1: 0 };
    this.teamScore = { team0: 0, team1: 0 };
    this.shuffledHand = [];
    this.cardsOnGround = { C0: 0, C1: 0, C2: 0, C3: 0 };
    this.cardsOnIndex = 0;
    this.hokm = 0;
    this.ruler = -1;
    this.nextPlayer = 0;
    this.playedPlayer = 0;
    this.hand = 0;
    this.stage = this.StageEnum.STAGE0;
    this.readyNext = false;
    this.timeout = 3000;
    this.msg = "";
  }
  nextStage() {
    if (this.readyNext) {
      switch (this.stage) {
        case this.StageEnum.STAGE0:
          this.stage = this.StageEnum.STAGE1;
          break;
        case this.StageEnum.STAGE1:
          this.stage = this.StageEnum.STAGE2;
          break;
        case this.StageEnum.STAGE2:
          this.stage = this.StageEnum.STAGE3;
          break;
        case this.StageEnum.STAGE3:
          this.stage = this.StageEnum.STAGE4;
          break;
        case this.StageEnum.STAGE4:
          this.stage = this.StageEnum.STAGE5;
          break;
        case this.StageEnum.STAGE5:
          this.stage = this.StageEnum.STAGE6;
          break;
        default:
          break;
      }
    }
    this.readyNext = false;
  }
  next(data) {
    switch (this.stage) {
      case this.StageEnum.STAGE0:
        this.shuffledHand = this.shuffleTheHand();
        this.readyNext = true;
        this.Logger({ pn: -1, cd: -1 });
        return this.stageJson;
      case this.StageEnum.STAGE1:
        let cards = this.shuffledHand.splice(0, 4);
        for (let i = 0; i < cards.length; i++) {
          this.cardsOnGround["C" + i.toString()] = cards[i];
        }
        let result = this.stageJson;
        cards.map((value, index) => {
          if (this.SelectNumber(value) == 14) {
            this.readyNext = true;
            this.ruler = index;
            this.nextPlayer = index;
            this.playedPlayer = index;
            this.shuffledHand = this.shuffleTheHand();
            result = this.stageJson;
            return;
          }
        });
        this.Logger({ pn: -1, cd: -1 });
        return result;
      case this.StageEnum.STAGE2:
        Object.keys(this.cardsOnGround).forEach((key) => {
          this.cardsOnGround[key] = 0;
        });
        Object.keys(this.playercards).forEach((key) => {
          let cards = this.shuffledHand.splice(0, 5);
          this.playercards[key] = [...this.playercards[key], ...cards];
        });
        this.readyNext = true;
        this.timeout = 60000;
        this.Logger({ pn: -1, cd: -1 });
        return this.stageJson;
      case this.StageEnum.STAGE3:
        let type = this.CardType(data.cd);
        this.hokm = type;
        this.readyNext = true;
        this.timeout = 5000;
        this.Logger(data);
        return this.stageJson;
      case this.StageEnum.STAGE4:
        Object.keys(this.playercards).forEach((key) => {
          let cards = this.shuffledHand.splice(0, 4);
          this.playercards[key] = [...this.playercards[key], ...cards];
        });
        if (this.shuffledHand.length == 0) {
          //this.readyNext = true;
          this.stage = this.StageEnum.STAGE5;
          this.msg = "OK4";
          this.timeout = 60000;
        }
        this.Logger(data);
        return this.stageJson;
      case this.StageEnum.STAGE5:
        if (this.cardsOnIndex == 0) {
          Object.keys(this.cardsOnGround).forEach((key) => {
            this.cardsOnGround[key] = 0;
          });
        }
        this.msg = "";
        this.cardsOnGround["C" + data.pn] = data.cd;
        let index = this.playercards["P" + data.pn].indexOf(data.cd);
        this.playercards["P" + data.pn].splice(index, 1);
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
          } else if (this.teamCount.team0 >= 7) {
            this.teamScore.team0++;
          }
          if (this.teamCount.team1 >= 7 && this.teamCount.team0 == 0) {
            this.teamScore.team1 += 2;
          } else if (this.teamCount.team1 >= 7) {
            this.teamScore.team1++;
          }
          this.nextPlayer = winner.nxpl;
          this.playedPlayer = winner.nxpl;
          this.cardsOnIndex = 0;

          // initiate next round
          if (this.teamCount.team0 >= 7 || this.teamCount.team1 >= 7) {
            this.stage = this.StageEnum.STAGE6;
            this.timeout = 5000;
          }

          if (this.teamScore.team0 >= 7 || this.teamScore.team1 >= 7) {
            //this.stage = this.StageEnum.STAGE6;
            this.Logger(data);
            return { ...this.stageJson, msg: "end" };
          }
          this.Logger(data);
          return this.stageJson;
        } else {
          if (this.nextPlayer == 3) {
            this.nextPlayer = 0;
            this.playedPlayer = 3;
          } else {
            this.playedPlayer = this.nextPlayer;
            this.nextPlayer++;
          }
          this.Logger(data);
          return this.stageJson;
        }
      case this.StageEnum.STAGE6:
        if (this.teamCount.team0 >= 7) {
          this.ResetTheMatch(0);
        } else {
          this.ResetTheMatch(1);
        }
        this.Logger(data);
        return this.stageJson;
      default:
        break;
    }
  }
  get stageJson() {
    return {
      msg: this.msg,
      timeout: this.timeout,
      nextPlayer: this.nextPlayer,
      playedPlayer: this.playedPlayer,
      cardsOnGround: this.cardsOnGround,
      ruler: this.ruler,
      hokm: this.hokm,
      stage: this.stage,
      playerCards: this.playercards,
      teamCount: this.teamCount,
      teamScore: this.teamScore,
      hand: this.hand,
    };
  }
  Logger(data) {
    Logger(`
    ************************** stage: ${this.stage} ****************************
    [+]data: {pn:${data.pn}, cd:${data.cd}} - msg:[${this.msg}] 
    [+]played player:[${this.playedPlayer}] - next player:[${this.nextPlayer}]
    [+]Cards on the ground: [${this.cardsOnGround.C0},${this.cardsOnGround.C1},${this.cardsOnGround.C2},${this.cardsOnGround.C3}]
    [+]ruler:[${this.ruler}] - hokm:[${this.hokm}] - hand:[${this.hand}]
    [+]cards index:[${this.cardsOnIndex}] - timeout:[${this.timeout}]
    [+]team counts: team0:[${this.teamCount.team0}] - team1:[${this.teamCount.team1}]
    [+]team Scores: team0:[${this.teamScore.team0}] - team1:[${this.teamScore.team1}]
    [+]Player 0:${this.playercards.P0}
    [+]Player 1:${this.playercards.P1}
    [+]Player 2:${this.playercards.P2}
    [+]Player 3:${this.playercards.P3}
    ****************************************************************************
    `);
  }
  ResetTheMatch(team) {
    this.teamCount.team0 = 0;
    this.teamCount.team1 = 0;
    this.stage = this.StageEnum.STAGE2;
    if (this.WitchTeam(this.ruler, true) == team) {
      if (this.ruler == 3) {
        this.ruler == 0;
      } else {
        this.ruler++;
      }
    }
    this.nextPlayer = this.ruler;
    this.playedPlayer = this.ruler;
    this.shuffledHand = this.shuffleTheHand();
    Object.keys(this.playercards).forEach((key) => {
      this.playercards[key] = [];
    });
    Object.keys(this.cardsOnGround).forEach((key) => {
      this.cardsOnGround[key] = 0;
    });
    Object.keys(this.playercards).forEach((key) => {
      let cards = this.shuffledHand.splice(0, 5);
      this.playercards[key] = [...this.playercards[key], ...cards];
    });
    this.readyNext = true;
    this.timeout = 120000;
    this.hokm = 0;
    this.hand = 0;
  }
  DecideWinner(cards) {
    let x = [];
    Object.values(cards).forEach((value) => {
      x.push(value);
    });
    let hokms = this.DetectType(x, this.hokm);
    let hand = this.DetectType(x, this.hand);
    if (hokms.length > 0) {
      let Big = this.BigestCard(hokms);
      let index = x.indexOf(Big);
      return { nxpl: index, team: this.WitchTeam(index, false) };
    } else {
      let Big = this.BigestCard(hand);
      let index = x.indexOf(Big);
      return { nxpl: index, team: this.WitchTeam(index, false) };
    }
  }
  BigestCard(x) {
    let card = 0;
    x.forEach((key) => {
      if (key > card) {
        card = key;
      }
    });

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
    let cardHolder = [...this.cards];
    let cards = [];
    for (let i = 0; i < this.cards.length; i++) {
      let index = Math.floor(Math.random() * cardHolder.length);
      cards.push(cardHolder[index]);
      cardHolder.splice(index, 1);
    }
    return cards;
  }
  SelectNumber(x) {
    let m = x - 100;
    let res = m;
    if (m > 20) {
      res = this.SelectNumber(m);
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
