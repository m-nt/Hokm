const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multipart = require("multer");
const upload = multipart();
const User = require("../models/User");
const router = express.Router();
const { ensureAuthenticated } = require("../config/Auth");

router.post("/register", upload.single("Avatar"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  const { Username, Password, CPassword, Avatar, DeviceInfo } = req.body;
  deviceInfo = DeviceInfo ? DeviceInfo : "";
  avatar = req.file ? req.file.buffer : Buffer.alloc(0);
  const errors = [];
  if (!Username || !Password || !CPassword) {
    errors.push({ massage: "please fill in all the required fields !" });
  }
  if (Password != CPassword) {
    errors.push({ massage: "Passwords doesn't match !" });
  }
  if (Password.length < 6) {
    errors.push({ massage: "Password must be greater than 6 character !" });
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
        errors.push({ massage: "This Username is taken, try another one!" });
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
                  .then((user) => {
                    res.send({ massage: "register successfully done" });
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

router.post("/login", ensureAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/lgrg?error=username or password is incorrect !",
    failureFlash: false,
  })(req, res, next);
});
router.get("/logout", (req, res) => {
  req.logout();
});

module.exports = router;
