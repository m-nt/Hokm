const moongose = require("mongoose");

const Report = new moongose.Schema({
  name: {
    type: String,
    require: true,
  },
  user_pk: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: Date,
    require: true,
  },
});

const Report = moongose.model("Reports", vIP);
// const VIP_2_month = moongose.model("VIP2", vIP_2_month);
// const VIP_3_month = moongose.model("VIP3", vIP_3_month);

// module.exports = { VIP_1_month, VIP_2_month, VIP_3_month };
module.exports = Report;
