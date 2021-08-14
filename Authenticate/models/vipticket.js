const moongose = require("mongoose");

const vIP_1_month = new moongose.Schema({
  name: {
    type: string,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "30d",
  },
});
const vIP_2_month = new moongose.Schema({
  name: {
    type: string,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "60d",
  },
});
const vIP_3_month = new moongose.Schema({
  name: {
    type: string,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "90d",
  },
});

const VIP_1_month = moongose.model("VIP1", vIP_1_month);
const VIP_2_month = moongose.model("VIP2", vIP_2_month);
const VIP_3_month = moongose.model("VIP3", vIP_3_month);

module.exports = { VIP_1_month, VIP_2_month, VIP_1_month };
