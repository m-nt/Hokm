const express = require("express");
const mongose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 8080;
//MongoDB URL
const URL = require("../conf.json").MongoURL;
const Options = require("../conf.json").MongoOpt;
const VIP = require("./models/vipticket");
const DEL_VIP = require("./models/deletedvip");
//passport config
require("./config/passport")(passport);
//mongose connection
mongose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

//Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
//passport midware
app.use(passport.initialize());
app.use(passport.session());

//Routes set up
app.use("/users", require("./routes/user"));
app.use("/pay", require("./routes/pay"));

// every two minutes check for vip expire time
setInterval(() => {
  VIP.findOneAndDelete({ expires: { $lt: Date.now() } }).then((vip) => {
    if (vip) {
      const del_vip = new DEL_VIP({
        name: vip.name,
        user_pk: vip.user_pk,
        expires: vip.expires,
      });
      del_vip.save();
    }
  });
}, 1000);

app.listen(PORT, console.log(`app listening on port:${PORT}`));
