module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.send({ message: "You are logged in !", code: "ok" });
    }
    return next();
  },
};
