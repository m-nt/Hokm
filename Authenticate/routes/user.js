const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multipart = require("multer");
const upload = multipart();
const User = require("../models/User");
//const { VIP_1_month, VIP_2_month, VIP_3_month } = require("../models/vipticket");
const VIP = require("../models/vipticket");
const router = express.Router();
const { IsAuthenticated } = require("../config/Auth");

router.post("/register", upload.single("Avatar"), (req, res) => {
  const { Username, Password, CPassword, DeviceInfo } = req.body;
  deviceInfo = DeviceInfo ? DeviceInfo : "";
  avatar = req.file ? req.file.buffer : Buffer.alloc(0);
  const errors = [];
  if (!Username || !Password || !CPassword) {
    errors.push({ message: "please fill in all the required fields !", code: "nok" });
  }
  if (Password != CPassword) {
    errors.push({ message: "Passwords doesn't match !", code: "nok" });
  }
  if (Password.length < 6) {
    errors.push({ message: "Password must be greater than 6 character !", code: "nok" });
  }

  if (errors.length > 0) {
    res.send({
      errors,
      Username,
      Password,
      CPassword,
    });
  } else {
    User.findOne({ Username: Username }).then((user) => {
      if (user) {
        errors.push({ message: "This Username is taken, try another one!", code: "nok" });
        res.send({
          errors,
          Username,
          Password,
          CPassword,
        });
      } else {
        const NewUser = new User({
          Username,
          Password,
          Avatar: avatar,
          DeviceInfo: deviceInfo,
        });
        bcrypt
          .genSalt(15)
          .then((salt) => {
            bcrypt
              .hash(NewUser.Password, salt)
              .then((hash) => {
                NewUser.Password = hash;
                NewUser.save()
                  .then((_user) => {
                    res.send({ message: "register successfully done", code: "ok", user: _user });
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

router.post("/loggin", upload.none(), passport.authenticate("local"), (req, res) => {
  res.send({ message: "You are logged in !", code: "ok", user: req.user });
});
router.post("/checkloggin", IsAuthenticated, (req, res) => {
  res.send({ message: "You are logged in !", code: "ok", user: req.user });
});
router.post("/loggout", (req, res) => {
  req.logout();
  res.send({ message: "You are logged out !", code: "ok" });
});
router.post("/leaderboard", IsAuthenticated, (req, res) => {
  limit = 30;
  if (req.body.limit) {
    lim = parseInt(req.body.limit);
    if (lim) {
      limit = lim;
    } else {
      limit = 30;
    }
  }
  User.find({})
    .sort({ Curency: -1 })
    .limit(limit)
    .then((result) => {
      res.send({ message: result, code: "ok" });
    })
    .catch((err) => {
      if (err) res.send({ message: "failed to retrieve players !", code: "tok" });
    });
});
router.post("/viptest", upload.none(), IsAuthenticated, (req, res) => {
  User.findOne({ Username: req.user.Username })
    .then((user) => {
      date = new Date(req.body.expires);
      const vip = new VIP({
        name: req.body.name,
        user_pk: user._id,
        expires: date,
      });
      vip.save();
      res.send({ vip });
    })
    .catch((err) => {
      res.send(err);
    });
});
module.exports = router;
