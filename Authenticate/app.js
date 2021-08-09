const express = require("express");
const mongose = require("mongoose");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 8080;
//MongoDB URL
const URL = require("../conf.json").MongoURL;
const Options = require("../conf.json").MongoOpt;

//passport config
require("./config/passport")(passport);
//mongose connection
mongose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));

//Body Parser
app.use(express.urlencoded({ extended: false }));

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

app.listen(PORT, console.log(`app listening on port:${PORT}`));
