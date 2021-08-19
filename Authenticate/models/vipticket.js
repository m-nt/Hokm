const moongose = require("mongoose");

const vIP = new moongose.Schema({
  name: {
    type: String,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  expires: {
    type: Date,
    require: true,
  },
});
// const vIP_2_month = new moongose.Schema({
//   name: {
//     type: String,
//     require: true,
//     default: "2 month VIP sub",
//   },
//   user_pk: {
//     type: moongose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     expires: "60d",
//   },
// });
// const vIP_3_month = new moongose.Schema({
//   name: {
//     type: String,
//     require: true,
//     default: "3 month VIP sub",
//   },
//   user_pk: {
//     type: moongose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     expires: "90d",
//   },
// });

const VIP = moongose.model("VIP", vIP);
// const VIP_2_month = moongose.model("VIP2", vIP_2_month);
// const VIP_3_month = moongose.model("VIP3", vIP_3_month);

// module.exports = { VIP_1_month, VIP_2_month, VIP_3_month };
module.exports = VIP;
