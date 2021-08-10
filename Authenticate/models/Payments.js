const mongoose = require("mongoose");

const PaySchema = mongoose.Schema({
  code: {
    type: Number,
    require: true,
  },
  ref_id: {
    type: Number,
    require: true,
  },
  card_pan: {
    type: String,
    require: true,
  },
  card_hash: {
    type: String,
    require: true,
  },
  fee_type: {
    type: String,
    require: true,
  },
  fee: {
    type: String,
    require: true,
  },
});

const Pay = mongoose.model("payes", PaySchema);

module.exports = Pay;
