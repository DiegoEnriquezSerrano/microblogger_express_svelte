let mongoose = require("mongoose");
const User = require("../models/Users");
const { promisify } = require('es6-promisify');
const path = require("path");
const multer = require("multer");
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    };
  }
};

exports.upload = multer(multerOptions).single('file');

exports.resize = async (req, res, next) => {
  if( !req.file ) { next(); return; }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(500,jimp.AUTO);
  await photo.write( path.join(__dirname, "../../client", 'public', 'assets', 'uploads', `${req.body.photo}`) );
  next();
};

exports.updateProfile = async (req, res) => {
  const updates = {
    name: req.body.username,
    displayname: req.body.displayname || null,
    bio: req.body.bio || null,
  }
  if (req.body.photo) updates.photo = req.body.photo;
  const user = await User.findOneAndUpdate(
    { _id: req.user._id},
    { $set: updates },
    { new: true, runValidators: true, context: 'query'}
  );
  res.json(user);
};

exports.profile = (req, res) => {
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.account = (req, res) => {
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}