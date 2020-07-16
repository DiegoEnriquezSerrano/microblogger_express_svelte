let mongoose = require("mongoose");
const path = require("path");
const Users = require("../models/Users");
const Post = require("../models/Post");

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

exports.createPost = async (req, res) => {
  user = await Users.findOne({
    email: req.session.passport.user
  });
  const post = new Post({
    user: user._id,
    body: req.body.body
  });
  await post.save();
  res.send(post);
}