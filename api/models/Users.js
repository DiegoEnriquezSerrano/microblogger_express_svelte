const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address',
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please supply a username',
  },
  password: {
    type: String,
    required: 'Please supply a password',
  },
  displayname: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
  },
  photo: String,
});

userSchema.pre("save", function (next) {
  const user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) { return next(saltError) }
      else {
        bcrypt.hash(user.password, salt, function(hashError, hash) {
          if (hashError) return next(hashError);
          user.password = hash;
          next();
        });
      }
    })
  } else {
    return next()
  }
});

userSchema.methods.comparePassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(error, isMatch) {
    if (error) {
      return callback(error)
    } else {
      callback(null, isMatch)
    }
  })
}

userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);