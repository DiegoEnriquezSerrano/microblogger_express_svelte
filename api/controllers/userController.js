let mongoose = require("mongoose");
const User = require("../models/Users");
const { promisify } = require('es6-promisify');
const path = require("path");
const url = require('url');

exports.loginForm = (req, res) => {
  res.statusCode = 400;
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
};

exports.authenticate = (req, res) => {
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
};

exports.directory = (req, res) => {
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.directoryUsers = async (req, res) => {
  const users = await User.find();
  res.send(users);
}

exports.queryUser = async (req, res) => {
  let q = url.parse(req.url,  true);
  const user = await User.find({
    username: q.search.split('?')[1]
  });
  if (user[0] === undefined) {
    res.statusCode = 404;
    res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
  } else {
    console.log(user);
    res.send(user);
  };
};

exports.find = async (req, res, next) => {
  let q = url.parse(req.url,  true);
  const users = await User.find({
    username: q.pathname.split('/')[1]
  });
  if(users[0] === undefined) {
    res.statusCode = 404;
    res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
  } else {
    res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
  };
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('username');
  req.checkBody('username','You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').notEmpty();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.send(errors);
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, username: req.body.username });
  User.register(user, req.body.password, function(err, user) {
    try { user.save() }
    catch {
      if (err) {
        res.statusCode = 400;
        if (err.name != "UserExistsError") {
          err = { response: { type: 'error', name: "InvalidUsername", message: "A user with the given username is already registered" } }
        } else err = { response: { type: 'error', name: err.name, message: "A user with the given email is already registered" } };
      } res.send(err);
    }
    finally { user && next() };
  });
};