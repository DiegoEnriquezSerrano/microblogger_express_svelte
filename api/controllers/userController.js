let mongoose = require("mongoose");
const User = require("../models/Users");
const { promisify } = require('es6-promisify');
const path = require("path");

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

exports.validateRegister = (req, res, next) => {
  console.log(req.body);
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