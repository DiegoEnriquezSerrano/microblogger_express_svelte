let mongoose = require("mongoose");
const path = require("path");

exports.indexPage = async (req, res) => {

  console.log('did it even touch this?');
  if (req.session.passport.user != null) {
    res.redirect( '/timeline'); 
  } else {
    res.redirect('/login');
  }
};

exports.timeline = (req, res) => {
  req.session.flash = ''
  res.sendFile( path.join(__dirname, "../../client", "public", "index.html"));
}

exports.drafts = (req, res, next) => {
  console.log(req.body);
  response = 'this is a response';
  console.log(response)
  res.send(response)
}