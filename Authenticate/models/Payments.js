const mongoose = require("mongoose");

const PaySchema = mongoose.Schema({
  code: {
    type: Number,
    require: false,
  },
  amount: {
    type: Number,
    require: false,
  },
  ref_id: {
    type: Number,
    require: false,
  },
  card_pan: {
    type: String,
    require: false,
  },
  card_hash: {
    type: String,
    require: false,
  },
  fee_type: {
    type: String,
    require: false,
  },
  fee: {
    type: String,
    require: false,
  },
});

const Pay = mongoose.model("Payes", PaySchema);
module.exports = Pay;
