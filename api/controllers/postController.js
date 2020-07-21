let mongoose = require("mongoose");
const path = require("path");
const Users = require("../models/Users");
const Post = require("../models/Post");
const { replaceOne } = require("../models/Post");

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

exports.timelinePosts = async (req, res, next) => {
  const posts = await Post.aggregate([
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { "user.hash": 0, "user.salt": 0, "user.email": 0 } }
  ]).sort( { created: -1 } );
  res.send(posts);
};

exports.published = (req, res) => {
  req.session.flash = '';
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
};

exports.publishedPosts = async (req, res, next) => {
  const user = await Users.findOne({ email: req.session.passport.user });
  if (user != {}) {
    const posts = await Post.aggregate([
      { $match: { "user": user._id } },
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { "user.hash": 0, "user.salt": 0, "user.email": 0 } },
    ]).sort( { created: -1 } );
    res.send(posts);
  };
};

exports.drafts = (req, res) => {
  req.session.flash = ''
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
};

exports.liked = (req, res) => {
  req.session.flash = '';
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
};

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

exports.relay = async (req, res) => {
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