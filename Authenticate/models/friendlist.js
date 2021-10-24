const mongoose = require("mongoose");

const FriendList = mongoose.Schema({
  request: {
    type: String,
    enum: ["ACCEPTED", "PENDING", "REJECTED"],
    default: "PENDING",
  },
  user_pk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const FriendListModel = mongoose.model("FriendList", FriendList);

module.exports = FriendListModel;
