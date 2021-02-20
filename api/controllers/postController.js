let mongoose = require("mongoose");
const path = require("path");
const Users = require("../models/Users");
const Post = require("../models/Post");
const { send } = require("process");

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

exports.getTimelinePosts = async (req, res, next) => {
  const posts = await Post.aggregate([
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { "user.hash": 0, "user.salt": 0, "user.email": 0 } },
  ]).sort( { created: -1 } );
  req.posts = posts;
  next();
};

exports.timelineRelays = async (req, res, next ) => {
  const posts = req.posts;
  posts.forEach( async post => {
    if( post.relay_from_post != null ) {
      post.relay_from_post = await Post.findById(post.relay_from_post);
      console.log(post, 'post')
    };
  });
  req.posts = await posts;
  next();
};

exports.timelineRelayUsers = async ( req, res ) => {
  res.send(req.posts)
}

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
    body: req.body.body,
    relay_from_user: req.body.relay_from.user,
    relay_from_post: req.body.relay_from.post
  });
  await post.save();
  res.send(post);
}