let mongoose = require("mongoose");
const path = require("path");

exports.indexPage = async (req, res) => {
  if (req.session.passport.user != null) {
    res.redirect( '/timeline'); 
  } else {
    res.statusCode = 400;
    res.redirect('/login');
  }
};

exports.timeline = (req, res) => {
  req.session.flash = ''
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.drafts = (req, res) => {
  req.session.flash = ''
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.published = (req, res) => {
  req.session.flash = ''
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.liked = (req, res) => {
  req.session.flash = '';
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}