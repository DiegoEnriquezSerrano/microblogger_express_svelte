let mongoose = require("mongoose");
const { promisify } = require('es6-promisify');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require("path");
const User = require('../models/Users');

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
  const user = await User.findOne({
    email: req.session.passport.user
  })
  res.send(user);
}

exports.register = async (req, res, next) => {
  await User.findOne({ email: req.body.email })
    .then(async (existing_user) => {
      if (existing_user) {
        res.statusCode = 403;
        res.send({ error: 'user already exists' })
      } else {
        const user = await new User({
          email: req.body.email,
          password: req.body.password,
          username: req.body.username
        });
        user.save((error) => { error ? next({error: true}) : next({success: true}) });
        let token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
          data: { user: user._id }
        }, process.env.ACCESS_TOKEN_SECRET);
        res.cookie('microblogger', token, { httpOnly: true });
        res.statusCode = 201;
        res.send({ user: { id: user._id } });
      }
    })
}

exports.login = async (req, res, next) => {
  await User.findOne({ email: req.body.email }).exec(function(error, user) {
    if (error) {
      res.statusCode = 401;
      res.send({ error: 'Authentication Failure.' });
    } else if (!user) {
      res.statusCode = 401;
      res.send({ error: 'Authentication Failure.' });
    } else {
      user.comparePassword(req.body.password, function(matchError, isMatch) {
        if (matchError) {
          res.statusCode = 401;
          res.send({ error: 'Authentication Failure.' });
        } else if (!isMatch) {
          res.statusCode = 401;
          res.send({ error: 'Authentication Failure.' });
        } else {
          let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            data: { user: user._id }
          }, process.env.ACCESS_TOKEN_SECRET);
          res.cookie('microblogger', token, { httpOnly: true });
          res.statusCode = 201;
          res.send({ user: { id: user._id } });
        }
      })
    }
  })
}