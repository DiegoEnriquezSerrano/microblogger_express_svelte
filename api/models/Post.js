let mongoose = require("mongoose");

let postSchema = mongoose.Schema({
  title: {
    type: String
  },
  body: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author!'
  },
  created: {
    type: Date,
    default: Date.now()
  },
  relay_from_user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  relay_from_post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  }
});
var Post = mongoose.model("Post", postSchema);
module.exports = Post;