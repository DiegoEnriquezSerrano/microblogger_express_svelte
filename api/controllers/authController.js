let mongoose = require("mongoose");
const { promisify } = require('es6-promisify');
const passport = require('passport');
const path = require("path");
const Users = require('../models/Users');

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

exports.sendUser = async (req, res, next) => {
  console.log(req.session.passport.user);
  const user = await Users.findOne({
    email: req.session.passport.user
  })
  res.send(user);
}