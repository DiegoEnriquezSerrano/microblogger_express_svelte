let mongoose = require("mongoose");
let postSchema = mongoose.Schema({
  title: {
    type: String
  },
  body: {
    type: String,
    required: 'Your post cannot be empty!'
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

});
var Post = mongoose.model("Post", postSchema);
module.exports = Post;