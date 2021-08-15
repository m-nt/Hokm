const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const { merchant_id, callback_url, metadata } = require("../../conf.json");
const Pay = require("../models/Payments");
const { IsAuthenticated } = require("../config/Auth");
const User = require("../models/User");

router.post("/init", IsAuthenticated, (req, res) => {
  const { amount, description } = req.body;

  if (!amount || !description) {
    res.send({ message: "amount or description of payment is not set !", code: "nok" });
  }
  console.log(typeof req.user._id);
  var payment_id = "";
  const paym = new Pay({ amount: amount });
  paym.save().then((payment) => {
    payment_id = payment.id;
    console.log(payment.id);
  });

  res.send({
    message: "use this data for generate payment",
    code: "ok",
    data: {
      merchant_id,
      amount,
      payment_id,
      description,
      callback_url,
      metadata,
    },
  });
});
router.get("/callback", (req, res) => {
  Authority = req.query.Authority;
  Status = req.query.Status;
  if (Status === "ok") {
    res.send("Payment Seccussful");
  } else if (Status === "nok") {
    res.send("Payment Failed");
  } else {
    res.send("Unkown result");
  }
});
router.post("/payment", (req, res) => {
  {
  }
});
module.exports = router;
