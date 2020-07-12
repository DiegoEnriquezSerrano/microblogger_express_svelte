const passport = require('passport');
const path = require("path");

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.statusCode = 400;
    res.redirect('/login');
  };
};