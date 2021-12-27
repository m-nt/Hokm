//init imports
const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSMongoose = require("@adminjs/mongoose");
const express = require("express");
const mongose = require("mongoose");
const bcrypt = require("bcryptjs");
//express app
const app = express();
const PORT = process.env.PORT || 9090;
//MongoDB URL
const URL = require("./conf.json").MongoURL;
const Options = require("./conf.json").MongoOpt;
//Resources
const VIP = require("./models/vipticket");
const DEL_VIP = require("./models/deletedvip");
const FriendListModel = require("./models/friendlist");
const DeletedFriendListModel = require("./models/deletedfrndlist");
const User = require("./models/User");
const Report = require("./models/reports");
const Payments = require("./models/Payments");

AdminJS.registerAdapter(AdminJSMongoose);

process.env.SESSION_SECRET = "secret";
mongose
  .connect(URL, Options)
  .then((db) => {
    // admin panel
    const adminJs = new AdminJS({
      databases: [db],
      rootPath: "/admin",
    });
    const router = AdminJSExpress.buildAuthenticatedRouter(
      adminJs,
      {
        authenticate: async (Username, Password) => {
          const user = await User.findOne({ Username });
          if (user) {
            const matched = await bcrypt.compare(Password, user.Password);
            if (matched && user.role == "admin") {
              return user;
            }
          }
          return false;
        },
        cookiePassword: "some-secret-password-used-to-secure-cookie",
      },
      null,
      {
        resave: false,
        saveUninitialized: true,
      }
    );
    app.use(adminJs.options.rootPath, router);
    //app.use(express.urlencoded({ extended: false }));
    //app.use(express.json({ extended: false }));
    //Express session
    //app.use(
    //  session({
    //    secret: process.env.SESSION_SECRET,
    //    resave: true,
    //    saveUninitialized: true,
    //    cookie: {
    //      maxAge: 30 * 24 * 60 * 60 * 1000,
    //    },
    //  })
    //);
    app.listen(PORT, console.log(`app listening on port:${PORT}`));
    console.log(`mongoose conected to Data Base...`);
  })
  .catch((err) => console.log(err));
